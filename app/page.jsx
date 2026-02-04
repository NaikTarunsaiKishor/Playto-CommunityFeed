import { Header } from '@/components/header'
import { Feed } from '@/components/feed'
import { Leaderboard } from '@/components/leaderboard'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Feed />
          </div>
          
          {/* Sidebar with Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  )
}
