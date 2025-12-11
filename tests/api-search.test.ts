import { URLSearchParams } from 'url'
import { ZodError } from 'zod'
import { buildApiWhereClause, parseApiSearchParams } from '../apps/web/src/lib/api-search'

describe('API search parameter parsing', () => {
  it('returns defaults when no params are provided', () => {
    const params = new URLSearchParams()
    const parsed = parseApiSearchParams(params)

    expect(parsed.page).toBe(1)
    expect(parsed.pageSize).toBe(20)
    expect(parsed.categories).toEqual([])
    expect(parsed.auth).toEqual([])
    expect(parsed.https).toBeUndefined()
  })

  it('parses complex filters and deduplicates list params', () => {
    const params = new URLSearchParams()
    params.append('category', 'Animals,Finance')
    params.append('category', 'Finance')
    params.append('auth', 'ApiKey')
    params.append('auth', 'ApiKey,OAuth')
    params.set('https', 'true')
    params.set('page', '2')
    params.set('pageSize', '10')
    params.set('latencyMin', '50')
    params.set('latencyMax', '150')

    const parsed = parseApiSearchParams(params)

    expect(parsed.categories).toEqual(['Animals', 'Finance'])
    expect(parsed.auth).toEqual(['ApiKey', 'OAuth'])
    expect(parsed.https).toBe(true)
    expect(parsed.page).toBe(2)
    expect(parsed.pageSize).toBe(10)
    expect(parsed.latencyMin).toBe(50)
    expect(parsed.latencyMax).toBe(150)
  })

  it('throws on invalid numeric ranges', () => {
    const params = new URLSearchParams({ latencyMin: '200', latencyMax: '100' })
    expect(() => parseApiSearchParams(params)).toThrow(ZodError)
  })

  it('throws on invalid booleans', () => {
    const params = new URLSearchParams({ https: 'sure' })
    expect(() => parseApiSearchParams(params)).toThrow(ZodError)
  })
})

describe('API search query builder', () => {
  it('builds where clause with text and list filters', () => {
    const params = new URLSearchParams({ search: 'cat', page: '1', pageSize: '5' })
    params.append('category', 'Animals')
    params.append('auth', 'No-Auth')
    const filters = parseApiSearchParams(params)

    const where = buildApiWhereClause(filters)

    expect(where.OR).toBeDefined()
    expect(where.categories).toEqual({
      some: {
        name: {
          in: ['Animals']
        }
      }
    })
    expect(where.authMethods).toEqual({
      some: {
        name: {
          in: ['No-Auth']
        }
      }
    })
  })

  it('adds reliability ranges when provided', () => {
    const params = new URLSearchParams({ latencyMin: '10', latencyMax: '100', uptimeMin: '95' })
    const filters = parseApiSearchParams(params)
    const where = buildApiWhereClause(filters)

    expect(where.reliabilityStats).toEqual({
      is: {
        latency: { gte: 10, lte: 100 },
        uptime: { gte: 95 }
      }
    })
  })
})
