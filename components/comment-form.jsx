'use client'

import { useState } from 'react'
import { Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { API_ENDPOINTS } from '@/lib/api-config'

export function CommentForm({ postId, parentId, onCommentCreated, onCancel, isReply }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(API_ENDPOINTS.comments(postId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), parentId }),
      })
      
      if (response.ok) {
        const comment = await response.json()
        onCommentCreated(comment)
        setContent('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder={isReply ? 'Write a reply...' : 'Write a comment...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={`resize-none bg-background/50 border-border/50 focus:border-primary/50 ${
          isReply ? 'min-h-16 text-sm' : 'min-h-20'
        }`}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          size="sm"
          className="gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? 'Sending...' : isReply ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </div>
  )
}
