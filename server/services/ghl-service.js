const Logger = require('../utils/logger');
const { LEAD_SCORING } = require('../../config/constants');

class GHLService {
  // Mock methods that return success for development
  async validateCredentials() {
    Logger.info('GHL Mock: Credentials validation skipped for development');
    return true;
  }

  async getLocations() {
    Logger.info('GHL Mock: Returning mock locations');
    return [
      {
        id: process.env.GHL_LOCATION_ID || 'mock-location-1',
        name: 'Alkemia Marketing (Mock)',
        address: { address1: '123 Mock Street' },
        timezone: 'America/New_York'
      }
    ];
  }

  async getLocation(locationId) {
    Logger.info('GHL Mock: Returning mock location details');
    return {
      id: locationId,
      name: 'Alkemia Marketing',
      address: { address1: '123 Business Ave' },
      timezone: 'America/New_York'
    };
  }

  async getContacts(locationId, limit = 10) {
    Logger.info('GHL Mock: Returning mock contacts');
    return [
      {
        id: 'mock-contact-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      {
        id: 'mock-contact-2', 
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1234567891'
      }
    ].slice(0, limit);
  }

  async updateLeadScore(contactId, locationId, score, reason = '') {
    Logger.info('GHL Mock: Lead score updated', { contactId, score, reason });
    return Math.max(0, score); // Return positive score
  }

  async addContactNote(contactId, locationId, note) {
    Logger.info('GHL Mock: Note added to contact', { contactId, note });
    return true;
  }

  async promoteToNewLead(contactId, locationId) {
    Logger.info('GHL Mock: Contact promoted to New Lead', { contactId });
    return true;
  }
}

module.exports = new GHLService();
