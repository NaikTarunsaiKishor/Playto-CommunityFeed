'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { API_ENDPOINTS } from '@/lib/api-config'

export function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(API_ENDPOINTS.posts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })
      
      if (response.ok) {
        const post = await response.json()
        onPostCreated(post)
        setContent('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=current" alt="You" />
            <AvatarFallback className="bg-primary/10 text-primary">Y</AvatarFallback>
          </Avatar>
          <span>Share your thoughts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 resize-none bg-background/50 border-border/50 focus:border-primary/50"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {content.length > 0 && `${content.length} characters`}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
