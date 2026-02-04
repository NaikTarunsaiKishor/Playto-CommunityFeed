'use client'

import { useState } from 'react'
import { Heart, Reply, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommentForm } from '@/components/comment-form'
import { formatDistanceToNow } from '@/lib/format-time'
import { API_ENDPOINTS } from '@/lib/api-config'

const MAX_VISIBLE_DEPTH = 4

export function CommentItem({ comment, postId, onCommentCreated, onLikeUpdate }) {
  const [isLiking, setIsLiking] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(comment.depth < 2)

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    
    try {
      const response = await fetch(API_ENDPOINTS.likes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: comment.id, targetType: 'comment' }),
      })
      
      if (response.ok) {
        const { liked, newCount } = await response.json()
        onLikeUpdate(comment.id, liked, newCount)
      }
    } finally {
      setIsLiking(false)
    }
  }

  const handleReplyCreated = (newComment) => {
    onCommentCreated(newComment, comment.id)
    setShowReplyForm(false)
    setShowReplies(true)
  }

  const depthColors = [
    'border-primary/20',
    'border-blue-500/20',
    'border-green-500/20',
    'border-amber-500/20',
    'border-pink-500/20',
  ]

  const borderColor = depthColors[comment.depth % depthColors.length]

  return (
    <div className={`${comment.depth > 0 ? `ml-4 pl-4 border-l-2 ${borderColor}` : ''}`}>
      <div className="group">
        <div className="flex gap-3">
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={comment.author.avatarUrl || "/placeholder.svg"} alt={comment.author.username} />
            <AvatarFallback className="text-xs bg-muted">
              {comment.author.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground">
                {comment.author.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt))}
              </span>
            </div>
            
            <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">
              {comment.content}
            </p>
            
            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={`h-7 px-2 gap-1.5 text-xs ${
                  comment.isLikedByCurrentUser 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart 
                  className={`h-3.5 w-3.5 ${comment.isLikedByCurrentUser ? 'fill-current' : ''}`} 
                />
                <span>{comment.likeCount}</span>
              </Button>
              
              {comment.depth < MAX_VISIBLE_DEPTH && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Reply
                </Button>
              )}
              
              {comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showReplies ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {showReplyForm && (
          <div className="mt-3 ml-10">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onCommentCreated={handleReplyCreated}
              onCancel={() => setShowReplyForm(false)}
              isReply
            />
          </div>
        )}
        
        {showReplies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                onCommentCreated={onCommentCreated}
                onLikeUpdate={onLikeUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
