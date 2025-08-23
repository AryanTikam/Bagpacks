// --- src/pages/HomePage.js ---
import React, { useState } from "react";
import Navigation from "../components/Navigation";
import "../styles/HomePage.css";

function HomePage({ onSearch, onViewAdventure, onViewCommunity }) {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    if (input.trim()) onSearch(input);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      onSearch(input);
    }
  };

  const destinations = [
    { 
      name: "Manali", 
      image: "/Manali.jpg",
      description: "Mountain paradise with snow-capped peaks"
    },
    { 
      name: "Goa", 
      image: "/Goa.jpg",
      description: "Golden beaches and vibrant nightlife"
    },
    { 
      name: "Varanasi", 
      image: "/Varanasi.webp",
      description: "Ancient spiritual city on the Ganges"
    },
    { 
      name: "Kerala", 
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop",
      description: "God's own country with backwaters"
    },
    { 
      name: "Jaipur", 
      image: "/Jaipur.jpg",
      description: "Pink city with royal heritage"
    },
    { 
      name: "Udaipur", 
      image: "/Udaipur.jpg",
      description: "City of lakes and palaces"
    }
  ];

  return (
    <div className="homepage">
      <Navigation 
        onHomeClick={() => {}}
        showBackButton={false}
        currentPage="home"
        onViewAdventure={onViewAdventure}
        onViewCommunity={onViewCommunity}
      />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Explore India with <span className="brand-name">Bagpack</span>
          </h1>
          <p className="hero-subtitle">
            Discover hidden gems, plan your perfect journey, and create unforgettable memories
          </p>
          
          {/* Enhanced Search Container */}
          <div className="search-container">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Where do you want to go? (e.g. Manali, Goa, Kerala)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Destinations Section */}
      <div className="destinations-section">
        <div className="section-header">
          <h2>Popular Destinations</h2>
          <p>Handpicked places that will steal your heart</p>
        </div>
        
        <div className="carousel">
          <div className="carousel-items">
            {destinations.map((dest, i) => (
              <div 
                key={i} 
                className="carousel-item"
                onClick={() => onSearch(dest.name)}
              >
                <div className="image-container">
                  <img src={dest.image} alt={dest.name} loading="lazy" />
                  <div className="image-overlay">
                    <button className="explore-btn">Explore Now</button>
                  </div>
                </div>
                <div className="card-content">
                  <h3>{dest.name}</h3>
                  <p>{dest.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <h2>Why Choose Bagpack?</h2>
          <p>Everything you need for the perfect trip</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Interactive Maps</h3>
            <p>Explore destinations with detailed maps and location insights</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>AI Travel Assistant</h3>
            <p>Get personalized recommendations from our smart chatbot</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Travel Community</h3>
            <p>Share your adventures and get inspired by fellow travelers</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;