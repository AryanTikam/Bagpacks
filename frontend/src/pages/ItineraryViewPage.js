import React from "react";
import Navigation from "../components/Navigation";
import ReactMarkdown from "react-markdown";
import "../styles/ItineraryViewPage.css";

function ItineraryViewPage({ 
  itinerary, 
  places, 
  itineraryOptions, 
  onBack, 
  onDownload, 
  destination,
  onViewAdventure 
}) {
  const handleDownload = (format) => {
    onDownload(format);
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

  return (
    <div className="itinerary-view-container">
      <Navigation 
        onHomeClick={onBack}
        showBackButton={true}
        onBackClick={onBack}
        currentPage="itinerary"
        onViewAdventure={onViewAdventure}
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
                {itineraryOptions.days} {itineraryOptions.days === 1 ? 'Day' : 'Days'}
              </span>
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {itineraryOptions.people} {itineraryOptions.people === 1 ? 'Person' : 'People'}
              </span>
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                ₹{itineraryOptions.budget}
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
            <button onClick={() => handleDownload('docx')} className="action-button docx">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Download DOCX
            </button>
            <button onClick={() => handleDownload('pdf')} className="action-button pdf">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Download PDF
            </button>
          </div>
        </div>

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
              <button onClick={() => handleDownload('docx')} className="action-button docx">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Download DOCX
              </button>
              <button onClick={() => handleDownload('pdf')} className="action-button pdf">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Download PDF
              </button>
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