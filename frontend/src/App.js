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
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, loading } = useAuth();

  // Save state to localStorage
  useEffect(() => {
    if (!user || !isHydrated) {
      return;
    }

    const state = {
      currentPage,
      destination,
      viewingAdventure: viewingAdventure ? viewingAdventure._id : null
    };
    localStorage.setItem('appState', JSON.stringify(state));
  }, [currentPage, destination, viewingAdventure, user, isHydrated]);

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
        return true;
      }
      // Saved adventure is no longer available; reset to a safe home route.
      handleBack();
      return false;
    } catch (error) {
      console.error('Error fetching adventure:', error);
      // If we can't fetch the adventure, go back to home
      handleBack();
      return false;
    }
  }, []);

  // Restore state from localStorage on mount before enabling persistence.
  useEffect(() => {
    if (loading || !user) {
      return;
    }

    let cancelled = false;

    const hydrate = async () => {
      const savedState = localStorage.getItem('appState');
      if (!savedState) {
        if (!cancelled) setIsHydrated(true);
        return;
      }

      try {
        const state = JSON.parse(savedState);
        if (state.currentPage) {
          setCurrentPage(state.currentPage);
        }
        if (state.destination) {
          setDestination(state.destination);
        }
        if (state.viewingAdventure) {
          await fetchAdventure(state.viewingAdventure);
        }
      } catch (error) {
        console.error('Error restoring app state:', error);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [user, loading, fetchAdventure]);

  useEffect(() => {
    if (!user) {
      setIsHydrated(false);
    }
  }, [user]);

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

  if (!isHydrated || (currentPage === "adventure" && !viewingAdventure)) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Restoring your last page...</p>
      </div>
    );
  }

  // Show community page
  if (currentPage === "community") {
    return (
      <CommunityPage
        onBack={handleBack}
        onViewAdventure={handleViewAdventure}
        onViewCommunity={handleViewCommunity}
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