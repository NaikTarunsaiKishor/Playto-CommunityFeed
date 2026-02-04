'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { commentsApi } from '../services/api';
import './CommentForm.css';

function CommentForm({ postId, parentId, onCommentAdded, onCancel, isReply }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await commentsApi.create(postId, {
        content: content.trim(),
        parent_id: parentId || null,
      });
      onCommentAdded(response.data);
      setContent('');
    } catch (err) {
      setError('Failed to post comment. Please try again.');
      console.error('Error creating comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={`comment-form ${isReply ? 'is-reply' : ''}`} onSubmit={handleSubmit}>
      {error && <div className="comment-form-error">{error}</div>}

      <div className="comment-form-input-wrapper">
        <textarea
          className="textarea comment-form-input"
          placeholder={isReply ? 'Write a reply...' : 'Write a comment...'}
          rows={isReply ? 2 : 3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="comment-form-actions">
        {isReply && onCancel && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={submitting || !content.trim()}
        >
          <Send size={14} />
          {submitting ? 'Posting...' : isReply ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
