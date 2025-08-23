import React, { useState, useEffect } from 'react';
import '../styles/PastAdventures.css';
import { getApiUrl } from '../config/api';

const PastAdventures = ({ onClose, onViewAdventure }) => {
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdventures();
  }, []);

  const fetchAdventures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/adventures`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdventures(data);
      } else {
        setError('Failed to fetch adventures');
      }
    } catch (err) {
      console.error('Error fetching adventures:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const deleteAdventure = async (id) => {
    if (!window.confirm('Are you sure you want to delete this adventure?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('node')}/api/adventures/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAdventures(prev => prev.filter(adventure => adventure._id !== id));
      } else {
        alert('Failed to delete adventure');
      }
    } catch (err) {
      console.error('Error deleting adventure:', err);
      alert('Network error');
    }
  };

  const handleViewAdventure = (adventure) => {
    onViewAdventure(adventure);
    onClose(); // Close the modal
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="past-adventures-modal">
        <div className="past-adventures-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your adventures...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="past-adventures-modal">
      <div className="past-adventures-content">
        <div className="past-adventures-header">
          <h2>Past Adventures</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="adventures-list">
          {adventures.length === 0 ? (
            <div className="no-adventures">
              <div className="no-adventures-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>No Adventures Yet</h3>
              <p>Start exploring and create your first itinerary to see it here!</p>
            </div>
          ) : (
            adventures.map((adventure) => (
              <div key={adventure._id} className="adventure-card">
                <div className="adventure-header">
                  <h3>{adventure.destination}</h3>
                  <div className="adventure-actions">
                    <button 
                      onClick={() => handleViewAdventure(adventure)}
                      className="view-adventure-button"
                      title="View adventure"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => deleteAdventure(adventure._id)}
                      className="delete-button"
                      title="Delete adventure"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                        <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="adventure-details">
                  <div className="adventure-meta">
                    <span className="adventure-date">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {formatDate(adventure.createdAt)}
                    </span>
                    {adventure.options && (
                      <div className="adventure-options">
                        {adventure.options.days && (
                          <span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {adventure.options.days} days
                          </span>
                        )}
                        {adventure.options.people && (
                          <span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {adventure.options.people} people
                          </span>
                        )}
                        {adventure.options.budget && (
                          <span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            ₹{adventure.options.budget}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {adventure.places && adventure.places.length > 0 && (
                    <div className="adventure-places">
                      <h4>Places visited:</h4>
                      <div className="places-list">
                        {adventure.places.map((place, index) => (
                          <span key={index} className="place-tag">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {place.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {adventure.itinerary && adventure.itinerary.text && (
                    <div className="adventure-itinerary">
                      <h4>Itinerary Summary:</h4>
                      <div className="itinerary-preview">
                        {adventure.itinerary.text.substring(0, 200)}
                        {adventure.itinerary.text.length > 200 && '...'}
                      </div>
                      <button 
                        onClick={() => handleViewAdventure(adventure)}
                        className="view-full-button"
                      >
                        View Full Itinerary
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PastAdventures;