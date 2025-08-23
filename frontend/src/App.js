// --- Frontend Entry Point: src/App.js ---
import React, { useState } from "react";
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
  const [currentPage, setCurrentPage] = useState("home"); // home, community, destination, adventure
  const { user, loading } = useAuth();

  const handleBack = () => {
    setDestination("");
    setViewingAdventure(null);
    setCurrentPage("home");
  };

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