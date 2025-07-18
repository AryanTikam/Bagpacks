// --- src/pages/HomePage.js ---
import React, { useState } from "react";
import "../styles/HomePage.css";

function HomePage({ onSearch }) {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    if (input.trim()) onSearch(input);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      onSearch(input);
    }
  };

  // Enhanced destinations with more variety
  const destinations = [
    { 
      name: "Manali", 
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      description: "Mountain paradise with snow-capped peaks"
    },
    { 
      name: "Goa", 
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop",
      description: "Golden beaches and vibrant nightlife"
    },
    { 
      name: "Varanasi", 
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop",
      description: "Ancient spiritual city on the Ganges"
    },
    { 
      name: "Kerala", 
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop",
      description: "God's own country with backwaters"
    },
    { 
      name: "Jaipur", 
      image: "https://images.unsplash.com/photo-1599661046827-dacde69022dd?w=400&h=300&fit=crop",
      description: "Pink city with royal heritage"
    },
    { 
      name: "Udaipur", 
      image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=400&h=300&fit=crop",
      description: "City of lakes and palaces"
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Explore India with 
            <span className="brand-name"> Bagpack </span>
            <span className="emoji">🧳</span>
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
                <span>🔍</span>
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
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Interactive Maps</h3>
            <p>Explore destinations with detailed maps and location insights</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Travel Assistant</h3>
            <p>Get personalized recommendations from our smart chatbot</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Local Insights</h3>
            <p>Discover hidden gems and local favorites at every destination</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;