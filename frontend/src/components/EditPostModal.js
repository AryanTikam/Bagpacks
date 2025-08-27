import React, { useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/CreatePostModal.css';

const EditPostModal = ({ post, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: post.title || '',
    story: post.story || '',
    tags: post.tags ? post.tags.join(', ') : ''
  });
  const [mediaUrls, setMediaUrls] = useState(
    post.media ? post.media.map(m => m.url) : ['']
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
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
    
    // Remove any query parameters for better detection
    const cleanUrl = url.split('?')[0].toLowerCase();
    
    // Video detection - prioritize video platforms and extensions
    if (url.includes('youtube.com/watch') || 
        url.includes('youtu.be/') || 
        url.includes('vimeo.com/') ||
        cleanUrl.endsWith('.mp4') || 
        cleanUrl.endsWith('.webm') || 
        cleanUrl.endsWith('.mov') ||
        cleanUrl.endsWith('.avi') ||
        cleanUrl.endsWith('.mkv') ||
        cleanUrl.endsWith('.flv')) {
      return 'video';
    }
    
    // GIF detection - be more specific
    if (cleanUrl.endsWith('.gif') ||
        url.includes('giphy.com/gifs/') || 
        url.includes('tenor.com/view/') ||
        url.includes('gfycat.com/')) {
      return 'gif';
    }
    
    // Image detection - be more comprehensive
    if (cleanUrl.endsWith('.jpg') || 
        cleanUrl.endsWith('.jpeg') ||
        cleanUrl.endsWith('.png') || 
        cleanUrl.endsWith('.webp') ||
        cleanUrl.endsWith('.svg') ||
        cleanUrl.endsWith('.bmp') ||
        cleanUrl.endsWith('.tiff') ||
        url.includes('imgur.com/') ||
        url.includes('i.imgur.com/') ||
        url.includes('instagram.com/p/') ||
        url.includes('unsplash.com/photos/') ||
        url.includes('pexels.com/photo/')) {
      return 'image';
    }
    
    // Default to image for most URLs (this covers many image hosting services)
    return 'image';
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
      
      const processedMedia = mediaUrls
        .filter(url => url.trim())
        .map(url => ({
          type: detectMediaType(url),
          url: url.trim(),
          caption: ''
        }));

      const postData = {
        title: formData.title,
        story: formData.story,
        media: processedMedia,
        tags: formData.tags 
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).slice(0, 10)
          : []
      };

      const response = await fetch(`${getApiUrl('node')}/api/community/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const updatedPost = await response.json();
        onUpdate(updatedPost);
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Failed to update post' });
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Your Story</h2>
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
              placeholder="Tell us about your adventure..."
              rows={8}
              maxLength={5000}
              className={errors.story ? 'error' : ''}
            />
            {errors.story && <span className="error-message">{errors.story}</span>}
            <small className="char-count">{formData.story.length}/5000</small>
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
                  Updating...
                </>
              ) : (
                'Update Story'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;