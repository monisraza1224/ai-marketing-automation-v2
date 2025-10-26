const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes and middleware
const apiRoutes = require('./server/routes/apiRoutes');
const ErrorHandler = require('./server/middleware/errorHandler');
const Logger = require('./server/utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use(apiRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Marketing Automation Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AI Marketing Automation System',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/v1/docs'
    }
  });
});

// Error handling middleware (must be last)
app.use(ErrorHandler.handleNotFound);
app.use(ErrorHandler.handleError);

// Setup unhandled exception handlers
ErrorHandler.handleUnhandledRejection();
ErrorHandler.handleUncaughtException();

// Start server
app.listen(PORT, () => {
  Logger.info(`🚀 AI Marketing Automation Server running on port ${PORT}`);
  Logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
  Logger.info(`📍 Health check: http://localhost:${PORT}/health`);
  Logger.info(`📍 API Documentation: http://localhost:${PORT}/api/v1/docs`);
});

module.exports = app;
