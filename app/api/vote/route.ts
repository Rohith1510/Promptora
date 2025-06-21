import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { promptId, nullifierHash, proof } = await req.json()
  // Here you would check nullifierHash uniqueness and log to Google Sheets
  // For now, just return success
  return NextResponse.json({ success: true, promptId, nullifierHash, proof })
} 