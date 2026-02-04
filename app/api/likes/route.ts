import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

const CURRENT_USER_ID = 'current'

export async function POST(request: Request) {
  const { targetId, targetType } = await request.json()
  
  if (!targetId || !targetType) {
    return NextResponse.json({ error: 'targetId and targetType are required' }, { status: 400 })
  }
  
  if (targetType !== 'post' && targetType !== 'comment') {
    return NextResponse.json({ error: 'targetType must be "post" or "comment"' }, { status: 400 })
  }
  
  // Race condition handling is built into toggleLike
  const result = await dataStore.toggleLike(CURRENT_USER_ID, targetId, targetType)
  
  return NextResponse.json(result)
}
