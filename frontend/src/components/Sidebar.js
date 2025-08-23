// --- src/components/Sidebar.js ---
import React, { useRef, useEffect } from "react";
import "../styles/Sidebar.css";

function Sidebar({ places, onResize, onAddToItinerary }) {
  const sidebarRef = useRef(null);
  const resizeHandleRef = useRef(null);

  useEffect(() => {
    const resizeHandle = resizeHandleRef.current;
    const parentContainer = sidebarRef.current?.parentElement;
    let startX, startWidth;

    function startResize(e) {
      e.preventDefault();
      startX = e.clientX;
      startWidth = parseInt(getComputedStyle(parentContainer).width, 10);
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResize);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    function resize(e) {
      if (!startX) return;
      const delta = e.clientX - startX;
      const newWidth = startWidth + delta;
      if (newWidth > 150 && newWidth < 600) {
        parentContainer.style.width = `${newWidth}px`;
        if (onResize) onResize(newWidth);
      }
    }

    function stopResize() {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      startX = null;
    }

    if (resizeHandle) {
      resizeHandle.addEventListener("mousedown", startResize);
    }

    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener("mousedown", startResize);
      }
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
    };
  }, [onResize]);

  // Debug function to see what data we're getting
  console.log("Sidebar places data:", places);

  const getPlaceDescription = (place) => {
    // Try multiple possible field names for description
    return place.description || 
           place.desc || 
           place.summary || 
           place.type || 
           place.category || 
           'Tourist attraction';
  };

  return (
    <div className="sidebar-wrapper">
      <div ref={sidebarRef} className="sidebar" style={{ width: "100%" }}>
        <h2>Suggested Places</h2>
        <ul className="place-list">
          {places && places.length > 0 ? (
            places.map((p, i) => (
              <li key={i} className="place-item">
                <h3>{p.name}</h3>
                <p>{getPlaceDescription(p)}</p>
                {onAddToItinerary && (
                  <button 
                    className="add-to-itinerary-btn"
                    onClick={() => onAddToItinerary(p)}
                  >
                    <span className="icon">✨</span>
                    Add to Itinerary
                  </button>
                )}
              </li>
            ))
          ) : (
            <li className="place-item">
              <h3>Loading places...</h3>
              <p>Discovering amazing destinations for you!</p>
            </li>
          )}
        </ul>
      </div>
      <div ref={resizeHandleRef} className="resize-handle"></div>
    </div>
  );
}

export default Sidebar;