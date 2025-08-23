// --- Frontend Entry Point: src/App.js ---
import React, { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DestinationPage from "./pages/DestinationPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ItineraryViewPage from "./pages/ItineraryViewPage";
import CommunityPage from "./pages/CommunityPage";
import { getApiUrl } from './config/api';
import "./styles/globals.css";

function AppContent() {
  const [destination, setDestination] = useState("");
  const [viewingAdventure, setViewingAdventure] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const { user, loading } = useAuth();

  // Save state to localStorage
  useEffect(() => {
    const state = {
      currentPage,
      destination,
      viewingAdventure: viewingAdventure ? viewingAdventure._id : null
    };
    localStorage.setItem('appState', JSON.stringify(state));
  }, [currentPage, destination, viewingAdventure]);

  const handleBack = () => {
    setDestination("");
    setViewingAdventure(null);
    setCurrentPage("home");
    localStorage.removeItem('appState');
  };

  // Use useCallback to memoize fetchAdventure function
  const fetchAdventure = useCallback(async (adventureId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/adventures/${adventureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const adventure = await response.json();
        setViewingAdventure(adventure);
      }
    } catch (error) {
      console.error('Error fetching adventure:', error);
      // If we can't fetch the adventure, go back to home
      handleBack();
    }
  }, []);

  // Restore state from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.currentPage && state.currentPage !== 'home') {
            setCurrentPage(state.currentPage);
            if (state.destination) {
              setDestination(state.destination);
            }
            if (state.viewingAdventure) {
              // Fetch the adventure from the server
              fetchAdventure(state.viewingAdventure);
            }
          }
        } catch (error) {
          console.error('Error restoring app state:', error);
        }
      }
    }
  }, [user, fetchAdventure]); // Add fetchAdventure to dependencies

  const handleViewAdventure = (adventure) => {
    setDestination("");
    setViewingAdventure(adventure);
    setCurrentPage("adventure");
  };

  const handleViewCommunity = () => {
    setDestination("");
    setViewingAdventure(null);
    setCurrentPage("community");
  };

  const handleSearchDestination = (dest) => {
    setDestination(dest);
    setViewingAdventure(null);
    setCurrentPage("destination");
  };

  const handleDownloadAdventure = async (format = 'pdf', templateId = 'modern') => {
    if (!viewingAdventure || !viewingAdventure.itinerary) {
      alert('No itinerary available for download.');
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
          itineraryText: viewingAdventure.itinerary.text,
          places: viewingAdventure.places,
          format: format,
          template: templateId,
          destination: viewingAdventure.destination,
          ...viewingAdventure.options
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${viewingAdventure.destination}_itinerary_${templateId}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert(`Failed to download ${format.toUpperCase()}.`);
      }
    } catch (e) {
      console.error("Error downloading itinerary:", e);
      alert(`Failed to download ${format.toUpperCase()}.`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Show community page
  if (currentPage === "community") {
    return (
      <CommunityPage
        onBack={handleBack}
        onViewAdventure={handleViewAdventure}
      />
    );
  }

  // Show adventure itinerary view
  if (currentPage === "adventure" && viewingAdventure) {
    return (
      <ItineraryViewPage
        itinerary={viewingAdventure.itinerary}
        places={viewingAdventure.places}
        itineraryOptions={viewingAdventure.options}
        onBack={handleBack}
        onDownload={handleDownloadAdventure}
        destination={viewingAdventure.destination}
        onViewAdventure={handleViewAdventure}
        onViewCommunity={handleViewCommunity} 
      />
    );
  }

  // Show destination page
  if (currentPage === "destination" && destination) {
    return (
      <DestinationPage 
        destination={destination} 
        onBack={handleBack}
        onViewAdventure={handleViewAdventure}
        onViewCommunity={handleViewCommunity}
      />
    );
  }

  // Show home page
  return (
    <HomePage 
      onSearch={handleSearchDestination}
      onViewAdventure={handleViewAdventure}
      onViewCommunity={handleViewCommunity}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;