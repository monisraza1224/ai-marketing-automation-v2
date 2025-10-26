const Logger = require('../utils/logger');

const AuthMiddleware = {
  // Basic API key authentication - SIMPLIFIED FOR DEVELOPMENT
  authenticate(req, res, next) {
    try {
      // Skip authentication in development for testing
      if (process.env.NODE_ENV === 'development') {
        Logger.debug('Development mode - authentication skipped');
        return next();
      }

      const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
      
      if (!apiKey) {
        Logger.warn('API key missing from request');
        return res.status(401).json({
          status: 'error',
          message: 'API key required'
        });
      }

      // Extract key if it's in Bearer format
      const key = apiKey.startsWith('Bearer ') ? apiKey.slice(7) : apiKey;
      
      // Simple validation for now
      if (!key || key.length < 10) {
        Logger.warn('Invalid API key provided');
        return res.status(401).json({
          status: 'error',
          message: 'Invalid API key'
        });
      }

      Logger.debug('API key authenticated successfully');
      next();
    } catch (error) {
      Logger.error('Authentication middleware error', error);
      res.status(500).json({
        status: 'error',
        message: 'Authentication failed'
      });
    }
  },

  // Rate limiting middleware
  rateLimit(options = {}) {
    const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    const maxRequests = options.max || 100;
    const ipRequests = new Map();

    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      if (!ipRequests.has(ip)) {
        ipRequests.set(ip, []);
      }
      
      const requests = ipRequests.get(ip);
      const windowStart = now - windowMs;
      
      // Remove old requests
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }
      
      // Check if over limit
      if (requests.length >= maxRequests) {
        Logger.warn('Rate limit exceeded', { ip });
        return res.status(429).json({
          status: 'error',
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
        });
      }
      
      // Add current request
      requests.push(now);
      ipRequests.set(ip, requests);
      
      next();
    };
  }
};

module.exports = AuthMiddleware;
