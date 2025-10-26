const axios = require('axios');
const { GHL_API_BASE } = require('./constants');

class GHLConfig {
  constructor() {
    this.apiKey = process.env.GHL_API_KEY;
    this.baseURL = GHL_API_BASE;
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    };
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.getHeaders()
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('GHL API Error:', error.response?.data || error.message);
      throw new Error(`GHL API request failed: ${error.message}`);
    }
  }
}

module.exports = new GHLConfig();
