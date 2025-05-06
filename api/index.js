// Serverless API entry point for Vercel deployment
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

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

// Basic diagnostics endpoint - no database required
app.get('/api/diagnostics', (req, res) => {
  try {
    const diagnostics = {
      success: true,
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      env: {
        mongodb_uri_exists: !!process.env.MONGODB_URI,
        jwt_secret_exists: !!process.env.JWT_SECRET,
        jwt_expire_exists: !!process.env.JWT_EXPIRE
      }
    };
    
    res.status(200).json(diagnostics);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Diagnostics Error',
      message: error.message
    });
  }
});

// Root endpoint - without database dependency
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'HMPS API Server',
    version: '1.0.0',
    status: 'online',
    docs: '/api/docs',
    diagnostics: '/api/diagnostics'
  });
});

// Use async IIFE for database connection and routes
(async function() {
  try {
    // Dynamically import database connection
    const connectDB = require('../config/db');
    
    // Connect to MongoDB with additional logging
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('MongoDB connection successful');
    
    // Only import routes after successful database connection
    try {
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
      
      console.log('Routes mounted successfully');
    } catch (routeError) {
      console.error('Error loading routes:', routeError.message);
      // Create fallback routes instead of crashing
      app.use('/api/auth', (req, res) => res.status(500).json({
        success: false,
        error: 'Route Error',
        details: 'Auth routes failed to load',
        message: routeError.message
      }));
      // Similar fallbacks for other routes
    }
    
    // API Test endpoint - after DB connection
    app.get('/api/test', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'HMPS API is working correctly in production!',
        dbConnected: true
      });
    });
    
    // API status endpoint - after DB connection
    app.get('/api/status', (req, res) => {
      res.status(200).json({
        success: true,
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
        message: 'HMPS API Server running on Vercel',
        dbConnected: true
      });
    });
  } catch (dbError) {
    console.error('MongoDB connection error:', dbError.message);
    
    // Add routes that don't require database connection
    app.get('/api/test', (req, res) => {
      res.status(500).json({
        success: false,
        message: 'HMPS API is experiencing database connection issues',
        error: dbError.message
      });
    });
    
    app.get('/api/status', (req, res) => {
      res.status(500).json({
        success: false,
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
        message: 'HMPS API Server running with database connection issues',
        error: dbError.message
      });
    });
    
    // Create a stub for all API routes to prevent crashes
    app.use('/api/:route', (req, res) => {
      res.status(503).json({
        success: false,
        error: 'Database Unavailable',
        message: 'The API is unable to connect to the database',
        details: dbError.message
      });
    });
  }
})();

// Enhanced error handling middleware (should be after all routes)
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: err.message,
    path: req.path,
    method: req.method
  });
});

// Export the Express API
module.exports = app; 
