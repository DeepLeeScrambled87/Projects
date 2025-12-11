import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '0.1.0'
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({
    status: 'ok',
    received: body,
    timestamp: new Date().toISOString()
  })
}