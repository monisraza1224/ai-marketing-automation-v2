const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const AuthMiddleware = require('../middleware/auth');

// Apply authentication
router.use(AuthMiddleware.authenticate);

// Get system overview
router.get('/overview', DashboardController.getOverview);

// Get AI performance metrics  
router.get('/ai-performance', DashboardController.getAIPerformance);

// System health check
router.get('/health', DashboardController.getSystemHealth);

module.exports = router;
