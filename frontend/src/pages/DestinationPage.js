// --- src/pages/DestinationPage.js ---
import React, { useEffect, useState, useRef } from "react";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import Chatbot from "../components/Chatbot";
import ItineraryMenu from "../components/ItineraryMenu";
import axios from "axios";
import "../styles/DestinationPage.css";

function DestinationPage({ destination, onBack }) {
  const [locationData, setLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatbotCollapsed, setChatbotCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300); // Track sidebar width
  const [chatbotWidth, setChatbotWidth] = useState(320); // Track chatbot width
  const [itineraryPlaces, setItineraryPlaces] = useState([]);
  const [showItinerary, setShowItinerary] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  // Reference to sidebar and chatbot containers for updating width
  const sidebarContainerRef = useRef(null);
  const chatbotContainerRef = useRef(null);
  
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/destination/${destination}`)
      .then((res) => {
        setLocationData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching destination data:", err);
        setIsLoading(false);
      });
  }, [destination]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn("Geolocation error:", err);
        }
      );
    }
  }, []);

  // Handle sidebar resize
  const handleSidebarResize = (newWidth) => {
    setSidebarWidth(newWidth);
  };

  // Handle chatbot resize
  const handleChatbotResize = (newWidth) => {
    setChatbotWidth(newWidth);
  };

  // Handle sidebar toggle
  const toggleSidebar = () => {
    if (sidebarCollapsed) {
      // If expanding, restore the previous width
      const container = sidebarContainerRef.current;
      if (container) {
        // Set the container width immediately before removing the collapsed class
        container.style.width = `${sidebarWidth}px`;
        setSidebarCollapsed(false);
      }
    } else {
      // If collapsing, save the current width first
      const container = sidebarContainerRef.current;
      if (container) {
        // Get the actual computed width before collapsing
        const currentWidth = parseInt(getComputedStyle(container).width, 10);
        setSidebarWidth(currentWidth);
        setSidebarCollapsed(true);
      }
    }
  };

  // Handle chatbot toggle
  const toggleChatbot = () => {
    if (chatbotCollapsed) {
      // If expanding, restore the previous width
      const container = chatbotContainerRef.current;
      if (container) {
        // Set the container width immediately before removing the collapsed class
        container.style.width = `${chatbotWidth}px`;
        setChatbotCollapsed(false);
      }
    } else {
      // If collapsing, save the current width first
      const container = chatbotContainerRef.current;
      if (container) {
        // Get the actual computed width before collapsing
        const currentWidth = parseInt(getComputedStyle(container).width, 10);
        setChatbotWidth(currentWidth);
        setChatbotCollapsed(true);
      }
    }
  };

  const handleRemoveFromItinerary = (place) => {
    setItineraryPlaces((prev) => prev.filter((p) => p.name !== place.name));
  };

  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    setItinerary(null);
    try {
      const res = await axios.post("/api/itinerary", {
        places: itineraryPlaces.map((p) => p.name),
        userLocation: userLocation // <-- add this
      });
      setItinerary({ text: res.data.reply || "Itinerary generated!", pdf: null });
    } catch (e) {
      setItinerary({ text: "Failed to generate itinerary.", pdf: null });
    }
    setIsGenerating(false);
  };

  const handleDownloadItinerary = async () => {
    try {
      const res = await axios.post("/api/itinerary", {
        places: itineraryPlaces.map((p) => p.name),
        userLocation: userLocation // <-- add this
      }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "itinerary.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("Failed to download PDF.");
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {destination}...</p>
      </div>
    );
  }

  return locationData ? (
    <div className="destination-container">
      <div 
        ref={sidebarContainerRef}
        className={`sidebar-container ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={!sidebarCollapsed ? { width: `${sidebarWidth}px` } : undefined}
      >
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarCollapsed ? '→' : '←'}
        </div>
        <Sidebar 
          places={locationData.suggestions} 
          onResize={handleSidebarResize}
          onAddToItinerary={(place) => {
            setItineraryPlaces((prev) =>
              prev.find((p) => p.name === place.name) ? prev : [...prev, place]
            );
            setShowItinerary(true);
          }}
        />
        
        {/* Position back button to the right of sidebar */}
        {!sidebarCollapsed && (
          <button className="back-button" onClick={onBack}>
            <span>←</span> Back
          </button>
        )}
      </div>
      
      {/* Only show floating back button when sidebar is collapsed */}
      {sidebarCollapsed && (
        <button className="back-button floating" onClick={onBack}>
          <span>←</span> Back
        </button>
      )}
      
      <div className="map-container">
        <Map 
          center={locationData.coordinates} 
          places={locationData.suggestions}
          itineraryPlaces={itineraryPlaces}
          userLocation={userLocation}
        />
      </div>
      
      <div 
        ref={chatbotContainerRef}
        className={`chatbot-container ${chatbotCollapsed ? 'collapsed' : ''}`}
        style={!chatbotCollapsed ? { width: `${chatbotWidth}px` } : undefined}
      >
        <div className="chatbot-toggle" onClick={toggleChatbot}>
          {chatbotCollapsed ? '←' : '→'}
        </div>
        <Chatbot location={destination} onResize={handleChatbotResize} userLocation={userLocation} />
      </div>

      {showItinerary && (
        <ItineraryMenu
          places={itineraryPlaces}
          onRemove={handleRemoveFromItinerary}
          onGenerate={handleGenerateItinerary}
          onClose={() => setShowItinerary(false)}
          isGenerating={isGenerating}
          itinerary={itinerary}
          onDownload={handleDownloadItinerary}
        />
      )}
    </div>
  ) : (
    <div className="error-container">
      <h2>Could not load destination data</h2>
      <p>Sorry, we couldn't find information about {destination}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
      <button className="back-button" onClick={onBack}>Back to Home</button>
    </div>
  );
}

export default DestinationPage;