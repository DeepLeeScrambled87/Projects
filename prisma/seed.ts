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
