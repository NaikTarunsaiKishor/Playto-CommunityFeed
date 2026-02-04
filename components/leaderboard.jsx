'use client'

import { useEffect, useState, useCallback } from 'react'
import { Trophy, Flame, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { API_ENDPOINTS } from '@/lib/api-config'

export function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.leaderboard)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-amber-500/20 text-amber-500 ring-amber-500/30'
      case 2:
        return 'bg-slate-400/20 text-slate-400 ring-slate-400/30'
      case 3:
        return 'bg-orange-600/20 text-orange-600 ring-orange-600/30'
      default:
        return 'bg-muted text-muted-foreground ring-border'
    }
  }

  const getRankIcon = (rank) => {
    if (rank <= 3) {
      return <Trophy className="h-3 w-3" />
    }
    return <span className="text-xs font-bold">{rank}</span>
  }

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Top Contributors
        </CardTitle>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last 24 hours</span>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map(entry => (
              <div
                key={entry.user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ring-1 ${getRankStyle(entry.rank)}`}
                >
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.user.avatarUrl || "/placeholder.svg"} alt={entry.user.username} />
                  <AvatarFallback className="text-xs bg-muted">
                    {entry.user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-foreground">
                    {entry.user.username}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-amber-500">
                  <Flame className="h-4 w-4" />
                  <span className="font-semibold text-sm">{entry.karma24h}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity in the last 24 hours</p>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Post like = 5 karma
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/50" />
              Comment like = 1 karma
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
