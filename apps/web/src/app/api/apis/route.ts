import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { parseApiSearchParams, searchApis } from '@/lib/api-search'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const filters = parseApiSearchParams(request.nextUrl.searchParams)
    const result = await searchApis(filters)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.flatten()
        },
        { status: 400 }
      )
    }

    console.error('Failed to fetch APIs', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
