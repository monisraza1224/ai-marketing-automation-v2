const Logger = require('../utils/logger');
const AIContentService = require('../services/ai-content-service');
const FacebookAdsService = require('../services/facebook-ads-service');

class ContentController {
  // Generate AI content based on client data
  async generateContent(req, res) {
    try {
      const { clientData, contentType, funnelStage } = req.body;

      if (!clientData || !contentType) {
        return res.status(400).json({ 
          error: 'clientData and contentType are required' 
        });
      }

      Logger.info('Generating AI content', { contentType, funnelStage });

      const content = await AIContentService.generateContent(
        clientData, 
        contentType, 
        funnelStage
      );

      res.status(200).json({
        status: 'success',
        contentType,
        funnelStage,
        content
      });
    } catch (error) {
      Logger.error('Content generation error', error);
      res.status(500).json({ error: 'Content generation failed' });
    }
  }

  // Generate multiple content pieces for a campaign
  async generateCampaignContent(req, res) {
    try {
      const { clientData, campaignType } = req.body;

      Logger.info('Generating campaign content', { campaignType });

      const campaignContent = await AIContentService.generateCampaignTemplates(
        clientData, 
        campaignType
      );

      res.status(200).json({
        status: 'success',
        campaignType,
        content: campaignContent
      });
    } catch (error) {
      Logger.error('Campaign content generation error', error);
      res.status(500).json({ error: 'Campaign content generation failed' });
    }
  }

  // Get content performance suggestions
  async getContentSuggestions(req, res) {
    try {
      const { performanceData, clientId } = req.body;

      Logger.info('Getting content suggestions', { clientId });

      const suggestions = await AIContentService.generatePerformanceSuggestions(
        performanceData,
        clientId
      );

      res.status(200).json({
        status: 'success',
        suggestions
      });
    } catch (error) {
      Logger.error('Content suggestions error', error);
      res.status(500).json({ error: 'Failed to generate content suggestions' });
    }
  }

  // Generate client documents (welcome letters, etc.)
  async generateClientDocuments(req, res) {
    try {
      const { clientData } = req.body;

      if (!clientData) {
        return res.status(400).json({ error: 'clientData is required' });
      }

      Logger.info('Generating client documents', { 
        business: clientData.businessName 
      });

      const documents = await AIContentService.generateClientDocuments(clientData);

      res.status(200).json({
        status: 'success',
        documents
      });
    } catch (error) {
      Logger.error('Client documents generation error', error);
      res.status(500).json({ error: 'Failed to generate client documents' });
    }
  }

  // Create Facebook ad campaign with generated content
  async createFacebookCampaign(req, res) {
    try {
      const { campaignData, clientData, content } = req.body;

      Logger.info('Creating Facebook campaign', {
        campaignName: campaignData.name
      });

      // Create campaign
      const campaign = await FacebookAdsService.createCampaign(campaignData);

      // Create ad sets for different funnel stages
      const adSets = {};
      if (content.top_of_funnel) {
        adSets.tof = await FacebookAdsService.createFunnelAdSets(
          campaign.id,
          clientData,
          'top_of_funnel'
        );
      }

      if (content.middle_of_funnel) {
        adSets.mof = await FacebookAdsService.createFunnelAdSets(
          campaign.id,
          clientData,
          'middle_of_funnel'
        );
      }

      if (content.bottom_of_funnel) {
        adSets.bof = await FacebookAdsService.createFunnelAdSets(
          campaign.id,
          clientData,
          'bottom_of_funnel'
        );
      }

      // Generate landing page
      const landingPage = await FacebookAdsService.generateLandingPage(
        clientData,
        campaignData.objective
      );

      res.status(200).json({
        status: 'success',
        campaign,
        adSets,
        landingPage,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      Logger.error('Facebook campaign creation error', error);
      res.status(500).json({ error: 'Failed to create Facebook campaign' });
    }
  }

  // Generate and setup complete marketing funnel
  async setupCompleteFunnel(req, res) {
    try {
      const { clientData, strategyAnalysis } = req.body;

      Logger.info('Setting up complete marketing funnel', {
        business: clientData.businessName
      });

      // Generate all content templates
      const campaignContent = await AIContentService.generateCampaignTemplates(
        clientData,
        'complete_funnel'
      );

      // Generate client documents
      const clientDocuments = await AIContentService.generateClientDocuments(clientData);

      // Setup Facebook campaigns
      const campaignData = {
        name: `${clientData.businessName} - Complete Funnel`,
        objective: 'CONVERSIONS',
        status: 'ACTIVE'
      };

      const facebookCampaign = await FacebookAdsService.createCampaign(campaignData);

      res.status(200).json({
        status: 'success',
        message: 'Complete marketing funnel setup successfully',
        content: campaignContent,
        documents: clientDocuments,
        facebookCampaign,
        setupComplete: true
      });
    } catch (error) {
      Logger.error('Complete funnel setup error', error);
      res.status(500).json({ error: 'Failed to setup complete marketing funnel' });
    }
  }
}

module.exports = ContentController;
