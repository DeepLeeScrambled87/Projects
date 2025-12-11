import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function searchApis(params: {
  q?: string;
  category?: string;
  auth?: string;
  https?: string;
  cors?: string;
  page?: number;
  limit?: number;
}) {
  const { q, category, auth, https, cors, page = 1, limit = 12 } = params;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.ApiWhereInput[] = [];

  if (q) {
    andConditions.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  if (category) {
    andConditions.push({
      categories: {
        some: {
          name: category
        }
      }
    });
  }

  if (auth) {
    andConditions.push({
      authMethods: {
        some: {
          name: auth
        }
      }
    });
  }

  if (https !== undefined && https !== '' && https !== null) {
     andConditions.push({
      https: https === 'true'
    });
  }

  if (cors) {
    andConditions.push({
      cors: { equals: cors, mode: 'insensitive' }
    });
  }

  const where: Prisma.ApiWhereInput = {
    AND: andConditions
  };

  const [data, total] = await Promise.all([
    prisma.api.findMany({
      where,
      include: {
        categories: true,
        authMethods: true,
        reliabilityStats: true,
      },
      skip,
      take: limit,
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.api.count({ where })
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getFacets() {
  const [categories, authMethods] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.auth.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const corsResults = await prisma.api.groupBy({
    by: ['cors'],
    _count: {
      cors: true
    },
    orderBy: {
      cors: 'asc'
    }
  });
  
  const corsOptions = corsResults
      .map(c => c.cors)
      .filter((c): c is string => c !== null);

  return {
    categories: categories.map(c => c.name),
    authMethods: authMethods.map(a => a.name),
    cors: corsOptions
  };
}
