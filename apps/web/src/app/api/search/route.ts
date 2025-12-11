import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const auth = searchParams.get('auth');
  const https = searchParams.get('https');
  const cors = searchParams.get('cors');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  
  const skip = (page - 1) * limit;

  // Build where clause
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

  if (https !== null && https !== undefined && https !== '') {
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

  try {
    const [apis, total] = await Promise.all([
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

    return NextResponse.json({
      data: apis,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
