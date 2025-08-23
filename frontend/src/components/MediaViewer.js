import React, { useState } from 'react';
import '../styles/MediaViewer.css';

const MediaViewer = ({ media }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const renderMedia = (mediaItem, isFullscreen = false) => {
    const className = isFullscreen ? 'media-fullscreen' : 'media-item';
    
    switch (mediaItem.type) {
      case 'image':
        return (
          <img 
            src={mediaItem.url} 
            alt={mediaItem.caption || 'Travel photo'} 
            className={className}
            onClick={() => !isFullscreen && setFullscreen(true)}
          />
        );
      case 'video':
        return (
          <video 
            src={mediaItem.url} 
            controls 
            className={className}
            onClick={() => !isFullscreen && setFullscreen(true)}
          />
        );
      case 'gif':
        return (
          <img 
            src={mediaItem.url} 
            alt={mediaItem.caption || 'GIF'} 
            className={className}
            onClick={() => !isFullscreen && setFullscreen(true)}
          />
        );
      default:
        return null;
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