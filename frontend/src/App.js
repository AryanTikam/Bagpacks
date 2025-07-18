// --- Frontend Entry Point: src/App.js ---
import React, { useState } from "react";
import DestinationPage from "./pages/DestinationPage";
import HomePage from "./pages/HomePage";
import "./styles/globals.css";

function App() {
  const [destination, setDestination] = useState("");

  const handleBack = () => {
    setDestination("");
  };

  return (
    <div>
      {destination ? (
        <DestinationPage destination={destination} onBack={handleBack} />
      ) : (
        <HomePage onSearch={setDestination} />
      )}
    </div>
  );
}

export default App;