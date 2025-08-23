// --- src/pages/DestinationPage.js ---
import React, { useEffect, useState, useRef } from "react";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import Chatbot from "../components/Chatbot";
import ItineraryMenu from "../components/ItineraryMenu";
import Navigation from "../components/Navigation";
import axios from "axios";
import "../styles/DestinationPage.css";
import ItineraryViewPage from "./ItineraryViewPage";

function DestinationPage({ destination, onBack, onViewAdventure }) {
  const [locationData, setLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatbotCollapsed, setChatbotCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [chatbotWidth, setChatbotWidth] = useState(320);
  const [itineraryPlaces, setItineraryPlaces] = useState([]);
  const [showItinerary, setShowItinerary] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [itineraryOptions, setItineraryOptions] = useState({
    days: 3,
    budget: 10000,
    people: 2,
  });
  const [showItineraryView, setShowItineraryView] = useState(false);
  
  const sidebarContainerRef = useRef(null);
  const chatbotContainerRef = useRef(null);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Add authorization header for API requests
    const token = localStorage.getItem('token');
    const config = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
    
    // Add timeout and better error handling
    axios
      .get(`http://localhost:5000/api/destination/${destination}`, {
        ...config,
        timeout: 10000 // 10 second timeout
      })
      .then((res) => {
        setLocationData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching destination data:", err);
        
        // Check if it's a network error (Flask server not running)
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          console.error("Flask backend server is not running on port 5000");
          // You could show a specific error message to the user here
        }
        
        setIsLoading(false);
      });
  }, [destination]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          console.log("Geolocation obtained:", [pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn("Geolocation error:", err);
          // Don't show error for geolocation denial, just continue without it
          // Set a default location (Delhi) if geolocation is denied
          setUserLocation([28.6139, 77.2090]);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      // Geolocation not supported, use default location
      setUserLocation([28.6139, 77.2090]);
    }
  }, []);

  const handleSidebarResize = (newWidth) => {
    setSidebarWidth(newWidth);
  };

  const handleChatbotResize = (newWidth) => {
    setChatbotWidth(newWidth);
  };

  const toggleSidebar = () => {
    if (sidebarCollapsed) {
      const container = sidebarContainerRef.current;
      if (container) {
        container.style.width = `${sidebarWidth}px`;
        setSidebarCollapsed(false);
      }
    } else {
      const container = sidebarContainerRef.current;
      if (container) {
        const currentWidth = parseInt(getComputedStyle(container).width, 10);
        setSidebarWidth(currentWidth);
        setSidebarCollapsed(true);
      }
    }
  };

  const toggleChatbot = () => {
    if (chatbotCollapsed) {
      const container = chatbotContainerRef.current;
      if (container) {
        container.style.width = `${chatbotWidth}px`;
        setChatbotCollapsed(false);
      }
    } else {
      const container = chatbotContainerRef.current;
      if (container) {
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
      const token = localStorage.getItem('token');
      const config = {
        timeout: 30000, // 30 seconds for itinerary generation
        ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {})
      };
      
      const res = await axios.post("http://localhost:5000/api/itinerary?preview=1", {
        places: itineraryPlaces.map((p) => p.name),
        userLocation: userLocation,
        ...itineraryOptions
      }, config);
      setItinerary({ text: res.data.reply || "Itinerary generated!", pdf: null });
    } catch (e) {
      console.error("Error generating itinerary:", e);
      setItinerary({ text: "Failed to generate itinerary. Please make sure the Flask backend is running.", pdf: null });
    }
    setIsGenerating(false);
  };

  const handleDownloadItinerary = async (format = 'pdf', templateId = 'modern') => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        responseType: "blob",
        timeout: 30000,
        ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {})
      };
      
      const res = await axios.post("http://localhost:5000/api/itinerary", {
        places: itineraryPlaces.map((p) => p.name),
        userLocation: userLocation,
        format: format,
        template: templateId,  // Add template parameter
        ...itineraryOptions
      }, config);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `itinerary_${templateId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Error downloading itinerary:", e);
      alert(`Failed to download ${format.toUpperCase()}. Please make sure the Flask backend is running.`);
    }
  };

  const handleViewItinerary = () => {
    setShowItinerary(false);
    setShowItineraryView(true);
  };

  // If showing itinerary view, render that page
  if (showItineraryView && itinerary) {
    return (
      <ItineraryViewPage
        itinerary={itinerary}
        places={itineraryPlaces}
        itineraryOptions={itineraryOptions}
        onBack={() => setShowItineraryView(false)}
        onDownload={handleDownloadItinerary}
        destination={destination}
      />
    );
  }

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
      <Navigation 
        onHomeClick={onBack}
        showBackButton={true}
        onBackClick={onBack}
        currentPage="destination"
        onViewAdventure={onViewAdventure}
      />
      
      <div className="destination-content">
        <div 
          ref={sidebarContainerRef}
          className={`sidebar-container ${sidebarCollapsed ? 'collapsed' : ''}`}
          style={!sidebarCollapsed ? { width: `${sidebarWidth}px` } : undefined}
        >
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
        </div>
        
        <div className="map-container">
          {/* Sidebar toggle button */}
          <div 
            className={`sidebar-toggle ${sidebarCollapsed ? 'collapsed' : ''}`} 
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? '→' : '←'}
          </div>
          
          <Map 
            center={locationData.coordinates} 
            places={locationData.suggestions}
            itineraryPlaces={itineraryPlaces}
            userLocation={userLocation}
          />

          {/* Chatbot toggle button - Add collapsed class */}
          <div 
            className={`chatbot-toggle ${chatbotCollapsed ? 'collapsed' : ''}`} 
            onClick={toggleChatbot}
          >
            {chatbotCollapsed ? '←' : '→'}
          </div>
        </div>
        
        <div 
          ref={chatbotContainerRef}
          className={`chatbot-container ${chatbotCollapsed ? 'collapsed' : ''}`}
          style={!chatbotCollapsed ? { width: `${chatbotWidth}px` } : undefined}
        >
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
            onViewItinerary={handleViewItinerary}
            itineraryOptions={itineraryOptions}
            setItineraryOptions={setItineraryOptions}
          />
        )}
      </div>
    </div>
  ) : (
    <div className="error-container">
      <Navigation 
        onHomeClick={onBack}
        showBackButton={true}
        onBackClick={onBack}
        currentPage="destination"
        onViewAdventure={onViewAdventure}
      />
      <h2>Backend Connection Error</h2>
      <p>Could not connect to the Flask backend server.</p>
      <p>Please make sure the Python Flask server is running on port 5000.</p>
      <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', margin: '1rem 0', textAlign: 'left' }}>
        <strong>To start the backend:</strong>
        <br />
        <code>cd /home/aryan/Desktop/bagpack/backend</code>
        <br />
        <code>python app.py</code>
      </div>
      <button onClick={() => window.location.reload()}>Try Again</button>
      <button className="back-button" onClick={onBack}>Back to Home</button>
    </div>
  );
}

export default DestinationPage;