import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import '../styles/CommentSection.css';

const CommentSection = ({ postId, comments, onAddComment }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editReplyText, setEditReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [localComments, setLocalComments] = useState(comments || []);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setLocalComments(prev => [...prev, newCommentData]);
        setNewComment('');
        if (onAddComment) {
          onAddComment(postId, newComment);
        }
      }
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
        const newReply = await response.json();
        setLocalComments(prev => 
          prev.map(comment => 
            comment._id === commentId 
              ? { ...comment, replies: [...(comment.replies || []), newReply] }
              : comment
          )
        );
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: editCommentText })
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setLocalComments(prev =>
          prev.map(comment =>
            comment._id === commentId ? updatedComment : comment
          )
        );
        setEditingComment(null);
        setEditCommentText('');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleEditReply = async (commentId, replyId) => {
    if (!editReplyText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/comments/${commentId}/replies/${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: editReplyText })
      });

      if (response.ok) {
        const updatedReply = await response.json();
        setLocalComments(prev =>
          prev.map(comment =>
            comment._id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.map(reply =>
                    reply._id === replyId ? updatedReply : reply
                  )
                }
              : comment
          )
        );
        setEditingReply(null);
        setEditReplyText('');
      }
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLocalComments(prev => prev.filter(comment => comment._id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLocalComments(prev =>
          prev.map(comment =>
            comment._id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.filter(reply => reply._id !== replyId)
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/comments/${commentId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocalComments(prev =>
          prev.map(comment =>
            comment._id === commentId
              ? { ...comment, likes: Array(data.likes).fill(null), isLiked: data.isLiked }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleLikeReply = async (commentId, replyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/comments/${commentId}/replies/${replyId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocalComments(prev =>
          prev.map(comment =>
            comment._id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.map(reply =>
                    reply._id === replyId
                      ? { ...reply, likes: Array(data.likes).fill(null), isLiked: data.isLiked }
                      : reply
                  )
                }
              : comment
          )
        );
      }
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

  const startEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.text);
  };

  const startEditReply = (reply) => {
    setEditingReply(reply._id);
    setEditReplyText(reply.text);
  };

  const isCommentAuthor = (comment) => {
    return user && comment.userId && (comment.userId._id === user.id || comment.userId === user.id);
  };

  const isReplyAuthor = (reply) => {
    return user && reply.userId && (reply.userId._id === user.id || reply.userId === user.id);
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
        {localComments?.map((comment) => (
          <div key={comment._id} className="comment">
            <div className="comment-header">
              <div className="user-avatar small">
                {comment.userId?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="comment-header-info">
                <span className="comment-username">{comment.userId?.username}</span>
                <span className="comment-time">
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <span className="edited-indicator"> (edited)</span>
                  )}
                </span>
              </div>
              
              {isCommentAuthor(comment) && (
                <div className="comment-menu">
                  <button
                    onClick={() => startEditComment(comment)}
                    className="comment-edit-btn"
                    title="Edit comment"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="comment-delete-btn"
                    title="Delete comment"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                      <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div className="comment-content">
              {editingComment === comment._id ? (
                <div className="edit-comment-form">
                  <textarea
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    className="edit-comment-input"
                    rows="3"
                  />
                  <div className="edit-comment-actions">
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditCommentText('');
                      }}
                      className="cancel-edit-btn"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      className="save-edit-btn"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p>{comment.text}</p>
              )}
            </div>

            {editingComment !== comment._id && (
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
            )}

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
                  <div className="reply-actions">
                    <button 
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="cancel-reply-btn"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSubmitReply(comment._id)}
                      className="submit-reply-btn"
                    >
                      Reply
                    </button>
                  </div>
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
                      <div className="reply-header-info">
                        <span className="reply-username">{reply.userId?.username}</span>
                        <span className="reply-time">
                          {formatDate(reply.createdAt)}
                          {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                            <span className="edited-indicator"> (edited)</span>
                          )}
                        </span>
                      </div>
                      
                      {isReplyAuthor(reply) && (
                        <div className="reply-menu">
                          <button
                            onClick={() => startEditReply(reply)}
                            className="reply-edit-btn"
                            title="Edit reply"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteReply(comment._id, reply._id)}
                            className="reply-delete-btn"
                            title="Delete reply"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                              <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="reply-content">
                      {editingReply === reply._id ? (
                        <div className="edit-reply-form">
                          <textarea
                            value={editReplyText}
                            onChange={(e) => setEditReplyText(e.target.value)}
                            className="edit-reply-input"
                            rows="2"
                          />
                          <div className="edit-reply-actions">
                            <button
                              onClick={() => {
                                setEditingReply(null);
                                setEditReplyText('');
                              }}
                              className="cancel-edit-btn"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditReply(comment._id, reply._id)}
                              className="save-edit-btn"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{reply.text}</p>
                      )}
                    </div>

                    {editingReply !== reply._id && (
                      <div className="reply-actions">
                        <button 
                          onClick={() => handleLikeReply(comment._id, reply._id)}
                          className="comment-action-btn"
                        >
                          👍 {reply.likes?.length || 0}
                        </button>
                      </div>
                    )}
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