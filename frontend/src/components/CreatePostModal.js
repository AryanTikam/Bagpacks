import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ onClose, onCreatePost }) => {
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    adventureId: '',
    tags: '',
    media: []
  });
  const [adventures, setAdventures] = useState([]);
  const [mediaUrls, setMediaUrls] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAdventures();
  }, []);

  const fetchAdventures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/adventures`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdventures(data);
      }
    } catch (err) {
      console.error('Error fetching adventures:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleMediaUrlChange = (index, value) => {
    const newUrls = [...mediaUrls];
    newUrls[index] = value;
    setMediaUrls(newUrls);
  };

  const addMediaUrl = () => {
    setMediaUrls([...mediaUrls, '']);
  };

  const removeMediaUrl = (index) => {
    const newUrls = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(newUrls);
  };

  const detectMediaType = (url) => {
    if (!url) return null;
    
    // Simple detection based on URL patterns
    if (url.includes('giphy.com') || url.includes('tenor.com') || url.endsWith('.gif')) {
      return 'gif';
    }
    if (url.includes('youtube.com') || url.includes('vimeo.com') || url.endsWith('.mp4') || url.endsWith('.webm')) {
      return 'video';
    }
    if (url.includes('imgur.com') || url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg')) {
      return 'image';
    }
    return 'image'; // default
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.story.trim()) {
      newErrors.story = 'Story is required';
    } else if (formData.story.length > 5000) {
      newErrors.story = 'Story must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        onCreatePost(data);
        onClose();
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Failed to create post' });
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setErrors({ general: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Share Your Adventure Story</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your story a catchy title..."
              maxLength={200}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
            <small className="char-count">{formData.title.length}/200</small>
          </div>

          <div className="form-group">
            <label htmlFor="story">Your Story *</label>
            <textarea
              id="story"
              name="story"
              value={formData.story}
              onChange={handleChange}
              placeholder="Tell us about your adventure... What made it special? What did you discover? Any tips for fellow travelers?"
              rows={8}
              maxLength={5000}
              className={errors.story ? 'error' : ''}
            />
            {errors.story && <span className="error-message">{errors.story}</span>}
            <small className="char-count">{formData.story.length}/5000</small>
          </div>

          <div className="form-group">
            <label htmlFor="adventureId">Link Itinerary (Optional)</label>
            <select
              id="adventureId"
              name="adventureId"
              value={formData.adventureId}
              onChange={handleChange}
            >
              <option value="">Choose an itinerary to share...</option>
              {adventures.map((adventure) => (
                <option key={adventure._id} value={adventure._id}>
                  {adventure.destination} - {new Date(adventure.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Media (Images, Videos, GIFs)</label>
            <p className="form-help">Add links to your photos/videos from Imgur, Giphy, YouTube, etc.</p>
            {mediaUrls.map((url, index) => (
              <div key={index} className="media-input-group">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleMediaUrlChange(index, e.target.value)}
                  placeholder="https://imgur.com/... or https://giphy.com/..."
                  className="media-input"
                />
                {mediaUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMediaUrl(index)}
                    className="remove-media-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {mediaUrls.length < 5 && (
              <button
                type="button"
                onClick={addMediaUrl}
                className="add-media-btn"
              >
                + Add Media
              </button>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="adventure, mountains, solo travel, backpacking..."
            />
            <small className="form-help">Separate tags with commas. Max 10 tags.</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner-small">
                    <div className="spinner-small"></div>
                  </div>
                  Sharing...
                </>
              ) : (
                'Share Story'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;