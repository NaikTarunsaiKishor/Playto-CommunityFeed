'use client'

import { useEffect, useState, useCallback } from 'react'
import { CommentItem } from '@/components/comment-item'
import { CommentForm } from '@/components/comment-form'
import { API_ENDPOINTS } from '@/lib/api-config'

export function CommentThread({ postId, onCommentAdded }) {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.comments(postId))
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleCommentCreated = (comment, parentId) => {
    if (parentId) {
      // Add reply to parent comment
      setComments(prev => addReplyToTree(prev, parentId, comment))
    } else {
      // Add to root level
      setComments(prev => [...prev, comment])
    }
    onCommentAdded()
  }

  const handleLikeUpdate = (commentId, liked, newCount) => {
    setComments(prev => updateLikeInTree(prev, commentId, liked, newCount))
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CommentForm postId={postId} onCommentCreated={handleCommentCreated} />
      
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onCommentCreated={handleCommentCreated}
              onLikeUpdate={handleLikeUpdate}
            />
          ))}
        </div>
      )}
      
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  )
}

// Helper to add reply to correct position in tree
function addReplyToTree(comments, parentId, newComment) {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...comment.replies, newComment],
      }
    }
    if (comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToTree(comment.replies, parentId, newComment),
      }
    }
    return comment
  })
}

// Helper to update like status in tree
function updateLikeInTree(comments, commentId, liked, newCount) {
  return comments.map(comment => {
    if (comment.id === commentId) {
      return {
        ...comment,
        isLikedByCurrentUser: liked,
        likeCount: newCount,
      }
    }
    if (comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateLikeInTree(comment.replies, commentId, liked, newCount),
      }
    }
    return comment
  })
}
