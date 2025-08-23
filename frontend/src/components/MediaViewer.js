import React, { useState } from 'react';
import '../styles/MediaViewer.css';

const MediaViewer = ({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleImageError = (mediaUrl) => {
    setImageErrors(prev => new Set([...prev, mediaUrl]));
  };

  const getYouTubeEmbedUrl = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const getVimeoEmbedUrl = (url) => {
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  const renderMedia = (mediaItem, isFullscreen = false) => {
    const className = isFullscreen ? 'media-fullscreen' : 'media-item';
    
    // Check if this specific media has errored
    const hasError = imageErrors.has(mediaItem.url);
    
    switch (mediaItem.type) {
      case 'image':
        if (hasError) {
          return (
            <div className={`${className} media-error`}>
              <div className="error-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <p>Image failed to load</p>
                <span className="error-url">{mediaItem.url.substring(0, 50)}...</span>
              </div>
            </div>
          );
        }
        
        return (
          <img 
            src={mediaItem.url} 
            alt={mediaItem.caption || 'Travel photo'} 
            className={className}
            onClick={() => !isFullscreen && setFullscreen(true)}
            onError={() => handleImageError(mediaItem.url)}
            loading="lazy"
          />
        );
        
      case 'video':
        // Handle YouTube videos
        if (mediaItem.url.includes('youtube.com') || mediaItem.url.includes('youtu.be')) {
          const embedUrl = getYouTubeEmbedUrl(mediaItem.url);
          if (embedUrl) {
            return (
              <iframe
                src={embedUrl}
                className={className}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
              />
            );
          }
        }
        
        // Handle Vimeo videos
        if (mediaItem.url.includes('vimeo.com')) {
          const embedUrl = getVimeoEmbedUrl(mediaItem.url);
          if (embedUrl) {
            return (
              <iframe
                src={embedUrl}
                className={className}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Vimeo video"
              />
            );
          }
        }
        
        // Handle direct video files
        return (
          <video 
            src={mediaItem.url} 
            controls 
            className={className}
            onClick={() => !isFullscreen && setFullscreen(true)}
            onError={() => handleImageError(mediaItem.url)}
          >
            Your browser does not support the video tag.
          </video>
        );
        
      case 'gif':
        if (hasError) {
          return (
            <div className={`${className} media-error`}>
              <div className="error-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <p>GIF failed to load</p>
                <span className="error-url">{mediaItem.url.substring(0, 50)}...</span>
              </div>
            </div>
          );
        }
        
        return (
          <img 
            src={mediaItem.url} 
            alt={mediaItem.caption || 'GIF'} 
            className={className}
            onClick={() => !isFullscreen && setFullscreen(true)}
            onError={() => handleImageError(mediaItem.url)}
            loading="lazy"
          />
        );
        
      default:
        return (
          <div className={`${className} media-error`}>
            <div className="error-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <p>Unsupported media type</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="media-viewer">
        <div className="media-container">
          {renderMedia(currentMedia)}
          
          {media.length > 1 && (
            <>
              <button onClick={prevMedia} className="media-nav prev">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button onClick={nextMedia} className="media-nav next">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              
              <div className="media-indicators">
                {media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {currentMedia.caption && (
          <p className="media-caption">{currentMedia.caption}</p>
        )}
      </div>

      {fullscreen && (
        <div className="media-fullscreen-overlay" onClick={() => setFullscreen(false)}>
          <div className="fullscreen-container">
            <button 
              onClick={() => setFullscreen(false)} 
              className="close-fullscreen"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            
            {renderMedia(currentMedia, true)}
            
            {media.length > 1 && (
              <>
                <button onClick={prevMedia} className="media-nav prev fullscreen-nav">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <button onClick={nextMedia} className="media-nav next fullscreen-nav">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MediaViewer;