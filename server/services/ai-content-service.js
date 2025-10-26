const Logger = require('../utils/logger');
const OpenAIService = require('./openai-service');
const { CONTENT_TYPES, CAMPAIGN_TEMPLATES } = require('../../config/constants');
const Helpers = require('../utils/helpers');

class AIContentService {
  // Generate AI content based on type and client data
  async generateContent(clientData, contentType, funnelStage = null) {
    try {
      Logger.info('Generating AI content', { contentType, funnelStage });

      const aiResult = await OpenAIService.generateMarketingContent(
        clientData, 
        contentType, 
        funnelStage
      );

      return {
        contentId: Helpers.generateId('content_'),
        contentType,
        funnelStage,
        content: aiResult.content,
        usage: aiResult.usage,
        generationTime: aiResult.generationTime,
        model: aiResult.model,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      Logger.error('AI content generation error', error);
      throw new Error('Failed to generate AI content');
    }
  }

  // Generate campaign templates
  async generateCampaignTemplates(clientData, campaignType) {
    try {
      Logger.info('Generating campaign templates', { campaignType });

      const templates = {
        top_of_funnel: [],
        middle_of_funnel: [],
        bottom_of_funnel: []
      };

      // Generate TOF content
      for (let i = 0; i < CAMPAIGN_TEMPLATES.TOF_COUNT; i++) {
        const content = await this.generateContent(
          clientData, 
          this.getContentTypeForFunnel('tof', i), 
          'tof'
        );
        templates.top_of_funnel.push(content);
      }

      // Generate MOF content
      for (let i = 0; i < CAMPAIGN_TEMPLATES.MOF_COUNT; i++) {
        const content = await this.generateContent(
          clientData, 
          this.getContentTypeForFunnel('mof', i), 
          'mof'
        );
        templates.middle_of_funnel.push(content);
      }

      // Generate BOF content
      for (let i = 0; i < CAMPAIGN_TEMPLATES.BOF_COUNT; i++) {
        const content = await this.generateContent(
          clientData, 
          this.getContentTypeForFunnel('bof', i), 
          'bof'
        );
        templates.bottom_of_funnel.push(content);
      }

      return templates;
    } catch (error) {
      Logger.error('Campaign template generation error', error);
      throw error;
    }
  }

  // Get appropriate content type for funnel stage
  getContentTypeForFunnel(funnelStage, index) {
    const contentTypes = {
      tof: ['social_post', 'video_script', 'ad_copy', 'social_post', 'video_script', 'ad_copy'],
      mof: ['email', 'video_script', 'ad_copy', 'email'],
      bof: ['email', 'ad_copy', 'email']
    };
    
    return contentTypes[funnelStage][index] || 'ad_copy';
  }

  // Generate performance-based content suggestions
  async generatePerformanceSuggestions(performanceData, clientId) {
    try {
      Logger.info('Generating performance suggestions', { clientId });

      const prompt = this.buildPerformancePrompt(performanceData, clientId);
      const suggestions = await OpenAIService.generateContent(prompt, {
        temperature: 0.5,
        max_tokens: 800
      });

      return {
        clientId,
        suggestions: suggestions.content,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      Logger.error('Performance suggestions error', error);
      throw error;
    }
  }

  // Build performance analysis prompt
  buildPerformancePrompt(performanceData, clientId) {
    return `
Analyze this marketing performance data and provide specific improvement suggestions:

PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

CLIENT ID: ${clientId}

Based on this data, provide actionable recommendations for:
1. Content optimization strategies
2. Audience targeting improvements  
3. Performance enhancement tactics
4. New content opportunities
5. Testing recommendations

Focus on practical, implementable advice.
`;
  }

  // Generate client documents (welcome letters, etc.)
  async generateClientDocuments(clientData) {
    try {
      const documents = {};

      // Welcome Letter
      documents.welcomeLetter = await this.generateContent(
        clientData,
        CONTENT_TYPES.WELCOME_LETTER
      );

      // 30-Day Letter
      documents.thirtyDayLetter = await this.generateContent(
        clientData,
        CONTENT_TYPES.THIRTY_DAY_LETTER
      );

      // 1-Year Letter
      documents.oneYearLetter = await this.generateContent(
        clientData,
        CONTENT_TYPES.ONE_YEAR_LETTER
      );

      return documents;
    } catch (error) {
      Logger.error('Client documents generation error', error);
      throw error;
    }
  }

  // Analyze strategy call transcript
  async analyzeStrategyCall(transcript) {
    try {
      Logger.info('Analyzing strategy call transcript');
      
      const analysis = await OpenAIService.analyzeCallTranscript(transcript);
      
      return {
        analysis: analysis.content,
        usage: analysis.usage,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      Logger.error('Strategy call analysis error', error);
      throw error;
    }
  }
}

module.exports = new AIContentService();
