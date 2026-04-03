const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

console.log('🚀 Starting Bagpack server...');

// Load .env from the parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://bagpacks-explore.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Enhanced CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow tools like curl/postman and server-to-server calls with no Origin header.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(
      (allowedOrigin) => allowedOrigin.replace(/\/$/, '') === normalizedOrigin
    );

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.post('/api/send-package-email', async (req, res) => {
  const { email, packageId, packageName } = req.body || {};

  if (!email || !packageId || !packageName) {
    return res.status(400).json({
      message: 'email, packageId and packageName are required'
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailFrom = process.env.EMAIL_FROM || smtpUser;
  const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';

  if (!smtpHost || !smtpUser || !smtpPass || !emailFrom) {
    return res.status(500).json({
      message: 'Email service is not configured on the server'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const packageLink = `${process.env.FRONTEND_URL || 'https://bagpacks-explore.netlify.app'}`;

    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: `Your Bagpack package: ${packageName}`,
      text: [
        `Hi there,`,
        '',
        `Thanks for exploring Bagpack. Here are your selected package details:`,
        `Package: ${packageName}`,
        `Package ID: ${packageId}`,
        '',
        `Open Bagpack to continue planning: ${packageLink}`,
        '',
        `Happy travels,`,
        `Team Bagpack`
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="margin: 0 0 12px;">Your Bagpack package is ready</h2>
          <p>Thanks for exploring Bagpack. Here are your selected package details:</p>
          <ul>
            <li><strong>Package:</strong> ${packageName}</li>
            <li><strong>Package ID:</strong> ${packageId}</li>
          </ul>
          <p>
            Continue planning your trip here:
            <a href="${packageLink}" target="_blank" rel="noopener noreferrer">Open Bagpack</a>
          </p>
          <p>Happy travels,<br/>Team Bagpack</p>
        </div>
      `
    });

    return res.status(200).json({ message: 'Package details emailed successfully' });
  } catch (error) {
    console.error('Error sending package email:', error);
    return res.status(500).json({ message: 'Failed to send package email' });
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const adventureRoutes = require('./routes/adventures');
const communityRoutes = require('./routes/community');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/adventures', adventureRoutes);
app.use('/api/community', communityRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bagpack API Server is running!',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/adventures', 
      '/api/community',
      '/api/send-package-email'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

const PORT = process.env.NODE_PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Available routes:`);
  console.log(`   - http://localhost:${PORT}/api/auth`);
  console.log(`   - http://localhost:${PORT}/api/adventures`);
  console.log(`   - http://localhost:${PORT}/api/community`);
  console.log(`   - http://localhost:${PORT}/api/send-package-email`);
});