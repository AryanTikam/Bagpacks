import React, { useState } from "react";
import Navigation from "../components/Navigation";
import ReactMarkdown from "react-markdown";
import TemplateSelectionPage from "./TemplateSelectionPage";
import "../styles/ItineraryViewPage.css";

function ItineraryViewPage({ 
  itinerary, 
  places, 
  itineraryOptions, 
  onBack, 
  onDownload, 
  destination,
  onViewAdventure,
  onViewCommunity
}) {
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);

  // Handle case where itinerary might be undefined
  if (!itinerary || !itinerary.text) {
    return (
      <div className="itinerary-view-container">
        <Navigation 
          onHomeClick={onBack}
          showBackButton={true}
          onBackClick={onBack}
          currentPage="itinerary"
          onViewAdventure={onViewAdventure}
          onViewCommunity={onViewCommunity}
        />
        
        <div className="itinerary-view-content">
          <div className="error-container">
            <h2>Itinerary Not Available</h2>
            <p>The itinerary for this adventure is not available or could not be loaded.</p>
            <button onClick={onBack} className="back-button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadClick = () => {
    setShowTemplateSelection(true);
  };

  const handleTemplateDownload = async (templateId) => {
    try {
      await onDownload("pdf", templateId);
      setShowTemplateSelection(false);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const formatDate = (daysFromNow) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show template selection page if requested
  if (showTemplateSelection) {
    return (
      <TemplateSelectionPage
        onBack={() => setShowTemplateSelection(false)}
        onGeneratePDF={handleTemplateDownload}
        itinerary={itinerary}
        places={places}
        itineraryOptions={itineraryOptions}
        destination={destination}
        onViewAdventure={onViewAdventure}
        onViewCommunity={onViewCommunity} 
      />
    );
  }

  // Download button component
  const DownloadButton = ({ onClick, children }) => (
    <button 
      onClick={onClick} 
      className="action-button pdf"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
        <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
      {children}
    </button>
  );

  return (
    <div className="itinerary-view-container">
      <Navigation 
        onHomeClick={onBack}
        showBackButton={true}
        onBackClick={onBack}
        currentPage="itinerary"
        onViewAdventure={onViewAdventure}
        onViewCommunity={onViewCommunity}
      />
      
      <div className="itinerary-view-content">
        <div className="itinerary-header">
          <div className="itinerary-title">
            <h1>Your {destination} Adventure</h1>
            <div className="itinerary-meta">
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {itineraryOptions?.days || 3} {(itineraryOptions?.days || 3) === 1 ? 'Day' : 'Days'}
              </span>
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {itineraryOptions?.people || 2} {(itineraryOptions?.people || 2) === 1 ? 'Person' : 'People'}
              </span>
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                ₹{itineraryOptions?.budget || 10000}
              </span>
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {formatDate(0)}
              </span>
            </div>
          </div>
          
          <div className="itinerary-actions">
            <DownloadButton onClick={handleDownloadClick}>
              Choose Template & Download
            </DownloadButton>
          </div>
        </div>

        {places && places.length > 0 && (
          <div className="itinerary-places">
            <h2>Places to Visit</h2>
            <div className="places-grid">
              {places.map((place, index) => (
                <div key={index} className="place-card">
                  <span className="place-number">{index + 1}</span>
                  <span className="place-name">{place.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="itinerary-content">
          <h2>Detailed Itinerary</h2>
          <div className="markdown-content">
            <ReactMarkdown>{itinerary.text}</ReactMarkdown>
          </div>
        </div>

        <div className="itinerary-footer">
          <div className="footer-actions">
            <button onClick={onBack} className="back-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Map
            </button>
            <div className="download-actions">
              <DownloadButton onClick={handleDownloadClick}>
                Choose Template & Download
              </DownloadButton>
            </div>
          </div>
          
          <div className="footer-info">
            <p>Generated by Bagpack AI • Have a wonderful trip!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItineraryViewPage;