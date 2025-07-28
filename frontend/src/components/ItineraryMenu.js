import React, { useRef, useState } from "react";
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
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const rect = menuRef.current.getBoundingClientRect();
    setDragging(true);
    setRel({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: Math.min(Math.max(e.clientX - rel.x, 0), window.innerWidth - 400),
      y: Math.min(Math.max(e.clientY - rel.y, 0), window.innerHeight - 100),
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = "";
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line
  }, [dragging, rel]);

  // Handle form changes
  const handleOptionChange = (e) => {
    setItineraryOptions({
      ...itineraryOptions,
      [e.target.name]: e.target.value,
    });
  };

  // Handle download with format selection
  const handleDownload = (format) => {
    onDownload(format);
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
      {showOptions && (
        <div className="itinerary-menu-options">
          <label>
            Days:
            <input
              type="number"
              name="days"
              min="1"
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
          {isGenerating ? "Generating..." : "Generate Itinerary"}
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
            <div className="download-buttons">
              <button onClick={() => handleDownload('docx')} className="download-button">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                </svg>
                DOCX
              </button>
              <button onClick={() => handleDownload('pdf')} className="download-button">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                </svg>
                PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItineraryMenu;