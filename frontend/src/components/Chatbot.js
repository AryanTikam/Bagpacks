// --- src/components/Chatbot.js ---
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import "../styles/Chatbot.css";

function Chatbot({ location, onResize, userLocation }) {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: `# Welcome to ${location}! 👋\n\nI'm your BagpackBot guide. Ask me anything about:\n- Places to visit\n- Local transportation\n- Food recommendations\n- Weather & best time to visit`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      if (!startX) return;
      const delta = e.clientX - startX;
      const newWidth = startWidth - delta; // For right sidebar, decrease width as mouse moves right
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
    
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', startResize);
    }
    
    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener('mousedown', startResize);
      }
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [onResize]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/chat", { 
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

  return (
    <>
      <div ref={resizeHandleRef} className="resize-handle"></div>
      <div ref={chatbotRef} className="chatbot">
        <h2>Ask BagpackBot 🗺️</h2>
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
            placeholder="Ask about places, food, routes..."
            onKeyPress={handleKeyPress}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  );
}

export default Chatbot;