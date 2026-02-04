'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Award } from 'lucide-react';
import { postsApi } from '../services/api';
import { formatTimeAgo, formatNumber } from '../utils/formatTime';
import CommentThread from './CommentThread';
import './PostCard.css';

function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    
    try {
      setLiking(true);
      if (post.is_liked) {
        await postsApi.unlike(post.id);
        onPostUpdated({
          ...post,
          is_liked: false,
          like_count: post.like_count - 1,
        });
      } else {
        await postsApi.like(post.id);
        onPostUpdated({
          ...post,
          is_liked: true,
          like_count: post.like_count + 1,
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLiking(false);
    }
  };

  const author = post.author || {};
  const authorName = author.username || 'Anonymous';
  const authorKarma = author.karma || 0;
  const authorAvatar = author.avatar;

  return (
    <article className="card post-card">
      <header className="post-header">
        <div className="post-author">
          <div className="avatar">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} />
            ) : (
              authorName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="author-info">
            <div className="author-name-row">
              <span className="author-name">{authorName}</span>
              <span className="badge">
                <Award size={12} />
                {formatNumber(authorKarma)} karma
              </span>
            </div>
            <time className="post-time text-muted text-xs">
              {formatTimeAgo(post.created_at)}
            </time>
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" aria-label="More options">
          <MoreHorizontal size={16} />
        </button>
      </header>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-body">{post.content}</p>
      </div>

      <footer className="post-footer">
        <button
          className={`btn btn-ghost post-action ${post.is_liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={liking}
        >
          <Heart size={18} fill={post.is_liked ? 'currentColor' : 'none'} />
          <span>{formatNumber(post.like_count || 0)}</span>
        </button>

        <button
          className="btn btn-ghost post-action"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} />
          <span>{formatNumber(post.comment_count || 0)}</span>
        </button>

        <button className="btn btn-ghost post-action">
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </footer>

      {showComments && (
        <CommentThread
          postId={post.id}
          onCommentCountChange={(delta) =>
            onPostUpdated({
              ...post,
              comment_count: (post.comment_count || 0) + delta,
            })
          }
        />
      )}
    </article>
  );
}

export default PostCard;
