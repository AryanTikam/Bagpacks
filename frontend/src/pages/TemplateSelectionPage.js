import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import '../styles/TemplateSelectionPage.css';

function TemplateSelectionPage({ 
  onBack, 
  onGeneratePDF, 
  itinerary, 
  places, 
  itineraryOptions, 
  destination,
  onViewAdventure,
  onViewCommunity 
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    {
      id: 'modern',
      name: 'Modern Professional',
      description: 'Clean, modern design with geometric elements and contemporary typography',
      preview: '/templates/modern-preview.jpg',
      layout: 'stack',
      colors: {
        primary: '#2563eb',
        secondary: '#7c3aed',
        accent: '#059669'
      },
      features: ['Gradient headers', 'Modern typography', 'Clean layouts', 'Professional look']
    },
    {
      id: 'vintage',
      name: 'Vintage Explorer',
      description: 'Classic travel journal style with vintage maps and elegant borders',
      preview: '/templates/vintage-preview.jpg',
      layout: 'journal',
      colors: {
        primary: '#92400e',
        secondary: '#b45309',
        accent: '#065f46'
      },
      features: ['Vintage borders', 'Classic fonts', 'Map motifs', 'Travel journal feel']
    },
    {
      id: 'minimalist',
      name: 'Minimalist Zen',
      description: 'Ultra-clean design focusing on content with subtle accents',
      preview: '/templates/minimalist-preview.jpg',
      layout: 'minimal',
      colors: {
        primary: '#374151',
        secondary: '#6b7280',
        accent: '#0ea5e9'
      },
      features: ['Ultra-clean', 'Focus on content', 'Subtle colors', 'Easy to read']
    },
    {
      id: 'sunset',
      name: 'Sunset Pop',
      description: 'Warm, vibrant gradients inspired by golden-hour travel postcards',
      preview: '/templates/sunset-preview.jpg',
      layout: 'postcard',
      colors: {
        primary: '#e85d04',
        secondary: '#f48c06',
        accent: '#dc2f02'
      },
      features: ['Warm palette', 'Energetic look', 'Postcard vibe', 'Bold contrast']
    },
    {
      id: 'coastal',
      name: 'Coastal Breeze',
      description: 'Ocean-inspired style with airy spacing and refreshing color accents',
      preview: '/templates/coastal-preview.jpg',
      layout: 'wave',
      colors: {
        primary: '#0077b6',
        secondary: '#0096c7',
        accent: '#00b4d8'
      },
      features: ['Cool tones', 'Beach aesthetic', 'Light surfaces', 'Contemporary layout']
    },
    {
      id: 'noir',
      name: 'Noir Editorial',
      description: 'High-contrast editorial look with clean monochrome structure and dramatic accents',
      preview: '/templates/noir-preview.jpg',
      layout: 'editorial',
      colors: {
        primary: '#111827',
        secondary: '#374151',
        accent: '#9ca3af'
      },
      features: ['Editorial grid', 'Serif heading style', 'Monochrome contrast', 'Magazine feel']
    },
    {
      id: 'festival',
      name: 'Festival Mosaic',
      description: 'Celebratory, colorful layout inspired by travel posters and local festivals',
      preview: '/templates/festival-preview.jpg',
      layout: 'mosaic',
      colors: {
        primary: '#7e22ce',
        secondary: '#db2777',
        accent: '#ea580c'
      },
      features: ['Color blocks', 'Playful composition', 'Poster vibe', 'Energetic rhythm']
    }
  ];

  const renderPreviewBody = (template) => {
    if (template.layout === 'minimal') {
      return (
        <div className="mockup-content minimal-layout">
          <div className="mockup-text-line long"></div>
          <div className="mockup-text-line medium"></div>
          <div className="mockup-divider"></div>
          <div className="mockup-text-line long"></div>
          <div className="mockup-text-line short"></div>
        </div>
      );
    }

    if (template.layout === 'journal') {
      return (
        <div className="mockup-content journal-layout">
          <div className="mockup-stamp"></div>
          <div className="mockup-section" style={{ borderColor: template.colors.secondary }}>
            <div className="mockup-text-line long"></div>
            <div className="mockup-text-line medium"></div>
          </div>
          <div className="mockup-note"></div>
        </div>
      );
    }

    if (template.layout === 'postcard') {
      return (
        <div className="mockup-content postcard-layout">
          <div className="mockup-sun"></div>
          <div className="mockup-hills"></div>
          <div className="mockup-text-line medium"></div>
          <div className="mockup-text-line short"></div>
        </div>
      );
    }

    if (template.layout === 'wave') {
      return (
        <div className="mockup-content wave-layout">
          <div className="mockup-wave"></div>
          <div className="mockup-section" style={{ borderColor: template.colors.secondary }}>
            <div className="mockup-bullet" style={{ backgroundColor: template.colors.accent }}></div>
            <div className="mockup-text-line medium"></div>
            <div className="mockup-bullet" style={{ backgroundColor: template.colors.accent }}></div>
            <div className="mockup-text-line short"></div>
          </div>
        </div>
      );
    }

    if (template.layout === 'editorial') {
      return (
        <div className="mockup-content editorial-layout">
          <div className="mockup-column-group">
            <div className="mockup-text-line long"></div>
            <div className="mockup-text-line medium"></div>
            <div className="mockup-text-line short"></div>
          </div>
          <div className="mockup-column-group">
            <div className="mockup-text-line medium"></div>
            <div className="mockup-text-line long"></div>
            <div className="mockup-text-line short"></div>
          </div>
        </div>
      );
    }

    if (template.layout === 'mosaic') {
      return (
        <div className="mockup-content mosaic-layout">
          <div className="mosaic-row">
            <div className="mosaic-tile primary"></div>
            <div className="mosaic-tile secondary"></div>
          </div>
          <div className="mosaic-row">
            <div className="mosaic-tile accent"></div>
            <div className="mosaic-tile neutral"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="mockup-content">
        <div className="mockup-section" style={{ borderColor: template.colors.secondary }}>
          <div className="mockup-text-line long"></div>
          <div className="mockup-text-line medium"></div>
          <div className="mockup-text-line short"></div>
        </div>
        <div className="mockup-section">
          <div className="mockup-bullet" style={{ backgroundColor: template.colors.accent }}></div>
          <div className="mockup-text-line medium"></div>
          <div className="mockup-bullet" style={{ backgroundColor: template.colors.accent }}></div>
          <div className="mockup-text-line short"></div>
        </div>
      </div>
    );
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await onGeneratePDF(selectedTemplate);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="template-selection-container">
      <Navigation 
        onHomeClick={onBack}
        showBackButton={true}
        onBackClick={onBack}
        currentPage="template"
        onViewAdventure={onViewAdventure}
        onViewCommunity={onViewCommunity} // Add this line
      />
      
      <div className="template-selection-content">
        <div className="template-header">
          <h1>Choose Your PDF Template</h1>
          <p>Select a beautiful template for your {destination} itinerary</p>
          
          <div className="itinerary-summary">
            <div className="summary-item">
              <span className="summary-label">Destination:</span>
              <span className="summary-value">{destination}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">{itineraryOptions.days} days</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Travelers:</span>
              <span className="summary-value">{itineraryOptions.people} people</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Budget:</span>
              <span className="summary-value">₹{itineraryOptions.budget}</span>
            </div>
          </div>
        </div>

        <div className="templates-grid">
          {templates.map((template) => (
            <div 
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="template-preview">
                <div className={`preview-mockup ${template.id}`}>
                  <div className="mockup-header">
                    <div className="mockup-title">Travel Itinerary</div>
                    <div className="mockup-subtitle">{destination} Adventure</div>
                  </div>
                  {renderPreviewBody(template)}
                </div>
              </div>
              
              <div className="template-info">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                
                <div className="template-colors">
                  {Object.values(template.colors).map((color, index) => (
                    <div 
                      key={index}
                      className="color-dot" 
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
                
                <div className="template-features">
                  {template.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedTemplate === template.id && (
                <div className="selected-indicator">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="template-actions">
          <button onClick={onBack} className="back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Itinerary
          </button>
          
          <button 
            onClick={handleGeneratePDF} 
            className="generate-btn"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner-small">
                  <div className="spinner-small"></div>
                </div>
                Generating PDF...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Generate PDF with {templates.find(t => t.id === selectedTemplate)?.name}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelectionPage;