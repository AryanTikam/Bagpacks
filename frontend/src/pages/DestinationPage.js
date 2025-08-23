// --- src/pages/DestinationPage.js ---
import React, { useEffect, useState, useRef } from "react";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import Chatbot from "../components/Chatbot";
import ItineraryMenu from "../components/ItineraryMenu";
import Navigation from "../components/Navigation";
import axios from "axios";
import { getApiUrl } from '../config/api';
import "../styles/DestinationPage.css";
import ItineraryViewPage from "./ItineraryViewPage";

function DestinationPage({ destination, onBack, onViewAdventure, onViewCommunity }) {
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
      .get(`${getApiUrl()}/api/destination/${destination}`, {
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
          console.error("Flask server appears to be down");
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
      
      // Generate the full itinerary (not just preview) and save it to backend
      const response = await fetch(`${getApiUrl()}/api/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          places: itineraryPlaces.map((p) => p.name),
          userLocation: userLocation ? `${userLocation[0]}, ${userLocation[1]}` : null,
          ...itineraryOptions,
          returnText: true // New parameter to get both text and save to backend
        })
      });

      if (response.ok) {
        const data = await response.json();
        setItinerary({ text: data.reply });
      } else {
        console.error('Failed to generate itinerary');
        alert('Failed to generate itinerary. Please try again.');
      }
    } catch (e) {
      console.error('Error generating itinerary:', e);
      alert('Error generating itinerary. Please check your connection.');
    }
    setIsGenerating(false);
  };

  const handleDownloadItinerary = async (format = 'pdf', templateId = 'modern') => {
    if (!itinerary) {
      alert('Please generate an itinerary first.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Use the existing itinerary text for download
      const response = await fetch(`${getApiUrl()}/api/itinerary/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          itineraryText: itinerary.text,
          places: itineraryPlaces.map((p) => ({ name: p.name, coords: p.coords })),
          format: format,
          template: templateId,
          destination: itineraryPlaces[0]?.name || 'destination',
          ...itineraryOptions
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const destination = itineraryPlaces[0]?.name || 'destination';
        link.setAttribute("download", `${destination}_itinerary_${templateId}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert(`Failed to download ${format.toUpperCase()}.`);
      }
    } catch (e) {
      console.error(`Error downloading ${format}:`, e);
      alert(`Failed to download ${format.toUpperCase()}.`);
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
        onViewCommunity={onViewCommunity}
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