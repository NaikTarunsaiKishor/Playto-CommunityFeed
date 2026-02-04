import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'
import type { PostWithAuthor } from '@/lib/types'

const CURRENT_USER_ID = 'current'

export async function GET() {
  const posts = dataStore.getAllPosts()
  
  const postsWithAuthors: PostWithAuthor[] = posts.map(post => {
    const author = dataStore.getUser(post.authorId)
    return {
      ...post,
      author: author!,
      isLikedByCurrentUser: dataStore.isLikedByUser(CURRENT_USER_ID, post.id, 'post'),
      commentCount: dataStore.getCommentCountForPost(post.id),
    }
  })
  
  return NextResponse.json(postsWithAuthors)
}

export async function POST(request: Request) {
  const { content } = await request.json()
  
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }
  
  const post = dataStore.createPost(CURRENT_USER_ID, content.trim())
  const author = dataStore.getUser(CURRENT_USER_ID)
  
  const postWithAuthor: PostWithAuthor = {
    ...post,
    author: author!,
    isLikedByCurrentUser: false,
    commentCount: 0,
  }
  
  return NextResponse.json(postWithAuthor)
}
