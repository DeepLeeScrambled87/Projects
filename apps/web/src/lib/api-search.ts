import { Prisma } from '@prisma/client'
import { z } from 'zod'
import type { PrismaClientType } from './prisma'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50

let prismaClientPromise: Promise<PrismaClientType> | null = null
const getPrismaClient = async (): Promise<PrismaClientType> => {
  if (!prismaClientPromise) {
    prismaClientPromise = import('./prisma').then((module) => module.default)
  }
  return prismaClientPromise
}

const toOptionalNumber = (min: number, max: number) =>
  z.preprocess((value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed === '') {
        return undefined
      }
      const parsed = Number(trimmed)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
      return value
    }
    return undefined
  }, z.number().min(min).max(max).optional())

const toOptionalBoolean = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes'].includes(normalized)) {
      return true
    }
    if (['false', '0', 'no'].includes(normalized)) {
      return false
    }
    return value
  }
  return undefined
}, z.boolean().optional())

const toPositiveInt = (defaultValue: number, max: number) =>
  z
    .preprocess((value) => {
      if (typeof value === 'number' && Number.isInteger(value)) {
        return value
      }
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed === '') {
          return undefined
        }
        const parsed = Number(trimmed)
        if (!Number.isNaN(parsed)) {
          return parsed
        }
        return value
      }
      return undefined
    }, z.number().int().min(1).max(max).optional())
    .default(defaultValue)

export const ApiSearchQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .min(1, 'search must include at least one character when provided')
      .max(200, 'search queries are limited to 200 characters')
      .optional(),
    page: toPositiveInt(1, Number.MAX_SAFE_INTEGER),
    pageSize: toPositiveInt(DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    categories: z.array(z.string().trim().min(1).max(64)).max(10).default([]),
    auth: z.array(z.string().trim().min(1).max(64)).max(10).default([]),
    https: toOptionalBoolean,
    cors: z.enum(['yes', 'no', 'unknown']).optional(),
    latencyMin: toOptionalNumber(0, 10000),
    latencyMax: toOptionalNumber(0, 10000),
    uptimeMin: toOptionalNumber(0, 100),
    uptimeMax: toOptionalNumber(0, 100)
  })
  .refine((data) => {
    if (data.latencyMin !== undefined && data.latencyMax !== undefined) {
      return data.latencyMin <= data.latencyMax
    }
    return true
  }, {
    message: 'latencyMin cannot be greater than latencyMax',
    path: ['latencyMin']
  })
  .refine((data) => {
    if (data.uptimeMin !== undefined && data.uptimeMax !== undefined) {
      return data.uptimeMin <= data.uptimeMax
    }
    return true
  }, {
    message: 'uptimeMin cannot be greater than uptimeMax',
    path: ['uptimeMin']
  })

export type ApiSearchQuery = z.infer<typeof ApiSearchQuerySchema>

const CategoryFacetSchema = z.object({
  id: z.number(),
  name: z.string()
})

const AuthFacetSchema = z.object({
  id: z.number(),
  name: z.string()
})

const ThrottlingSchema = z
  .object({
    limit: z.string().nullable(),
    window: z.string().nullable()
  })
  .nullable()

const ReliabilitySchema = z
  .object({
    latency: z.number().nullable(),
    uptime: z.number().nullable(),
    lastChecked: z.string().nullable()
  })
  .nullable()

export const ApiRecordSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  link: z.string(),
  https: z.boolean(),
  cors: z.string().nullable(),
  categories: z.array(CategoryFacetSchema),
  authMethods: z.array(AuthFacetSchema),
  throttling: ThrottlingSchema,
  reliabilityStats: ReliabilitySchema
})

export const ApiSearchResponseSchema = z.object({
  data: z.array(ApiRecordSchema),
  meta: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    hasNextPage: z.boolean()
  })
})

export type ApiSearchResponse = z.infer<typeof ApiSearchResponseSchema>

const parseListParam = (params: URLSearchParams, key: string) => {
  const values = params.getAll(key)
  const flattened = values
    .flatMap((value) => value.split(',').map((part) => part.trim()))
    .filter(Boolean)
  return Array.from(new Set(flattened))
}

export function parseApiSearchParams(params: URLSearchParams): ApiSearchQuery {
  const payload = {
    search: params.get('search') ?? undefined,
    page: params.get('page') ?? undefined,
    pageSize: params.get('pageSize') ?? undefined,
    categories: parseListParam(params, 'category'),
    auth: parseListParam(params, 'auth'),
    https: params.get('https') ?? undefined,
    cors: params.get('cors') ?? undefined,
    latencyMin: params.get('latencyMin') ?? undefined,
    latencyMax: params.get('latencyMax') ?? undefined,
    uptimeMin: params.get('uptimeMin') ?? undefined,
    uptimeMax: params.get('uptimeMax') ?? undefined
  }

  return ApiSearchQuerySchema.parse(payload)
}

export function buildApiWhereClause(filters: ApiSearchQuery): Prisma.ApiWhereInput {
  const where: Prisma.ApiWhereInput = {}

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  if (filters.categories.length > 0) {
    where.categories = {
      some: {
        name: {
          in: filters.categories
        }
      }
    }
  }

  if (filters.auth.length > 0) {
    where.authMethods = {
      some: {
        name: {
          in: filters.auth
        }
      }
    }
  }

  if (typeof filters.https === 'boolean') {
    where.https = filters.https
  }

  if (filters.cors) {
    where.cors = filters.cors
  }

  const reliability: Prisma.ReliabilityStatsWhereInput = {}

  if (filters.latencyMin !== undefined || filters.latencyMax !== undefined) {
    reliability.latency = {}
    if (filters.latencyMin !== undefined) {
      reliability.latency.gte = filters.latencyMin
    }
    if (filters.latencyMax !== undefined) {
      reliability.latency.lte = filters.latencyMax
    }
  }

  if (filters.uptimeMin !== undefined || filters.uptimeMax !== undefined) {
    reliability.uptime = {}
    if (filters.uptimeMin !== undefined) {
      reliability.uptime.gte = filters.uptimeMin
    }
    if (filters.uptimeMax !== undefined) {
      reliability.uptime.lte = filters.uptimeMax
    }
  }

  if (Object.keys(reliability).length > 0) {
    where.reliabilityStats = {
      is: reliability
    }
  }

  return where
}

export async function searchApis(filters: ApiSearchQuery): Promise<ApiSearchResponse> {
  const prisma = await getPrismaClient()
  const where = buildApiWhereClause(filters)
  const skip = (filters.page - 1) * filters.pageSize

  const [records, total] = await Promise.all([
    prisma.api.findMany({
      where,
      skip,
      take: filters.pageSize,
      orderBy: [{ name: 'asc' }],
      include: {
        categories: { select: { id: true, name: true } },
        authMethods: { select: { id: true, name: true } },
        throttling: { select: { limit: true, window: true } },
        reliabilityStats: { select: { latency: true, uptime: true, lastChecked: true } }
      }
    }),
    prisma.api.count({ where })
  ])

  const normalized = records.map((record) => ({
    ...record,
    reliabilityStats: record.reliabilityStats
      ? {
          ...record.reliabilityStats,
          lastChecked: record.reliabilityStats.lastChecked?.toISOString() ?? null
        }
      : null
  }))

  return ApiSearchResponseSchema.parse({
    data: normalized,
    meta: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      hasNextPage: skip + normalized.length < total
    }
  })
}
