const Logger = require('../utils/logger');
const AIContentService = require('../services/ai-content-service');
const StrategyAnalyzer = require('../services/strategy-analyzer');

class StrategyController {
  // Process strategy call transcript and generate marketing plan
  async processStrategyCall(req, res) {
    try {
      const { transcript, clientInfo } = req.body;

      if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required' });
      }

      Logger.info('Processing strategy call transcript', {
        client: clientInfo?.businessName,
        transcriptLength: transcript.length
      });

      // Step 1: Analyze transcript with AI
      const analysis = await StrategyAnalyzer.analyzeCallTranscript(transcript);
      
      // Step 2: Generate content brief
      const contentBrief = StrategyAnalyzer.generateContentBrief(analysis);
      
      // Step 3: Create campaign content based on analysis
      const campaignContent = await AIContentService.generateCampaignTemplates(
        { ...clientInfo, ...analysis },
        'complete_funnel'
      );

      // Step 4: Generate client documents
      const clientDocuments = await AIContentService.generateClientDocuments({
        ...clientInfo,
        ...analysis
      });

      res.status(200).json({
        status: 'success',
        message: 'Strategy call processed successfully',
        analysis,
        contentBrief,
        campaignContent,
        clientDocuments,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      Logger.error('Strategy call processing error', error);
      res.status(500).json({ error: 'Failed to process strategy call' });
    }
  }

  // Quick analysis endpoint
  async quickAnalyze(req, res) {
    try {
      const { transcript } = req.body;
      
      if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required' });
      }

      const analysis = await StrategyAnalyzer.analyzeCallTranscript(transcript);
      
      res.status(200).json({
        status: 'success',
        analysis,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      Logger.error('Quick analysis error', error);
      res.status(500).json({ error: 'Analysis failed' });
    }
  }
}

module.exports = new StrategyController();
