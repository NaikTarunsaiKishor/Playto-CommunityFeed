import type { User, Post, Comment, Like, KarmaTransaction } from './types'

// In-memory data store - in production this would be a database
// Using a simple object store that persists across API calls within the same server instance

const generateId = () => Math.random().toString(36).substring(2, 15)

// Initialize with sample data
const users: Map<string, User> = new Map([
  ['user1', { id: 'user1', username: 'alex_chen', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', createdAt: new Date('2024-01-01') }],
  ['user2', { id: 'user2', username: 'sarah_dev', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', createdAt: new Date('2024-01-02') }],
  ['user3', { id: 'user3', username: 'mike_js', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', createdAt: new Date('2024-01-03') }],
  ['user4', { id: 'user4', username: 'emma_code', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', createdAt: new Date('2024-01-04') }],
  ['user5', { id: 'user5', username: 'david_rust', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', createdAt: new Date('2024-01-05') }],
  ['user6', { id: 'user6', username: 'lisa_py', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', createdAt: new Date('2024-01-06') }],
  ['current', { id: 'current', username: 'you', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current', createdAt: new Date('2024-01-07') }],
])

const posts: Map<string, Post> = new Map([
  ['post1', { id: 'post1', authorId: 'user1', content: 'Just shipped a new feature using Next.js 16 and the new cache components are amazing! The "use cache" directive makes data fetching so much more intuitive. Anyone else experimenting with this?', createdAt: new Date(Date.now() - 3600000 * 2), likeCount: 12 }],
  ['post2', { id: 'post2', authorId: 'user2', content: 'Hot take: TypeScript strict mode should be the default. The number of bugs it catches at compile time is insane. What do you all think?', createdAt: new Date(Date.now() - 3600000 * 5), likeCount: 8 }],
  ['post3', { id: 'post3', authorId: 'user3', content: 'Been diving deep into React Server Components. The mental model shift is real, but the performance gains are worth it. Happy to answer questions if anyone is stuck!', createdAt: new Date(Date.now() - 3600000 * 8), likeCount: 15 }],
  ['post4', { id: 'post4', authorId: 'user4', content: 'Just finished building a real-time collaborative editor. The trickiest part was handling concurrent edits. CRDTs to the rescue!', createdAt: new Date(Date.now() - 3600000 * 12), likeCount: 20 }],
])

const comments: Map<string, Comment> = new Map([
  ['comment1', { id: 'comment1', postId: 'post1', authorId: 'user2', parentId: null, content: 'The cache components are game-changing! I especially love how you can granularly control what gets cached.', createdAt: new Date(Date.now() - 3600000 * 1.5), likeCount: 5, depth: 0 }],
  ['comment2', { id: 'comment2', postId: 'post1', authorId: 'user3', parentId: 'comment1', content: 'Agreed! The revalidateTag API with cache profiles makes invalidation so much cleaner.', createdAt: new Date(Date.now() - 3600000 * 1), likeCount: 3, depth: 1 }],
  ['comment3', { id: 'comment3', postId: 'post1', authorId: 'user1', parentId: 'comment2', content: 'Yes! And the new updateTag() for read-your-writes is perfect for optimistic updates.', createdAt: new Date(Date.now() - 3600000 * 0.5), likeCount: 2, depth: 2 }],
  ['comment4', { id: 'comment4', postId: 'post2', authorId: 'user4', parentId: null, content: 'Strongly agree. The initial setup cost is worth the long-term maintainability.', createdAt: new Date(Date.now() - 3600000 * 4), likeCount: 4, depth: 0 }],
  ['comment5', { id: 'comment5', postId: 'post2', authorId: 'user5', parentId: 'comment4', content: 'Counter-point: for small prototypes, it can slow you down initially.', createdAt: new Date(Date.now() - 3600000 * 3.5), likeCount: 2, depth: 1 }],
  ['comment6', { id: 'comment6', postId: 'post3', authorId: 'user6', parentId: null, content: 'Great offer! I am struggling with understanding when to use client vs server components.', createdAt: new Date(Date.now() - 3600000 * 7), likeCount: 6, depth: 0 }],
  ['comment7', { id: 'comment7', postId: 'post3', authorId: 'user3', parentId: 'comment6', content: 'Rule of thumb: start with server components. Only add "use client" when you need interactivity, browser APIs, or useState/useEffect.', createdAt: new Date(Date.now() - 3600000 * 6.5), likeCount: 8, depth: 1 }],
])

const likes: Map<string, Like> = new Map()
const karmaTransactions: Map<string, KarmaTransaction> = new Map()

// Initialize karma transactions based on existing likes
const initializeKarma = () => {
  // Add some recent karma transactions for the leaderboard
  const now = Date.now()
  const transactions = [
    { userId: 'user1', amount: 5, reason: 'post_like' as const, sourceId: 'post1', createdAt: new Date(now - 3600000 * 2) },
    { userId: 'user1', amount: 5, reason: 'post_like' as const, sourceId: 'post1', createdAt: new Date(now - 3600000 * 3) },
    { userId: 'user2', amount: 5, reason: 'post_like' as const, sourceId: 'post2', createdAt: new Date(now - 3600000 * 4) },
    { userId: 'user3', amount: 5, reason: 'post_like' as const, sourceId: 'post3', createdAt: new Date(now - 3600000 * 5) },
    { userId: 'user3', amount: 1, reason: 'comment_like' as const, sourceId: 'comment7', createdAt: new Date(now - 3600000 * 1) },
    { userId: 'user4', amount: 5, reason: 'post_like' as const, sourceId: 'post4', createdAt: new Date(now - 3600000 * 6) },
    { userId: 'user4', amount: 5, reason: 'post_like' as const, sourceId: 'post4', createdAt: new Date(now - 3600000 * 7) },
    { userId: 'user4', amount: 5, reason: 'post_like' as const, sourceId: 'post4', createdAt: new Date(now - 3600000 * 8) },
    { userId: 'user5', amount: 1, reason: 'comment_like' as const, sourceId: 'comment5', createdAt: new Date(now - 3600000 * 10) },
    { userId: 'user6', amount: 1, reason: 'comment_like' as const, sourceId: 'comment6', createdAt: new Date(now - 3600000 * 12) },
    { userId: 'user2', amount: 1, reason: 'comment_like' as const, sourceId: 'comment1', createdAt: new Date(now - 3600000 * 1) },
    { userId: 'user2', amount: 1, reason: 'comment_like' as const, sourceId: 'comment1', createdAt: new Date(now - 3600000 * 2) },
  ]
  
  transactions.forEach((t, i) => {
    const id = `kt${i}`
    karmaTransactions.set(id, { id, ...t })
  })
}

initializeKarma()

// Mutex-like mechanism for handling race conditions
const likeLocks = new Map<string, Promise<void>>()

const acquireLock = async (key: string): Promise<() => void> => {
  while (likeLocks.has(key)) {
    await likeLocks.get(key)
  }
  let release: () => void
  const lockPromise = new Promise<void>((resolve) => {
    release = resolve
  })
  likeLocks.set(key, lockPromise)
  return () => {
    likeLocks.delete(key)
    release!()
  }
}

export const dataStore = {
  // Users
  getUser: (id: string) => users.get(id),
  getAllUsers: () => Array.from(users.values()),
  
  // Posts
  getPost: (id: string) => posts.get(id),
  getAllPosts: () => Array.from(posts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  createPost: (authorId: string, content: string): Post => {
    const id = generateId()
    const post: Post = {
      id,
      authorId,
      content,
      createdAt: new Date(),
      likeCount: 0,
    }
    posts.set(id, post)
    return post
  },
  
  // Comments - Efficient tree fetching (solves N+1 problem)
  getCommentsForPost: (postId: string): Comment[] => {
    // Single query to get all comments for a post
    return Array.from(comments.values())
      .filter(c => c.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  },
  
  createComment: (postId: string, authorId: string, parentId: string | null, content: string): Comment => {
    const id = generateId()
    const parentComment = parentId ? comments.get(parentId) : null
    const depth = parentComment ? parentComment.depth + 1 : 0
    
    const comment: Comment = {
      id,
      postId,
      authorId,
      parentId,
      content,
      createdAt: new Date(),
      likeCount: 0,
      depth,
    }
    comments.set(id, comment)
    return comment
  },
  
  getCommentCountForPost: (postId: string): number => {
    return Array.from(comments.values()).filter(c => c.postId === postId).length
  },
  
  // Likes with race condition handling
  toggleLike: async (userId: string, targetId: string, targetType: 'post' | 'comment'): Promise<{ liked: boolean; newCount: number }> => {
    const lockKey = `${userId}-${targetId}`
    const release = await acquireLock(lockKey)
    
    try {
      // Check if already liked
      const existingLike = Array.from(likes.values()).find(
        l => l.userId === userId && l.targetId === targetId && l.targetType === targetType
      )
      
      if (existingLike) {
        // Unlike
        likes.delete(existingLike.id)
        
        // Remove karma transaction
        const karmaToRemove = Array.from(karmaTransactions.values()).find(
          k => k.sourceId === targetId && k.reason === (targetType === 'post' ? 'post_like' : 'comment_like')
        )
        if (karmaToRemove) {
          karmaTransactions.delete(karmaToRemove.id)
        }
        
        // Update count
        if (targetType === 'post') {
          const post = posts.get(targetId)
          if (post) {
            post.likeCount = Math.max(0, post.likeCount - 1)
          }
          return { liked: false, newCount: post?.likeCount ?? 0 }
        } else {
          const comment = comments.get(targetId)
          if (comment) {
            comment.likeCount = Math.max(0, comment.likeCount - 1)
          }
          return { liked: false, newCount: comment?.likeCount ?? 0 }
        }
      } else {
        // Like
        const likeId = generateId()
        const like: Like = {
          id: likeId,
          userId,
          targetId,
          targetType,
          createdAt: new Date(),
        }
        likes.set(likeId, like)
        
        // Add karma transaction
        const target = targetType === 'post' ? posts.get(targetId) : comments.get(targetId)
        if (target) {
          const authorId = 'authorId' in target ? target.authorId : ''
          const karmaId = generateId()
          const karmaAmount = targetType === 'post' ? 5 : 1
          karmaTransactions.set(karmaId, {
            id: karmaId,
            userId: authorId,
            amount: karmaAmount,
            reason: targetType === 'post' ? 'post_like' : 'comment_like',
            sourceId: targetId,
            createdAt: new Date(),
          })
        }
        
        // Update count
        if (targetType === 'post') {
          const post = posts.get(targetId)
          if (post) {
            post.likeCount += 1
          }
          return { liked: true, newCount: post?.likeCount ?? 0 }
        } else {
          const comment = comments.get(targetId)
          if (comment) {
            comment.likeCount += 1
          }
          return { liked: true, newCount: comment?.likeCount ?? 0 }
        }
      }
    } finally {
      release()
    }
  },
  
  isLikedByUser: (userId: string, targetId: string, targetType: 'post' | 'comment'): boolean => {
    return Array.from(likes.values()).some(
      l => l.userId === userId && l.targetId === targetId && l.targetType === targetType
    )
  },
  
  // Leaderboard - Dynamic calculation from transactions (last 24h only)
  getLeaderboard: (limit: number = 5) => {
    const now = Date.now()
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000
    
    // Aggregate karma from transactions in the last 24 hours
    const karmaByUser = new Map<string, number>()
    
    Array.from(karmaTransactions.values())
      .filter(t => t.createdAt.getTime() >= twentyFourHoursAgo)
      .forEach(t => {
        const current = karmaByUser.get(t.userId) || 0
        karmaByUser.set(t.userId, current + t.amount)
      })
    
    // Sort and get top users
    const sortedEntries = Array.from(karmaByUser.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
    
    return sortedEntries.map(([userId, karma], index) => ({
      user: users.get(userId)!,
      karma24h: karma,
      rank: index + 1,
    })).filter(entry => entry.user)
  },
}
