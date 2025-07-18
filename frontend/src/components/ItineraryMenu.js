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
}) {
  const [position, setPosition] = useState({ x: window.innerWidth - 440, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
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

  return (
    <div
      ref={menuRef}
      className={`itinerary-menu${dragging ? " dragging" : ""}`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div
        className="itinerary-menu-header"
        onMouseDown={handleMouseDown}
      >
        <span>🗺️ My Itinerary</span>
        <button
          onClick={onClose}
          className="itinerary-menu-close"
        >
          ×
        </button>
      </div>
      <ul>
        {places.map((p, i) => (
          <li key={i}>
            <span>{p.name}</span>
            <button
              onClick={() => onRemove(p)}
              className="itinerary-menu-remove"
            >
              ❌
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
          <h3>Suggested Plan</h3>
          <div className="itinerary-menu-plan-content">
            {itinerary.text}
          </div>
          <button onClick={onDownload}>Download PDF</button>
        </div>
      )}
    </div>
  );
}

export default ItineraryMenu;