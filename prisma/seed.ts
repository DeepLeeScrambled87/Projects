import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
export const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })

export async function upsertCategory(name: string) {
  return prisma.category.upsert({
    where: { name },
    update: {},
    create: { name },
  })
}

export async function upsertAuth(name: string) {
  return prisma.auth.upsert({
    where: { name },
    update: {},
    create: { name },
  })
}

type SeedApi = {
  name: string
  description: string
  link: string
  https: boolean
  cors: 'yes' | 'no' | 'unknown'
  categories: string[]
  auth: string[]
  throttling?: {
    limit?: string
    window?: string
  }
  reliability?: {
    latency?: number
    uptime?: number
    lastChecked?: Date
  }
}

const seedApis: SeedApi[] = [
  {
    name: 'Cat Facts',
    description: 'Daily cat facts for animal lovers',
    link: 'https://catfact.ninja',
    https: true,
    cors: 'yes',
    categories: ['Animals'],
    auth: ['No-Auth'],
    throttling: { limit: '100 requests', window: 'day' },
    reliability: { latency: 120, uptime: 99.9, lastChecked: new Date() }
  },
  {
    name: 'FinBank FX',
    description: 'Foreign exchange rates with enterprise SLAs',
    link: 'https://finbank.io/api',
    https: true,
    cors: 'no',
    categories: ['Finance'],
    auth: ['ApiKey'],
    throttling: { limit: '500 requests', window: 'minute' },
    reliability: { latency: 80, uptime: 99.5, lastChecked: new Date() }
  },
  {
    name: 'Security Shield',
    description: 'Security alerts and breach notifications',
    link: 'https://securityshield.app',
    https: true,
    cors: 'unknown',
    categories: ['Security'],
    auth: ['OAuth'],
    throttling: { limit: '120 requests', window: 'hour' },
    reliability: { latency: 140, uptime: 98.9, lastChecked: new Date() }
  },
  {
    name: 'Dev Playground APIs',
    description: 'Sample endpoints for prototyping and demos',
    link: 'https://devplayground.dev/api',
    https: false,
    cors: 'yes',
    categories: ['Development'],
    auth: ['Bearer Token'],
    reliability: { latency: 200, uptime: 97.5, lastChecked: new Date() }
  }
]

async function main() {
  console.log('Start seeding ...')

  const categories = ['Animals', 'Development', 'Finance', 'Security']
  for (const cat of categories) {
    const category = await upsertCategory(cat)
    console.log(`Created or found category with id: ${category.id}`)
  }

  const authMethods = ['ApiKey', 'OAuth', 'No-Auth', 'Bearer Token']
  for (const auth of authMethods) {
    const authMethod = await upsertAuth(auth)
    console.log(`Created or found auth method with id: ${authMethod.id}`)
  }

  for (const apiSeed of seedApis) {
    const api = await prisma.api.upsert({
      where: { name: apiSeed.name },
      update: {
        description: apiSeed.description,
        link: apiSeed.link,
        https: apiSeed.https,
        cors: apiSeed.cors,
        categories: {
          set: apiSeed.categories.map((name) => ({ name }))
        },
        authMethods: {
          set: apiSeed.auth.map((name) => ({ name }))
        },
        throttling: apiSeed.throttling
          ? {
              upsert: {
                update: apiSeed.throttling,
                create: apiSeed.throttling
              }
            }
          : undefined,
        reliabilityStats: apiSeed.reliability
          ? {
              upsert: {
                update: apiSeed.reliability,
                create: apiSeed.reliability
              }
            }
          : undefined
      },
      create: {
        name: apiSeed.name,
        description: apiSeed.description,
        link: apiSeed.link,
        https: apiSeed.https,
        cors: apiSeed.cors,
        categories: {
          connect: apiSeed.categories.map((name) => ({ name }))
        },
        authMethods: {
          connect: apiSeed.auth.map((name) => ({ name }))
        },
        throttling: apiSeed.throttling ? { create: apiSeed.throttling } : undefined,
        reliabilityStats: apiSeed.reliability ? { create: apiSeed.reliability } : undefined
      }
    })

    console.log(`Prepared API record: ${api.name}`)
  }

  console.log('Seeding finished.')
}

if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })
}
