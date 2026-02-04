import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  // Dynamic calculation from karma transactions (last 24h only)
  // This avoids storing daily karma in a simple integer field
  const leaderboard = dataStore.getLeaderboard(5)
  
  return NextResponse.json(leaderboard)
}
