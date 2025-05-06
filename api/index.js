// Serverless API entry point for Vercel deployment
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Body parser
app.use(express.json());

// Enable CORS with specific configuration
app.use(cors({
  origin: true, // Allow configured origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Import route files
const auth = require('../routes/auth');
const users = require('../routes/users');
const students = require('../routes/students');
const exportRoutes = require('../routes/export');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/students', students);
app.use('/api/export', exportRoutes);

// API Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HMPS API is working correctly in production!'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    message: 'HMPS API Server running on Vercel'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'HMPS API Server',
    version: '1.0.0',
    status: 'online',
    docs: '/api/docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

// Export the Express API
module.exports = app; 