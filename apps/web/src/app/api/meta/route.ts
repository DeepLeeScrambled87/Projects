import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const [categoryFacets, authFacets, totalApis, httpsEnabled, corsFacets, reliabilityAverages, lastChange] =
      await Promise.all([
        prisma.category.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true, _count: { select: { apis: true } } }
        }),
        prisma.auth.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true, _count: { select: { apis: true } } }
        }),
        prisma.api.count(),
        prisma.api.count({ where: { https: true } }),
        prisma.api.groupBy({
          by: ['cors'],
          _count: { cors: true }
        }),
        prisma.reliabilityStats.aggregate({
          _avg: {
            latency: true,
            uptime: true
          }
        }),
        prisma.api.aggregate({
          _max: {
            updatedAt: true
          }
        })
      ])

    const corsBreakdown = corsFacets.reduce(
      (acc, row) => {
        const rawKey = row.cors ?? 'unknown'
        const normalizedKey: 'yes' | 'no' | 'unknown' = rawKey === 'yes' || rawKey === 'no' ? rawKey : 'unknown'
        acc[normalizedKey] = row._count.cors
        return acc
      },
      { yes: 0, no: 0, unknown: 0 } as Record<'yes' | 'no' | 'unknown', number>
    )

    const response = {
      filters: {
        categories: categoryFacets.map((category) => ({
          id: category.id,
          name: category.name,
          count: category._count.apis
        })),
        auth: authFacets.map((auth) => ({
          id: auth.id,
          name: auth.name,
          count: auth._count.apis
        })),
        https: {
          enabled: httpsEnabled,
          disabled: totalApis - httpsEnabled
        },
        cors: corsBreakdown
      },
      metrics: {
        totalApis,
        averageLatency: reliabilityAverages._avg.latency ?? null,
        averageUptime: reliabilityAverages._avg.uptime ?? null,
        lastUpdatedAt: lastChange._max.updatedAt?.toISOString() ?? null
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to load meta information', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
