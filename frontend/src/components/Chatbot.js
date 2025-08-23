// --- src/components/Chatbot.js ---
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { getApiUrl } from "../config/api";
import "../styles/Chatbot.css";

function Chatbot({ location, onResize, userLocation }) {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: `# Welcome to ${location}\n\nI'm your BagpackBot travel assistant. I can help you with:\n\n- Places to visit and attractions\n- Local transportation options\n- Restaurant and food recommendations\n- Weather information and best travel times\n- Cultural insights and local tips\n\nFeel free to ask me anything about your destination!`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatLogRef = useRef(null);
  const chatbotRef = useRef(null);
  const resizeHandleRef = useRef(null);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    const resizeHandle = resizeHandleRef.current;
    const chatbot = chatbotRef.current;
    const parentContainer = chatbot?.parentElement;
    let startX, startWidth;
    
    function startResize(e) {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startWidth = parseInt(getComputedStyle(parentContainer).width, 10);
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    
    function resize(e) {
      if (!startX || isFullscreen) return;
      const delta = e.clientX - startX;
      const newWidth = startWidth - delta;
      if (newWidth > 250 && newWidth < 600) {
        parentContainer.style.width = `${newWidth}px`;
        if (onResize) onResize(newWidth);
      }
    }
    
    function stopResize() {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      startX = null;
    }
    
    if (resizeHandle && !isFullscreen) {
      resizeHandle.addEventListener('mousedown', startResize);
    }
    
    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener('mousedown', startResize);
      }
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [onResize, isFullscreen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${getApiUrl()}/api/chat`, { 
        message: input, 
        location,
        userLocation 
      });
      setIsLoading(false);
      setMessages(msgs => [...msgs, { sender: "bot", text: response.data.reply }]);
    } catch (error) {
      setIsLoading(false);
      setMessages(msgs => [...msgs, { 
        sender: "bot", 
        text: "Sorry, I'm having trouble connecting right now. Please try again later." 
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      {!isFullscreen && <div ref={resizeHandleRef} className="resize-handle"></div>}
      <div 
        ref={chatbotRef} 
        className={`chatbot ${isFullscreen ? 'fullscreen' : ''}`}
      >
        <div className="chatbot-header">
          <h2>Travel Assistant</h2>
          <div className="chatbot-controls">
            <button 
              className="control-btn" 
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? "⤓" : "⤢"}
            </button>
          </div>
        </div>
        
        <div className="chat-container">
          <div className="chat-log" ref={chatLogRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <div className="markdown-content">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          
          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about places, food, transportation..."
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading}>
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatbot;