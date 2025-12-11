# Public APIs Ingestion Script

This document describes how to use the data ingestion script to fetch and populate the database with public APIs from the public-apis repository.

## Overview

The ingestion script fetches the public-apis list from GitHub, parses the markdown content to extract API information, and stores it in the database using Prisma. The script handles:

- **Idempotent updates**: Uses upsert operations to avoid duplicate entries
- **Error handling**: Graceful network and parsing error handling with retry logic
- **Raw snapshots**: Stores fetched content for debugging purposes
- **Progress tracking**: Logs summary counts and progress during ingestion

## Prerequisites

- Node.js 18+ 
- PostgreSQL database running
- Database URL configured in `.env` file

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your `.env` file with the database URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run database migrations:
```bash
npm run db:migrate
```

## Usage

### Basic Ingestion

Run the ingestion script:

```bash
npm run ingest
```

This will:
1. Fetch the latest public-apis list from GitHub
2. Parse the markdown content to extract API data
3. Upsert API, category, and auth method data into the database
4. Display summary statistics

### Debug Mode

For detailed debugging information:

```bash
npm run ingest:debug
```

This additionally saves raw snapshots of the fetched content to the `snapshots/` directory.

### CLI Usage

You can also run the script directly with ts-node:

```bash
ts-node scripts/ingest-public-apis.ts
ts-node scripts/ingest-public-apis.ts --debug
```

## Script Behavior

### Data Processing

The script processes the public-apis markdown as follows:

1. **Fetches** the README.md from the public-apis repository
2. **Parses** sections to identify categories and API tables
3. **Extracts** API information including:
   - Name and description
   - Authentication method
   - HTTPS support
   - CORS support
   - Category classification
   - API endpoint URL

### Database Schema

The script populates the following models:

- **Api**: Core API information with fields like name, description, link, HTTPS support, and CORS
- **Category**: API categories with many-to-many relationship to APIs
- **Auth**: Authentication methods with many-to-many relationship to APIs
- **ReliabilityStats**: Placeholder statistics for uptime and latency (created but not populated)
- **Throttling**: Rate limiting information (created but not populated)

### Error Handling

- **Network errors**: Retries with descriptive error messages
- **Parse errors**: Continues processing other entries if one fails
- **Database errors**: Logs errors and continues with other APIs
- **Exit codes**: Returns non-zero exit code on failure

### Idempotent Operations

The script uses upsert operations to ensure:
- **New APIs**: Are created if they don't exist
- **Existing APIs**: Are updated with fresh data
- **Categories and Auth**: Are created on first use and reused for subsequent APIs

## Output and Logging

### Progress Reports

The script provides detailed logging:

```
=== Public APIs Ingestion Script ===
Starting ingestion process...

Fetching public-apis list from GitHub...
Found category: Authentication
Found category: Business
Found category: Development
...
Parsed 1500 APIs from 25 categories

Starting database ingestion...
Processed 50/1500 APIs...
Processed 100/1500 APIs...
...
=== Ingestion Summary ===
Total APIs processed: 1500
Categories found: 25
Auth methods found: 8
Successful operations: 1495
Errors: 5
Categories: Authentication, Business, Development, Finance, ...
Auth methods: ApiKey, OAuth, No-Auth, Bearer Token, ...

Ingestion completed successfully!
```

### Summary Statistics

After completion, the script displays:
- Total APIs processed
- Number of categories found
- Number of authentication methods
- Success/error counts
- Lists of categories and auth methods

## Database Operations

### Create vs Update Tracking

While the script uses upsert operations, it tracks:
- **Total operations**: All processed APIs
- **Errors**: Count of failed operations
- **Categories discovered**: Unique categories found
- **Auth methods discovered**: Unique authentication methods found

### Relationship Management

The script manages many-to-many relationships:
- **API ↔ Category**: Connects each API to its category
- **API ↔ Auth Method**: Connects APIs to their authentication requirements

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check database permissions

2. **Network Timeout**
   - Check internet connection
   - GitHub might be temporarily unavailable

3. **Parse Errors**
   - Run in debug mode to see raw snapshots
   - Check if public-apis repository format changed

### Debug Mode

Use debug mode to troubleshoot issues:

```bash
npm run ingest:debug
```

This creates timestamped snapshot files in the `snapshots/` directory containing:
- Raw markdown content from GitHub
- Parsed data for manual inspection

### Log Analysis

Check the console output for:
- Fetch status and errors
- Category detection results
- Processing progress updates
- Final summary statistics
- Any error messages with specific API names

## File Structure

After running with debug mode:

```
project/
├── scripts/
│   └── ingest-public-apis.ts        # Main ingestion script
├── snapshots/                       # Debug snapshots directory
│   └── 2024-01-01T12-00-00-000Z-public-apis-raw.md
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.ts                      # Database seeding
└── INGESTION.md                     # This documentation
```

## Integration

This script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Ingest Public APIs
  run: npm run ingest
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

The script returns appropriate exit codes:
- `0`: Success
- `1`: Failure (network, parsing, or database errors)
