'use client';

import React, { useState, useEffect } from 'react';
import { commentsApi } from '../services/api';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import './CommentThread.css';

function CommentThread({ postId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await commentsApi.getByPost(postId);
        setComments(response.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load comments');
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleCommentAdded = (newComment) => {
    if (newComment.parent_id) {
      // Add reply to existing comment tree
      const addReplyToTree = (comments) => {
        return comments.map((comment) => {
          if (comment.id === newComment.parent_id) {
            return {
              ...comment,
              children: [...(comment.children || []), newComment],
            };
          }
          if (comment.children && comment.children.length > 0) {
            return {
              ...comment,
              children: addReplyToTree(comment.children),
            };
          }
          return comment;
        });
      };
      setComments(addReplyToTree(comments));
    } else {
      // Add top-level comment
      setComments([newComment, ...comments]);
    }
    onCommentCountChange(1);
  };

  const handleCommentDeleted = (commentId) => {
    const removeFromTree = (comments) => {
      return comments
        .filter((comment) => comment.id !== commentId)
        .map((comment) => ({
          ...comment,
          children: comment.children ? removeFromTree(comment.children) : [],
        }));
    };
    setComments(removeFromTree(comments));
    onCommentCountChange(-1);
  };

  const handleCommentUpdated = (updatedComment) => {
    const updateInTree = (comments) => {
      return comments.map((comment) => {
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment };
        }
        if (comment.children && comment.children.length > 0) {
          return {
            ...comment,
            children: updateInTree(comment.children),
          };
        }
        return comment;
      });
    };
    setComments(updateInTree(comments));
  };

  if (loading) {
    return (
      <div className="comment-thread">
        <div className="comment-thread-loading">
          <div className="skeleton" style={{ height: 60, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 60, marginBottom: 8 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comment-thread">
        <p className="comment-thread-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="comment-thread">
      <div className="comment-thread-header">
        <h4 className="comment-thread-title">Comments</h4>
      </div>

      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              depth={0}
              onReplyAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
              onCommentUpdated={handleCommentUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default CommentThread;
