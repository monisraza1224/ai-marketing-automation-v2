const express = require('express');
const router = express.Router();
const ContentController = require('../controllers/contentController');
const AuthMiddleware = require('../middleware/auth');

// Instantiate controller
const contentController = new ContentController();

// Apply authentication to all content routes
router.use(AuthMiddleware.authenticate);

// Generate single content piece
router.post('/generate', (req, res) => contentController.generateContent(req, res));

// Generate campaign content templates
router.post('/campaign', (req, res) => contentController.generateCampaignContent(req, res));

// Get content performance suggestions
router.post('/suggestions', (req, res) => contentController.getContentSuggestions(req, res));

// Generate client documents
router.post('/documents', (req, res) => contentController.generateClientDocuments(req, res));

// Create Facebook ad campaign
router.post('/facebook-campaign', (req, res) => contentController.createFacebookCampaign(req, res));

// Setup complete marketing funnel
router.post('/setup-funnel', (req, res) => contentController.setupCompleteFunnel(req, res));

// Get content generation status
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  res.status(200).json({
    status: 'success',
    jobId,
    progress: 'completed',
    generatedAt: new Date().toISOString()
  });
});

module.exports = router;
