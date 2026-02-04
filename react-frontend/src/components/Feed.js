'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { postsApi } from '../services/api';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import './Feed.css';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await postsApi.getAll({ ordering: sortBy === 'newest' ? '-created_at' : '-like_count' });
      setPosts(response.data.results || response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load posts. Make sure the Django server is running.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  if (loading) {
    return (
      <div className="feed">
        <div className="feed-header">
          <h2 className="feed-title">Community Feed</h2>
        </div>
        <div className="feed-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton-card">
              <div className="skeleton skeleton-header" />
              <div className="skeleton skeleton-body" />
              <div className="skeleton skeleton-footer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed">
        <div className="card error-card">
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={fetchPosts}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feed">
      <div className="feed-header">
        <h2 className="feed-title">Community Feed</h2>
        <div className="feed-sort">
          <button
            className={`btn btn-sm ${sortBy === 'newest' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSortBy('newest')}
          >
            Newest
          </button>
          <button
            className={`btn btn-sm ${sortBy === 'popular' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSortBy('popular')}
          >
            Popular
          </button>
        </div>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />

      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="card empty-state">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Feed;
