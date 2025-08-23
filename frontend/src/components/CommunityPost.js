import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MediaViewer from './MediaViewer';
import CommentSection from './CommentSection';
import EditPostModal from './EditPostModal';
import { getApiUrl } from '../config/api';
import '../styles/CommunityPost.css';

const CommunityPost = ({ post, onLike, onAddComment, onViewAdventure, onDeletePost, onUpdatePost }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showFullStory, setShowFullStory] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const handleItineraryClick = () => {
    if (post.adventureId && onViewAdventure) {
      onViewAdventure(post.adventureId);
    }
  };

  const truncateStory = (story, maxLength = 300) => {
    if (story.length <= maxLength) return story;
    return story.substring(0, maxLength) + '...';
  };

  const isLiked = user && post.likes && post.likes.some(like => like === user.id);
  const isAuthor = user && post.userId && post.userId._id === user.id;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.story.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const shareText = `Check out this travel story: "${post.title}" - ${post.story.substring(0, 100)}...`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText + ` ${window.location.href}`);
      alert('Story link copied to clipboard!');
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = shareText + ` ${window.location.href}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Story link copied to clipboard!');
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onDeletePost(post._id);
        setShowDeleteConfirm(false);
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  return (
    <div className="community-post">
      <div className="post-header">
        <div className="author-info">
          <div className="author-avatar">
            {post.userId?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="author-details">
            <h3 className="author-name">{post.userId?.username || 'Anonymous'}</h3>
            <span className="post-time">
              {formatDate(post.createdAt)}
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <span className="edited-indicator"> (edited)</span>
              )}
            </span>
          </div>
        </div>
        
        <div className="post-header-actions">
          {post.adventureId && (
            <button 
              onClick={handleItineraryClick}
              className="itinerary-badge"
              title="View itinerary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2M15 11h4a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 7h6M9 11h6M11 15h2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {post.adventureId.destination || 'View Itinerary'}
            </button>
          )}
          
          {isAuthor && (
            <div className="author-actions">
              <button 
                onClick={() => setShowEditModal(true)}
                className="edit-post-btn"
                title="Edit post"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="delete-post-btn"
                title="Delete post"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2"/>
                  <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="post-content">
        <h2 className="post-title">{post.title}</h2>
        
        <div className="post-story">
          <p>
            {showFullStory ? post.story : truncateStory(post.story)}
          </p>
          {post.story.length > 300 && (
            <button 
              onClick={() => setShowFullStory(!showFullStory)}
              className="read-more-btn"
            >
              {showFullStory ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {post.media && post.media.length > 0 && (
          <MediaViewer media={post.media} />
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="post-actions">
        <button 
          onClick={() => onLike(post._id)}
          className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill={isLiked ? "currentColor" : "none"}
            />
          </svg>
          {post.likes?.length || 0}
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="action-btn comment-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {post.comments?.length || 0}
        </button>

        <button 
          onClick={handleShare}
          className="action-btn share-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Share
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post._id}
          comments={post.comments || []}
          onAddComment={onAddComment}
        />
      )}
      
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedPost) => {
            onUpdatePost(updatedPost);
            setShowEditModal(false);
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h3>Delete Post?</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="delete-confirmation-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-delete-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeletePost}
                className="confirm-delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPost;