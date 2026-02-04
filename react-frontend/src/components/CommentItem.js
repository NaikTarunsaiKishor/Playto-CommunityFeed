'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { commentsApi } from '../services/api';
import { formatTimeAgo, formatNumber } from '../utils/formatTime';
import CommentForm from './CommentForm';
import './CommentItem.css';

const MAX_DEPTH = 5;

function CommentItem({
  comment,
  postId,
  depth,
  onReplyAdded,
  onCommentDeleted,
  onCommentUpdated,
}) {
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;

    try {
      setLiking(true);
      if (comment.is_liked) {
        await commentsApi.unlike(comment.id);
        onCommentUpdated({
          ...comment,
          is_liked: false,
          like_count: comment.like_count - 1,
        });
      } else {
        await commentsApi.like(comment.id);
        onCommentUpdated({
          ...comment,
          is_liked: true,
          like_count: comment.like_count + 1,
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleReplyAdded = (newReply) => {
    onReplyAdded(newReply);
    setShowReplyForm(false);
    setShowReplies(true);
  };

  const author = comment.author || {};
  const authorName = author.username || 'Anonymous';
  const authorKarma = author.karma || 0;
  const authorAvatar = author.avatar;
  const children = comment.children || [];
  const hasReplies = children.length > 0;

  return (
    <div className={`comment-item depth-${Math.min(depth, MAX_DEPTH)}`}>
      <div className="comment-content">
        <div className="comment-header">
          <div className="comment-author">
            <div className="avatar avatar-sm">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} />
              ) : (
                authorName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="author-info">
              <span className="author-name">{authorName}</span>
              <span className="badge badge-sm">
                <Award size={10} />
                {formatNumber(authorKarma)}
              </span>
              <span className="comment-time text-muted text-xs">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
          </div>
        </div>

        <p className="comment-text">{comment.content}</p>

        <div className="comment-actions">
          <button
            className={`btn btn-ghost btn-sm comment-action ${comment.is_liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={liking}
          >
            <Heart size={14} fill={comment.is_liked ? 'currentColor' : 'none'} />
            <span>{comment.like_count || 0}</span>
          </button>

          {depth < MAX_DEPTH && (
            <button
              className="btn btn-ghost btn-sm comment-action"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageCircle size={14} />
              <span>Reply</span>
            </button>
          )}

          {hasReplies && (
            <button
              className="btn btn-ghost btn-sm comment-action"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>
                {showReplies ? 'Hide' : 'Show'} {children.length}{' '}
                {children.length === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="reply-form-container">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onCommentAdded={handleReplyAdded}
              onCancel={() => setShowReplyForm(false)}
              isReply
            />
          </div>
        )}
      </div>

      {hasReplies && showReplies && (
        <div className="comment-replies">
          {children.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onReplyAdded={onReplyAdded}
              onCommentDeleted={onCommentDeleted}
              onCommentUpdated={onCommentUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentItem;
