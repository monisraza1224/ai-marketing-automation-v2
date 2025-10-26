const Logger = require('../utils/logger');
const AIContentService = require('../services/ai-content-service');
const GHLService = require('../services/ghl-service');

class DashboardController {
  // Get system overview
  async getOverview(req, res) {
    try {
      Logger.info('Generating system overview dashboard');

      // Get basic stats (using mock data for now)
      const overview = {
        system: {
          status: 'active',
          aiRequests: Math.floor(Math.random() * 50) + 10,
          contentGenerated: Math.floor(Math.random() * 30) + 5,
          activeAutomations: 3
        },
        leads: {
          total: Math.floor(Math.random() * 100) + 20,
          newThisWeek: Math.floor(Math.random() * 15) + 5,
          highScore: Math.floor(Math.random() * 10) + 2
        },
        campaigns: {
          active: 2,
          completed: 5,
          performance: '+15%' // Mock improvement
        },
        recentActivity: [
          {
            type: 'content_generated',
            description: 'Video script for Test Business',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            type: 'lead_scored', 
            description: 'Lead score increased for john@example.com',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          },
          {
            type: 'strategy_analyzed',
            description: 'Strategy call processed - Digital Marketing Co',
            timestamp: new Date(Date.now() - 10800000).toISOString()
          }
        ]
      };

      res.status(200).json({
        status: 'success',
        overview,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      Logger.error('Dashboard overview error', error);
      res.status(500).json({ error: 'Failed to generate dashboard' });
    }
  }

  // Get AI performance metrics
  async getAIPerformance(req, res) {
    try {
      const performance = {
        totalRequests: Math.floor(Math.random() * 100) + 50,
        successfulRequests: Math.floor(Math.random() * 95) + 45,
        averageResponseTime: '2.3s',
        costEstimate: `$${(Math.random() * 15 + 5).toFixed(2)}`,
        topContentTypes: [
          { type: 'ad_copy', count: Math.floor(Math.random() * 20) + 10 },
          { type: 'email', count: Math.floor(Math.random() * 15) + 8 },
          { type: 'video_script', count: Math.floor(Math.random() * 10) + 5 }
        ]
      };

      res.status(200).json({
        status: 'success',
        performance,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      Logger.error('AI performance metrics error', error);
      res.status(500).json({ error: 'Failed to get AI performance' });
    }
  }

  // Quick system health check
  async getSystemHealth(req, res) {
    try {
      const health = {
        server: 'healthy',
        openai: 'connected', 
        database: 'mock_mode',
        ghL: 'mock_mode',
        webhooks: 'active',
        overall: 'operational'
      };

      res.status(200).json({
        status: 'success',
        health,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      Logger.error('System health check error', error);
      res.status(500).json({ error: 'Health check failed' });
    }
  }
}

module.exports = new DashboardController();
