// filepath: /home/aryan/Desktop/bagpack/backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Load .env from the parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import routes
const authRoutes = require('./routes/auth');
const adventureRoutes = require('./routes/adventures');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/adventures', adventureRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Bagpack API is running!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Found' : 'Not found'}`);
  console.log(`JWT Secret: ${process.env.JWT_SECRET ? 'Found' : 'Not found'}`);
});