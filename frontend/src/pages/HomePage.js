// --- src/pages/HomePage.js ---
import React, { useState } from "react";
import Navigation from "../components/Navigation";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../config/api";
import "../styles/HomePage.css";

function HomePage({ onSearch, onViewAdventure, onViewCommunity }) {
  const [input, setInput] = useState("");
  const [emailStatus, setEmailStatus] = useState(null);
  const { user } = useAuth();
  const userEmail = user?.email || "";

  const handleSearch = () => {
    if (input.trim()) onSearch(input);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      onSearch(input);
    }
  };

  const handlePackageClick = async (travelPackage) => {
    if (!userEmail) {
      setEmailStatus({
        type: "error",
        message: "We couldn't find an email on your account. Please update your profile and try again.",
      });
      return;
    }

    try {
      setEmailStatus({
        type: "sending",
        message: "Sending package details to your inbox...",
      });

      const response = await fetch(`${getApiUrl("node")}/api/send-package-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          packageId: travelPackage.id,
          packageName: travelPackage.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setEmailStatus({
        type: "success",
        message: `Package details for "${travelPackage.title}" have been emailed to ${userEmail}.`,
      });
    } catch (error) {
      console.error("Error sending package email:", error);
      setEmailStatus({
        type: "error",
        message: "Something went wrong while sending the email. Please try again.",
      });
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

  const packages = [
    {
      id: "goa-beach-getaway",
      title: "Goa Beach Getaway",
      location: "Goa, India",
      image: "/Goa.jpg",
      duration: "4N / 5D",
      price: "₹18,999",
      description: "Sun, sand and nightlife with optional water sports.",
    },
    {
      id: "manali-adventure-escape",
      title: "Manali Adventure Escape",
      location: "Manali, Himachal Pradesh",
      image: "/Manali.jpg",
      duration: "5N / 6D",
      price: "₹24,499",
      description: "Snow-capped peaks, Solang Valley and adventure activities.",
    },
    {
      id: "kerala-backwaters-retreat",
      title: "Kerala Backwaters Retreat",
      location: "Alleppey & Munnar, Kerala",
      image: "https://images.unsplash.com/photo-1501975558162-0be7b8ca95ea?w=400&h=300&fit=crop",
      duration: "5N / 6D",
      price: "₹27,999",
      description: "Houseboat stay, tea gardens and serene backwaters.",
    },
    {
      id: "rajasthan-royal-trail",
      title: "Rajasthan Royal Trail",
      location: "Jaipur, Jodhpur & Udaipur",
      image: "/Jaipur.jpg",
      duration: "6N / 7D",
      price: "₹32,999",
      description: "Palaces, forts and royal heritage across Rajasthan.",
    },
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
      
      {/* Explore Our Packages */}
      <div className="packages-section">
        <div className="section-header">
          <h2>Explore Our Packages</h2>
          <p>
            Choose a curated Indian getaway and we&apos;ll email you the package
            details instantly
            {userEmail && (
              <>
                {" "}
                at <span className="packages-email-highlight">{userEmail}</span>.
              </>
            )}
            {!userEmail && "."}
          </p>
        </div>

        {emailStatus && (
          <p className={`packages-email-status ${emailStatus.type}`}>
            {emailStatus.message}
          </p>
        )}

        <div className="carousel packages-carousel">
          <div className="carousel-items">
            {packages.map((travelPackage) => (
              <div key={travelPackage.id} className="carousel-item package-card">
                <div className="image-container">
                  <img
                    src={travelPackage.image}
                    alt={travelPackage.title}
                    loading="lazy"
                  />
                  <div className="image-overlay">
                    <button
                      className="explore-btn package-cta-btn"
                      onClick={() => handlePackageClick(travelPackage)}
                    >
                      Get this package on email
                    </button>
                  </div>
                </div>
                <div className="card-content package-card-content">
                  <h3>{travelPackage.title}</h3>
                  <span className="package-location">
                    {travelPackage.location}
                  </span>
                  <p className="package-description">
                    {travelPackage.description}
                  </p>
                  <div className="package-meta">
                    <span className="package-duration">
                      {travelPackage.duration}
                    </span>
                    <span className="package-price">
                      {travelPackage.price}
                    </span>
                  </div>
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