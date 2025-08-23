import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import '../styles/CommentSection.css';

const CommentSection = ({ postId, comments, onAddComment }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState(new Set());

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await onAddComment(postId, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleSubmitReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: replyText })
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }

    setReplyText('');
    setReplyingTo(null);
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${getApiUrl('node')}/api/community/${postId}/comments/${commentId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleLikeReply = async (commentId, replyId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${getApiUrl('node')}/api/community/${postId}/comments/${commentId}/replies/${replyId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const toggleExpandComment = (commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-section">
      {user && (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <div className="comment-input-container">
            <div className="user-avatar small">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <textarea
              className="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows="3"
            />
            <button type="submit" className="submit-comment-btn">
              Post
            </button>
          </div>
        </form>
      )}

      <div className="comments-list">
        {comments?.map((comment) => (
          <div key={comment._id} className="comment">
            <div className="comment-header">
              <div className="user-avatar small">
                {comment.userId?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="comment-username">{comment.userId?.username}</span>
                <span className="comment-time">{formatDate(comment.createdAt)}</span>
              </div>
            </div>
            
            <div className="comment-content">
              <p>{comment.text}</p>
            </div>

            <div className="comment-actions">
              <button 
                onClick={() => handleLikeComment(comment._id)}
                className="comment-action-btn"
              >
                👍 {comment.likes?.length || 0}
              </button>
              
              {user && (
                <button 
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className="comment-action-btn"
                >
                  Reply
                </button>
              )}

              {comment.replies?.length > 0 && (
                <button 
                  onClick={() => toggleExpandComment(comment._id)}
                  className="comment-action-btn"
                >
                  {expandedComments.has(comment._id) ? 'Hide' : 'Show'} {comment.replies.length} replies
                </button>
              )}
            </div>

            {replyingTo === comment._id && (
              <div className="reply-form">
                <div className="reply-input-container">
                  <textarea
                    className="reply-input"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    rows="2"
                  />
                  <button 
                    onClick={() => handleSubmitReply(comment._id)}
                    className="submit-reply-btn"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {expandedComments.has(comment._id) && comment.replies?.length > 0 && (
              <div className="replies-list">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="reply">
                    <div className="reply-header">
                      <div className="user-avatar small">
                        {reply.userId?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="reply-username">{reply.userId?.username}</span>
                        <span className="reply-time">{formatDate(reply.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="reply-content">
                      <p>{reply.text}</p>
                    </div>

                    <div className="reply-actions">
                      <button 
                        onClick={() => handleLikeReply(comment._id, reply._id)}
                        className="comment-action-btn"
                      >
                        👍 {reply.likes?.length || 0}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;