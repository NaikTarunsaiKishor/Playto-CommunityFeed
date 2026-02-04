'use client'

import { useEffect, useState, useCallback } from 'react'
import { PostCard } from '@/components/post-card'
import { CreatePost } from '@/components/create-post'
import { API_ENDPOINTS } from '@/lib/api-config'

export function Feed() {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.posts)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handlePostCreated = (post) => {
    setPosts(prev => [post, ...prev])
  }

  const handleLikeUpdate = (postId, liked, newCount) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isLikedByCurrentUser: liked, likeCount: newCount }
          : post
      )
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-48 bg-card/50 rounded-xl animate-pulse border border-border/50"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={handlePostCreated} />
      
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onLikeUpdate={handleLikeUpdate}
          />
        ))}
      </div>
      
      {posts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No posts yet</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      )}
    </div>
  )
}
