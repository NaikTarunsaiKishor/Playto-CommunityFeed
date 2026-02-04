'use client'

import { useState } from 'react'
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { CommentThread } from '@/components/comment-thread'
import { formatDistanceToNow } from '@/lib/format-time'
import { API_ENDPOINTS } from '@/lib/api-config'

export function PostCard({ post, onLikeUpdate }) {
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post.commentCount)

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    
    try {
      const response = await fetch(API_ENDPOINTS.likes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: post.id, targetType: 'post' }),
      })
      
      if (response.ok) {
        const { liked, newCount } = await response.json()
        onLikeUpdate(post.id, liked, newCount)
      }
    } finally {
      setIsLiking(false)
    }
  }

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1)
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
            <AvatarImage src={post.author.avatarUrl || "/placeholder.svg"} alt={post.author.username} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {post.author.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{post.author.username}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt))}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-0 pt-0">
        <div className="flex items-center gap-4 w-full border-t border-border/50 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`gap-2 transition-colors ${
              post.isLikedByCurrentUser 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart 
              className={`h-4 w-4 transition-all ${post.isLikedByCurrentUser ? 'fill-current scale-110' : ''}`} 
            />
            <span className="font-medium">{post.likeCount}</span>
            <span className="text-xs opacity-60">({post.likeCount * 5} karma)</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">{commentCount}</span>
            {showComments ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
        
        {showComments && (
          <div className="w-full mt-4 border-t border-border/50 pt-4">
            <CommentThread postId={post.id} onCommentAdded={handleCommentAdded} />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
