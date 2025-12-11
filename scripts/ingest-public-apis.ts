import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

interface PublicApi {
  name: string;
  description: string;
  auth?: string;
  https?: string;
  cors?: string;
  category: string;
  link: string;
}

interface ParseResult {
  apis: PublicApi[];
  rawContent: string;
}

class PublicApiIngestor {
  private prisma: PrismaClient;
  private debug: boolean = false;

  constructor(debug: boolean = false) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    this.prisma = new PrismaClient({ adapter });
    this.debug = debug;
  }

  /**
   * Fetch the public-apis README.md from GitHub
   */
  async fetchPublicApisMarkdown(): Promise<string> {
    const url = 'https://raw.githubusercontent.com/public-apis/public-apis/master/README.md';
    
    try {
      console.log('Fetching public-apis list from GitHub...');
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'public-api-ingestor/1.0',
        },
      });
      
      if (this.debug) {
        this.saveRawSnapshot(response.data, 'public-apis-raw.md');
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch public-apis: ${error.message} (Status: ${error.response?.status})`);
      }
      throw new Error(`Failed to fetch public-apis: ${error}`);
    }
  }

  /**
   * Parse markdown content to extract API data
   */
  parseMarkdownContent(content: string): ParseResult {
    try {
      console.log('Parsing markdown content...');
      
      // Split content into sections
      const lines = content.split('\n');
      const apis: PublicApi[] = [];
      
      let currentCategory = '';
      let tableStarted = false;
      let headerColumns: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect category headers (## followed by category name)
        if (line.startsWith('## ') && !line.includes('Table of Contents')) {
          currentCategory = line.substring(3).trim();
          tableStarted = false;
          console.log(`Found category: ${currentCategory}`);
          continue;
        }
        
        // Detect table headers
        if (line.includes('|') && line.toLowerCase().includes('name') && line.toLowerCase().includes('description')) {
          headerColumns = this.parseTableHeader(line);
          tableStarted = true;
          continue;
        }
        
        // Skip separator rows
        if (tableStarted && line.includes('---')) {
          continue;
        }
        
        // Parse data rows
        if (tableStarted && line.includes('|') && !line.includes('**') && currentCategory) {
          const rowData = this.parseTableRow(line);
          if (rowData.length > 0) {
            const api = this.mapRowToApi(rowData, headerColumns, currentCategory);
            if (api && api.name && api.link) {
              apis.push(api);
            }
          }
        }
      }
      
      console.log(`Parsed ${apis.length} APIs from ${new Set(apis.map(api => api.category)).size} categories`);
      return { apis, rawContent: content };
    } catch (error) {
      throw new Error(`Failed to parse markdown content: ${error}`);
    }
  }

  /**
   * Parse table header to get column indices
   */
  private parseTableHeader(headerLine: string): string[] {
    const columns = headerLine.split('|')
      .map(col => col.trim())
      .filter(col => col.length > 0);
    
    return columns.map(col => col.toLowerCase().replace(/\s+/g, ''));
  }

  /**
   * Parse a table row to extract cell data
   */
  private parseTableRow(rowLine: string): string[] {
    return rowLine.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);
  }

  /**
   * Map table row data to API object
   */
  private mapRowToApi(rowData: string[], headerColumns: string[], category: string): PublicApi | null {
    if (rowData.length === 0) return null;

    const api: PublicApi = {
      name: '',
      description: '',
      category: category,
      link: '',
    };

    // Map common column patterns
    const getColumnIndex = (possibleNames: string[]): number => {
      for (let i = 0; i < headerColumns.length; i++) {
        const header = headerColumns[i];
        for (const name of possibleNames) {
          if (header.includes(name)) {
            return i;
          }
        }
      }
      return -1;
    };

    // Name
    const nameIndex = getColumnIndex(['name']);
    if (nameIndex >= 0 && rowData[nameIndex]) {
      api.name = rowData[nameIndex].replace(/\*\*/g, '').trim();
    }

    // Description
    const descIndex = getColumnIndex(['description', 'desc']);
    if (descIndex >= 0 && rowData[descIndex]) {
      api.description = rowData[descIndex].replace(/\*\*/g, '').trim();
    }

    // Auth
    const authIndex = getColumnIndex(['auth', 'authentication']);
    if (authIndex >= 0 && rowData[authIndex] && rowData[authIndex] !== 'null') {
      (api as any).auth = rowData[authIndex];
    }

    // HTTPS
    const httpsIndex = getColumnIndex(['https']);
    if (httpsIndex >= 0 && rowData[httpsIndex]) {
      api.https = rowData[httpsIndex];
    }

    // Cors
    const corsIndex = getColumnIndex(['cors', 'corssupport']);
    if (corsIndex >= 0 && rowData[corsIndex]) {
      api.cors = rowData[corsIndex];
    }

    // Link
    const linkIndex = getColumnIndex(['link', 'url']);
    if (linkIndex >= 0 && rowData[linkIndex]) {
      const link = rowData[linkIndex].replace(/\*\*/g, '').trim();
      // Handle relative and absolute links
      if (link.startsWith('http')) {
        api.link = link;
      } else if (link.startsWith('github.com')) {
        api.link = `https://${link}`;
      } else if (link.startsWith('www.')) {
        api.link = `https://${link}`;
      } else if (link) {
        api.link = link;
      }
    }

    return api;
  }

  /**
   * Ingest API data into the database
   */
  async ingestApis(apis: PublicApi[]): Promise<void> {
    console.log('Starting database ingestion...');
    
    const stats = {
      total: apis.length,
      created: 0,
      updated: 0,
      errors: 0,
      categories: new Set<string>(),
      authMethods: new Set<string>(),
    };

    for (let i = 0; i < apis.length; i++) {
      const api = apis[i];
      
      try {
        await this.upsertApi(api);
        
        if (api.auth) {
          stats.authMethods.add(api.auth);
        }
        stats.categories.add(api.category);
        
        stats.created++; // upsert increments regardless, but we'll track created/updated separately
        
        if (i % 50 === 0) {
          console.log(`Processed ${i + 1}/${apis.length} APIs...`);
        }
      } catch (error) {
        console.error(`Error processing API "${api.name}":`, error);
        stats.errors++;
      }
    }

    // Print summary
    console.log('\n=== Ingestion Summary ===');
    console.log(`Total APIs processed: ${stats.total}`);
    console.log(`Categories found: ${stats.categories.size}`);
    console.log(`Auth methods found: ${stats.authMethods.size}`);
    console.log(`Successful operations: ${stats.total - stats.errors}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Categories: ${Array.from(stats.categories).join(', ')}`);
    console.log(`Auth methods: ${Array.from(stats.authMethods).join(', ')}`);
  }

  /**
   * Upsert a single API record
   */
  private async upsertApi(api: PublicApi): Promise<void> {
    // Upsert category
    const category = await this.prisma.category.upsert({
      where: { name: api.category },
      update: {},
      create: { name: api.category },
    });

    // Upsert auth method if present
    let auth = null;
    if (api.auth) {
      auth = await this.prisma.auth.upsert({
        where: { name: api.auth },
        update: {},
        create: { name: api.auth },
      });
    }

    // Parse HTTPS boolean
    const https = api.https ? api.https.toLowerCase() === 'yes' : false;

    // Upsert API with idempotent behavior (name + link as unique identifier)
    const existingApi = await this.prisma.api.findFirst({
      where: {
        name: api.name,
        link: api.link,
      },
    });

    if (existingApi) {
      // Update existing API
      await this.prisma.api.update({
        where: { id: existingApi.id },
        data: {
          description: api.description,
          https: https,
          cors: api.cors || undefined,
          lastFetched: new Date(),
          updatedAt: new Date(),
        },
      });

      // Update relationships
      await this.updateApiRelationships(existingApi.id, category.id, auth?.id);
    } else {
      // Create new API
      const newApi = await this.prisma.api.create({
        data: {
          name: api.name,
          description: api.description,
          link: api.link,
          https: https,
          cors: api.cors || undefined,
          categories: {
            connect: { id: category.id },
          },
          reliabilityStats: {
            create: {
              uptime: null,
              latency: null,
              lastChecked: null,
            },
          },
        },
      });

      // Connect auth method if present
      if (auth) {
        await this.prisma.api.update({
          where: { id: newApi.id },
          data: {
            authMethods: {
              connect: { id: auth.id },
            },
          },
        });
      }
    }
  }

  /**
   * Update API relationships
   */
  private async updateApiRelationships(apiId: number, categoryId: number, authId?: number): Promise<void> {
    // Update category relationships
    const existingCategories = await this.prisma.api.findUnique({
      where: { id: apiId },
      include: { categories: true },
    });

    if (!existingCategories) return;

    const hasCategory = existingCategories.categories.some(cat => cat.id === categoryId);
    if (!hasCategory) {
      await this.prisma.api.update({
        where: { id: apiId },
        data: {
          categories: {
            connect: { id: categoryId },
          },
        },
      });
    }

    // Update auth relationships if authId is provided
    if (authId) {
      const existingAuths = await this.prisma.api.findUnique({
        where: { id: apiId },
        include: { authMethods: true },
      });

      if (existingAuths) {
        const hasAuth = existingAuths.authMethods.some(auth => auth.id === authId);
        if (!hasAuth) {
          await this.prisma.api.update({
            where: { id: apiId },
            data: {
              authMethods: {
                connect: { id: authId },
              },
            },
          });
        }
      }
    }
  }

  /**
   * Save raw snapshot for debugging
   */
  private saveRawSnapshot(content: string, filename: string): void {
    const snapshotsDir = path.join(__dirname, '..', 'snapshots');
    
    if (!fs.existsSync(snapshotsDir)) {
      fs.mkdirSync(snapshotsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filepath = path.join(snapshotsDir, `${timestamp}-${filename}`);
    
    fs.writeFileSync(filepath, content);
    console.log(`Saved raw snapshot to: ${filepath}`);
  }

  /**
   * Run the complete ingestion process
   */
  async run(): Promise<void> {
    try {
      console.log('=== Public APIs Ingestion Script ===');
      console.log('Starting ingestion process...\n');

      // Step 1: Fetch data
      const rawContent = await this.fetchPublicApisMarkdown();

      // Step 2: Parse content
      const { apis } = this.parseMarkdownContent(rawContent);

      if (apis.length === 0) {
        throw new Error('No APIs found in the fetched content');
      }

      // Step 3: Ingest into database
      await this.ingestApis(apis);

      console.log('\nIngestion completed successfully!');
    } catch (error) {
      console.error('\n=== Ingestion Failed ===');
      console.error(`Error: ${error}`);
      process.exit(1);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// CLI handling
async function main() {
  const debug = process.argv.includes('--debug');
  
  const ingestor = new PublicApiIngestor(debug);
  await ingestor.run();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
