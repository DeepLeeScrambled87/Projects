import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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

    return NextResponse.json({
      categories: categories.map(c => c.name),
      authMethods: authMethods.map(a => a.name),
      cors: corsOptions
    });
  } catch (error) {
    console.error('Facets error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
