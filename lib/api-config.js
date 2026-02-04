// API Configuration
// Change this to your Django backend URL when running locally
// For v0 preview, we use the Next.js API routes

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Django backend URL (uncomment when using Django locally)
// export const API_BASE_URL = 'http://localhost:8000'

export const API_ENDPOINTS = {
  posts: `${API_BASE_URL}/api/posts`,
  comments: (postId) => `${API_BASE_URL}/api/posts/${postId}/comments`,
  likes: `${API_BASE_URL}/api/likes`,
  leaderboard: `${API_BASE_URL}/api/leaderboard`,
}

// Helper function to make API requests
export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}
