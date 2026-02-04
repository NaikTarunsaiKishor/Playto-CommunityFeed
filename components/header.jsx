import { MessageSquare, Zap } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Community Feed</h1>
              <p className="text-xs text-muted-foreground">Threaded Discussions</p>
            </div>
          </div>
          
       
        </div>
      </div>
    </header>
  )
}
