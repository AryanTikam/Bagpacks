import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PastAdventures from './PastAdventures';
import UserProfile from './UserProfile';
import '../styles/Navigation.css';

// Define the Navigation component
const Navigation = ({ onHomeClick, showBackButton, onBackClick, currentPage, onViewAdventure, onViewCommunity }) => {
  const { user, logout } = useAuth();
  const [showPastAdventures, setShowPastAdventures] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    logout();
  };

  const handleViewAdventure = (adventure) => {
    setShowPastAdventures(false);
    if (onViewAdventure) {
      onViewAdventure(adventure);
    }
  };

  return (
    <>
      <nav className="navigation">
        <div className="nav-left">
          <div className="logo" onClick={onHomeClick}>
            <span className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="logo-text">Bagpack</span>
          </div>
          
          {showBackButton && (
            <button onClick={onBackClick} className="nav-back-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Home
            </button>
          )}
        </div>

        <div className="nav-center">
          <button 
            onClick={() => onViewCommunity && onViewCommunity()}
            className={`nav-button ${currentPage === 'community' ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Community
          </button>
          
          <button 
            onClick={() => setShowPastAdventures(true)}
            className={`nav-button ${currentPage === 'adventures' ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18l-2 13H5L3 6zM3 6l-1-3h3M9 10v5M15 10v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Past Adventures
          </button>
        </div>

        <div className="nav-right">
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </button>
          
          <div className="user-info">
            <button 
              onClick={() => setShowUserProfile(true)}
              className="user-button"
            >
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user?.username || 'User'}</span>
            </button>
            
            <button onClick={handleLogout} className="logout-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {showPastAdventures && (
        <PastAdventures 
          onClose={() => setShowPastAdventures(false)} 
          onViewAdventure={handleViewAdventure}
        />
      )}

      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}
    </>
  );
};

export default Navigation;