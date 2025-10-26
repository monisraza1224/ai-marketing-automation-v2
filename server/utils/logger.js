class Logger {
  static info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp} - ${message}`);
    
    if (error) {
      if (error.stack) {
        console.error(`[ERROR] Stack: ${error.stack}`);
      } else if (error.message) {
        console.error(`[ERROR] Details: ${error.message}`);
      } else {
        console.error(`[ERROR] Details:`, error);
      }
    }
  }

  static warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(`[DEBUG] ${timestamp} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  // Structured logging for webhooks
  static webhook(source, event, data = null) {
    this.info(`Webhook from ${source} - ${event}`, data);
  }

  // Structured logging for API calls
  static apiCall(method, endpoint, statusCode, duration = null) {
    const logData = {
      method,
      endpoint,
      statusCode,
      duration: duration ? `${duration}ms` : null
    };
    
    if (statusCode >= 400) {
      this.warn(`API Call ${method} ${endpoint} - ${statusCode}`, logData);
    } else {
      this.debug(`API Call ${method} ${endpoint} - ${statusCode}`, logData);
    }
  }

  // Performance logging
  static performance(operation, duration, details = null) {
    const logData = {
      operation,
      duration: `${duration}ms`,
      ...details
    };
    
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation}`, logData);
    } else {
      this.debug(`Performance: ${operation}`, logData);
    }
  }
}

module.exports = Logger;
