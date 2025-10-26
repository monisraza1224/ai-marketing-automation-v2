const Logger = require('../utils/logger');

const ErrorHandler = {
  // Global error handling middleware
  handleError(err, req, res, next) {
    Logger.error('Global error handler', err);

    // Default error response
    let errorResponse = {
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    };

    // Handle different error types
    if (err.name === 'ValidationError') {
      // Mongoose validation error
      errorResponse.status = 'fail';
      errorResponse.message = 'Validation failed';
      errorResponse.errors = this.formatValidationErrors(err);
      return res.status(400).json(errorResponse);
    }

    if (err.name === 'CastError') {
      // Mongoose cast error (invalid ID)
      errorResponse.status = 'fail';
      errorResponse.message = 'Invalid resource ID';
      return res.status(400).json(errorResponse);
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      // File upload size limit exceeded
      errorResponse.status = 'fail';
      errorResponse.message = 'File size too large';
      return res.status(413).json(errorResponse);
    }

    if (err.code === 'ENOTFOUND') {
      // DNS lookup failed (API unavailable)
      errorResponse.status = 'error';
      errorResponse.message = 'Service temporarily unavailable';
      return res.status(503).json(errorResponse);
    }

    if (err.response && err.response.status) {
      // API error from external service
      errorResponse.status = 'error';
      errorResponse.message = `External service error: ${err.response.status}`;
      errorResponse.details = err.response.data;
      return res.status(err.response.status).json(errorResponse);
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
      errorResponse.details = err.message;
    }

    // Default to 500 Internal Server Error
    res.status(500).json(errorResponse);
  },

  // Format mongoose validation errors
  formatValidationErrors(err) {
    const errors = {};
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    return errors;
  },

  // Async error wrapper (for handling async route errors)
  catchAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  },

  // 404 Not Found handler
  handleNotFound(req, res, next) {
    res.status(404).json({
      status: 'error',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    });
  },

  // Unhandled rejection handler
  handleUnhandledRejection() {
    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('Unhandled Promise Rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack
      });
      
      // In production, you might want to exit the process
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
  },

  // Uncaught exception handler
  handleUncaughtException() {
    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught Exception', error);
      
      // In production, you might want to exit the process
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
  }
};

module.exports = ErrorHandler;
