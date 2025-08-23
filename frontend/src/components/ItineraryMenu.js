import React, { useRef, useState, useCallback } from "react";
import "../styles/ItineraryMenu.css";

function ItineraryMenu({
  places,
  onRemove,
  onGenerate,
  onClose,
  isGenerating,
  itinerary,
  onDownload,
  onViewItinerary,
  itineraryOptions,
  setItineraryOptions,
}) {
  const [position, setPosition] = useState({ x: window.innerWidth - 440, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showOptions, setShowOptions] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const menuRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    
    const rect = menuRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    
    const newX = Math.min(
      Math.max(e.clientX - dragOffset.x, 0), 
      window.innerWidth - 400
    );
    const newY = Math.min(
      Math.max(e.clientY - dragOffset.y, 0), 
      window.innerHeight - 100
    );
    
    setPosition({ x: newX, y: newY });
  }, [dragging, dragOffset.x, dragOffset.y]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  React.useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Handle form changes
  const handleOptionChange = (e) => {
    setItineraryOptions({
      ...itineraryOptions,
      [e.target.name]: e.target.value,
    });
  };

  // Handle download - Only PDF now with template selection
  const handleDownload = async () => {
    if (!itinerary) {
      alert('Please generate an itinerary first.');
      return;
    }
    
    setDownloadingPdf(true);
    try {
      await onDownload('pdf', 'modern'); // Use existing itinerary
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div
      ref={menuRef}
      className={`itinerary-menu${dragging ? " dragging" : ""}`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="itinerary-menu-header" onMouseDown={handleMouseDown}>
        <span>My Itinerary</span>
        <button
          onClick={() => setShowOptions((v) => !v)}
          className="itinerary-menu-close"
          title="Personalize itinerary"
          style={{ marginRight: 8 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
        <button
          onClick={onClose}
          className="itinerary-menu-close"
        >
          ×
        </button>
      </div>
      
      {/* Options section - now using the showOptions state properly */}
      {showOptions && (
        <div className="itinerary-menu-options">
          <label>
            Days:
            <input
              type="number"
              name="days"
              min="1"
              max="30"
              value={itineraryOptions.days}
              onChange={handleOptionChange}
            />
          </label>
          <label>
            Budget (₹):
            <input
              type="number"
              name="budget"
              min="0"
              step="1000"
              value={itineraryOptions.budget}
              onChange={handleOptionChange}
            />
          </label>
          <label>
            People:
            <input
              type="number"
              name="people"
              min="1"
              max="20"
              value={itineraryOptions.people}
              onChange={handleOptionChange}
            />
          </label>
        </div>
      )}
      
      <ul>
        {places.map((p, i) => (
          <li key={i}>
            <span>{p.name}</span>
            <button
              onClick={() => onRemove(p)}
              className="itinerary-menu-remove"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </li>
        ))}
      </ul>
      
      <div className="itinerary-menu-generate">
        <button onClick={onGenerate} disabled={isGenerating || places.length < 2}>
          {isGenerating ? (
            <>
              <div className="loading-spinner-small">
                <div className="spinner-small"></div>
              </div>
              Generating...
            </>
          ) : (
            "Generate Itinerary"
          )}
        </button>
      </div>
      
      {itinerary && (
        <div className="itinerary-menu-plan">
          <h3>Itinerary Generated!</h3>
          <p>Your personalized travel itinerary is ready.</p>
          <div className="itinerary-actions">
            <button onClick={onViewItinerary} className="view-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              View Itinerary
            </button>
            
            {/* Only PDF download button - DOCX removed */}
            <button 
              onClick={handleDownload} 
              className="download-button pdf-download"
              disabled={downloadingPdf}
            >
              {downloadingPdf ? (
                <>
                  <div className="loading-spinner-small">
                    <div className="spinner-small"></div>
                  </div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Quick Download (Modern)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItineraryMenu;