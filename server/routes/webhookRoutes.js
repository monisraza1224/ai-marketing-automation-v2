const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhookController');
const UploadMiddleware = require('../middleware/upload');

// Instantiate controller
const webhookController = new WebhookController();

// GHL Webhook endpoint
router.post('/ghl', webhookController.handleGHLWebhook.bind(webhookController));

// Strategy call transcript upload
router.post(
  '/upload-transcript', 
  UploadMiddleware.single,
  UploadMiddleware.cleanupOnError,
  webhookController.handleStrategyCallUpload.bind(webhookController)
);

// Lead engagement webhook
router.post('/lead-engagement', webhookController.handleLeadEngagement.bind(webhookController));

// New contact webhook  
router.post('/new-contact', webhookController.handleNewContact.bind(webhookController));

// Test webhook endpoint
router.post('/test', (req, res) => {
  const testData = {
    contactId: 'test_contact_123',
    locationId: process.env.GHL_LOCATION_ID,
    eventType: 'email_opened',
    eventData: { emailId: 'test_email_456' }
  };
  
  // Process test webhook
  webhookController.handleLeadEngagement({ body: testData }, res);
});

// Fireflies.ai webhook endpoint
router.post('/fireflies', webhookController.handleFirefliesWebhook.bind(webhookController));

// Slack notifications endpoint
router.post('/slack', webhookController.handleSlackNotification.bind(webhookController));

// Health check for webhooks
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Webhook routes are active',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
