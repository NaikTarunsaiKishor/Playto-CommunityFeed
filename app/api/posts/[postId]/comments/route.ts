import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'
import type { Comment, CommentWithAuthor } from '@/lib/types'

const CURRENT_USER_ID = 'current'

// Build comment tree efficiently (single pass)
function buildCommentTree(comments: Comment[], currentUserId: string): CommentWithAuthor[] {
  const commentMap = new Map<string, CommentWithAuthor>()
  const rootComments: CommentWithAuthor[] = []
  
  // First pass: create all comment objects with authors
  comments.forEach(comment => {
    const author = dataStore.getUser(comment.authorId)
    commentMap.set(comment.id, {
      ...comment,
      author: author!,
      replies: [],
      isLikedByCurrentUser: dataStore.isLikedByUser(currentUserId, comment.id, 'comment'),
    })
  })
  
  // Second pass: build the tree structure
  comments.forEach(comment => {
    const commentWithAuthor = commentMap.get(comment.id)!
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      if (parent) {
        parent.replies.push(commentWithAuthor)
      }
    } else {
      rootComments.push(commentWithAuthor)
    }
  })
  
  return rootComments
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params
  
  // Single efficient query to get all comments
  const comments = dataStore.getCommentsForPost(postId)
  
  // Build tree in memory (O(n) - no additional queries)
  const commentTree = buildCommentTree(comments, CURRENT_USER_ID)
  
  return NextResponse.json(commentTree)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params
  const { content, parentId } = await request.json()
  
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }
  
  const comment = dataStore.createComment(postId, CURRENT_USER_ID, parentId || null, content.trim())
  const author = dataStore.getUser(CURRENT_USER_ID)
  
  const commentWithAuthor: CommentWithAuthor = {
    ...comment,
    author: author!,
    replies: [],
    isLikedByCurrentUser: false,
  }
  
  return NextResponse.json(commentWithAuthor)
}
