import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../components/Navigation';
import CommunityPost from '../components/CommunityPost';
import CreatePostModal from '../components/CreatePostModal';
import { getApiUrl } from '../config/api';
import '../styles/CommunityPage.css';

const CommunityPage = ({ onBack, onViewAdventure }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async (pageNum = 1, reset = true) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const response = await fetch(`${getApiUrl('node')}/api/community?page=${pageNum}&sortBy=${sortBy}`, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(pageNum < data.totalPages);
        setPage(pageNum);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Network error - please check if Node.js server is running on port 3001');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Add a method to refresh posts without losing state
  const handleRefresh = () => {
    setLoading(true);
    fetchPosts(1, true);
  };

  const handleCreatePost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setLoading(true);
      fetchPosts(page + 1, false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, likes: Array(data.likes).fill(null), isLiked: data.isLiked }
            : post
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });

      if (response.ok) {
        const newComment = await response.json();
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, comments: [...(post.comments || []), newComment] }
            : post
        ));
        return true;
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
    return false;
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="community-container">
        <Navigation 
          onHomeClick={onBack}
          showBackButton={true}
          onBackClick={onBack}
          currentPage="community"
          onViewAdventure={onViewAdventure}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="community-container">
      <Navigation 
        onHomeClick={onBack}
        showBackButton={true}
        onBackClick={onBack}
        currentPage="community"
        onViewAdventure={onViewAdventure}
        onViewCommunity={() => {}} // Empty function since we're already on community
      />
      
      <div className="community-content">
        <div className="community-header">
          <div className="header-content">
            <h1>🌍 Travel Community</h1>
            <p>Share your adventures, inspire others, and discover amazing stories from fellow travelers</p>
          </div>
          
          <div className="header-actions">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Latest</option>
              <option value="likes">Most Liked</option>
              <option value="comments">Most Discussed</option>
            </select>
            
            <button onClick={() => setShowCreateModal(true)} className="create-post-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Share Your Story
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button 
              onClick={handleRefresh} // Use handleRefresh instead of window.location.reload
              style={{ marginLeft: '1rem', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="posts-container">
          {posts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>No Stories Yet</h3>
              <p>Be the first to share your travel adventure with the community!</p>
              <button onClick={() => setShowCreateModal(true)} className="create-first-post-btn">
                Create First Post
              </button>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <CommunityPost
                  key={post._id}
                  post={post}
                  onLike={handleLikePost}
                  onAddComment={handleAddComment}
                  onViewAdventure={onViewAdventure}
                  onDeletePost={handleDeletePost}
                  onUpdatePost={handleUpdatePost}
                />
              ))}
              
              {hasMore && (
                <div className="load-more-container">
                  <button onClick={handleLoadMore} className="load-more-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="loading-spinner-small">
                          <div className="spinner-small"></div>
                        </div>
                        Loading...
                      </>
                    ) : (
                      'Load More Stories'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreatePost={handleCreatePost}
        />
      )}
    </div>
  );
};

export default CommunityPage;