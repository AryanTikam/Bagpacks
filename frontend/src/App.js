// --- Frontend Entry Point: src/App.js ---
import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DestinationPage from "./pages/DestinationPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ItineraryViewPage from "./pages/ItineraryViewPage";
import "./styles/globals.css";

function AppContent() {
  const [destination, setDestination] = useState("");
  const [viewingAdventure, setViewingAdventure] = useState(null);
  const { user, loading } = useAuth();

  const handleBack = () => {
    setDestination("");
    setViewingAdventure(null);
  };

  const handleViewAdventure = (adventure) => {
    setDestination("");
    setViewingAdventure(adventure);
  };

  const handleDownloadAdventure = async (format = 'pdf') => {
    if (!viewingAdventure) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        responseType: "blob",
        timeout: 30000,
        ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {})
      };
      
      const response = await fetch("http://localhost:5000/api/itinerary", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          places: viewingAdventure.places.map((p) => p.name),
          format: format,
          ...viewingAdventure.options
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${viewingAdventure.destination}_itinerary.${format}`);
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

  // Show adventure itinerary view
  if (viewingAdventure) {
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

  return (
    <div>
      {destination ? (
        <DestinationPage 
          destination={destination} 
          onBack={handleBack}
          onViewAdventure={handleViewAdventure}
        />
      ) : (
        <HomePage 
          onSearch={setDestination}
          onViewAdventure={handleViewAdventure}
        />
      )}
    </div>
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