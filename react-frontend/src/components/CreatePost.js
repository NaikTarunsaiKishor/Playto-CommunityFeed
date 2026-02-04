'use client';

import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { postsApi } from '../services/api';
import './CreatePost.css';

function CreatePost({ onPostCreated }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await postsApi.create({
        title: title.trim(),
        content: content.trim(),
      });
      onPostCreated(response.data);
      setTitle('');
      setContent('');
      setIsExpanded(false);
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setError(null);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div className="card create-post-collapsed" onClick={() => setIsExpanded(true)}>
        <div className="avatar avatar-sm">U</div>
        <span className="create-post-placeholder">Share something with the community...</span>
      </div>
    );
  }

  return (
    <div className="card create-post-expanded">
      <div className="create-post-header">
        <h3 className="create-post-title">Create Post</h3>
        <button className="btn btn-ghost btn-icon" onClick={handleCancel} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="create-post-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="post-title" className="sr-only">Title</label>
          <input
            id="post-title"
            type="text"
            className="input"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="post-content" className="sr-only">Content</label>
          <textarea
            id="post-content"
            className="textarea"
            placeholder="What's on your mind?"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="create-post-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !title.trim() || !content.trim()}
          >
            <Send size={16} />
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
