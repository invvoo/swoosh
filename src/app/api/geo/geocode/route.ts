import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/geo/geocode'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 })
  const result = await geocodeAddress(q)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(result)
}
