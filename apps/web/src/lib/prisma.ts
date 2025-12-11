import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined
}

const globalScope = globalThis as typeof globalThis & {
  prisma?: PrismaClient
  pgPool?: Pool
}

const pool = globalScope.pgPool ?? new Pool({ connectionString })
const adapter = new PrismaPg(pool)

if (!globalScope.pgPool) {
  globalScope.pgPool = pool
}

export const prisma = globalScope.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalScope.prisma = prisma
}

export type PrismaClientType = typeof prisma

export default prisma

export {}
