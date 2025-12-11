import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || (() => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
      // In build time or some envs it might be missing, handle gracefully if needed or fail
      // For now we expect it
      // console.warn('DATABASE_URL is missing, Prisma will fail to connect');
  }
  
  // We need to check if connectionString exists to avoid runtime error on new Pool
  if (connectionString) {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
  } else {
      return new PrismaClient(); // Fallback that will likely fail on connect but allows build
  }
})();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
