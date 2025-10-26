const Logger = require('../utils/logger');
const GHLService = require('../services/ghl-service');
const StrategyAnalyzer = require('../services/strategy-analyzer');
const { LEAD_SCORING } = require('../../config/constants');

class WebhookController {
  // Handle GHL webhooks
  async handleGHLWebhook(req, res) {
    try {
      const { event, contact, locationId } = req.body;
      
      Logger.info('GHL Webhook Received', { event, locationId });
      
      // Process different webhook events
      switch (event) {
        case 'contactAdded':
          await this.handleNewContact(contact, locationId);
          break;
        case 'contactNoteAdded':
          await this.handleContactNote(contact, locationId);
          break;
        case 'emailOpened':
          await this.handleEmailOpen(contact, locationId);
          break;
        case 'linkClicked':
          await this.handleLinkClick(contact, locationId);
          break;
        default:
          Logger.info('Unhandled webhook event', { event });
      }
      
      res.status(200).json({ status: 'success', message: 'Webhook processed' });
    } catch (error) {
      Logger.error('Webhook processing error', error);
      res.status(500).json({ status: 'error', message: 'Webhook processing failed' });
    }
  }

  async handleNewContact(contact, locationId) {
    Logger.info('New contact added', { contactId: contact.id, locationId });
    
    // Add welcome note
    const welcomeNote = `New contact ${contact.email || contact.phone} added to system. Initial lead score: 0`;
    await GHLService.addContactNote(contact.id, locationId, welcomeNote);
  }

  async handleContactNote(contact, locationId) {
    Logger.info('Contact note added', { contactId: contact.id, locationId });
    
    // TODO: Analyze note content for lead scoring opportunities
    // This could trigger additional AI analysis or follow-up actions
  }

  async handleEmailOpen(contact, locationId) {
    Logger.info('Email opened', { contactId: contact.id, locationId });
    
    // Update lead score for email engagement
    await GHLService.updateLeadScore(
      contact.id, 
      LEAD_SCORING.EMAIL_OPEN, 
      locationId
    );
    
    // Add engagement note
    const engagementNote = `Email opened - Lead score increased by ${LEAD_SCORING.EMAIL_OPEN}`;
    await GHLService.addContactNote(contact.id, locationId, engagementNote);
  }

  async handleLinkClick(contact, locationId) {
    Logger.info('Link clicked', { contactId: contact.id, locationId });
    
    // Update lead score for link click (higher engagement)
    await GHLService.updateLeadScore(
      contact.id, 
      LEAD_SCORING.LINK_CLICK, 
      locationId
    );
    
    // Add high-engagement note
    const engagementNote = `Link clicked - Lead score increased by ${LEAD_SCORING.LINK_CLICK}`;
    await GHLService.addContactNote(contact.id, locationId, engagementNote);
  }

  // Handle strategy call transcript uploads
  async handleStrategyCallUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { originalname, filename, path } = req.file;
      
      Logger.info('Strategy call transcript uploaded', {
        originalname,
        filename,
        path
      });

      // Read and process the transcript file
      const fs = require('fs').promises;
      const transcriptText = await fs.readFile(path, 'utf8');
      
      // Process the transcript with AI
      const analysisResult = await StrategyAnalyzer.analyzeCallTranscript(transcriptText);
      
      // Generate content brief
      const contentBrief = StrategyAnalyzer.generateContentBrief(analysisResult);

      res.status(200).json({
        status: 'success',
        message: 'Transcript uploaded and analyzed successfully',
        file: filename,
        analysis: analysisResult,
        contentBrief: contentBrief
      });
    } catch (error) {
      Logger.error('Transcript upload error', error);
      res.status(500).json({ error: 'Transcript processing failed' });
    }
  }

  // Handle Fireflies.ai integration webhooks
  async handleFirefliesWebhook(req, res) {
    try {
      const { event, data } = req.body;
      
      Logger.info('Fireflies Webhook Received', { event });
      
      switch (event) {
        case 'transcription_ready':
          await this.handleTranscriptionReady(data);
          break;
        case 'meeting_insights':
          await this.handleMeetingInsights(data);
          break;
        default:
          Logger.info('Unhandled Fireflies event', { event });
      }
      
      res.status(200).json({ status: 'success', message: 'Fireflies webhook processed' });
    } catch (error) {
      Logger.error('Fireflies webhook processing error', error);
      res.status(500).json({ status: 'error', message: 'Fireflies webhook processing failed' });
    }
  }

  async handleTranscriptionReady(transcriptionData) {
    Logger.info('Transcription ready', { 
      meetingId: transcriptionData.id,
      duration: transcriptionData.duration 
    });
    
    // TODO: Process transcription and extract key insights
    // This could trigger follow-up content generation or lead scoring
  }

  async handleMeetingInsights(insightsData) {
    Logger.info('Meeting insights received', { 
      meetingId: insightsData.id,
      insightsCount: insightsData.insights?.length 
    });
    
    // TODO: Process meeting insights for sales intelligence
  }

  // Handle lead engagement webhooks
async handleLeadEngagement(req, res) {
  try {
    const { contactId, locationId, eventType, eventData } = req.body;
    
    Logger.info('Lead engagement webhook received', {
      contactId,
      locationId,
      eventType
    });

    let score = 0;
    let reason = '';

    // Score different engagement types
    switch (eventType) {
      case 'email_opened':
        score = 1;
        reason = 'Email opened - initial engagement';
        break;
      case 'link_clicked':
        score = 2;
        reason = 'Link clicked - high interest';
        break;
      case 'form_submitted':
        score = 5;
        reason = 'Form submitted - strong intent';
        break;
      case 'page_visited':
        score = 1;
        reason = 'Key page visited - exploring solutions';
        break;
      default:
        score = 1;
        reason = 'General engagement';
    }

    // Update lead score
    await GHLService.updateLeadScore(contactId, locationId, score, reason);

    // Check if we should trigger AI content
    if (score >= 3) {
      await this.triggerEngagementContent(contactId, locationId, eventType);
    }

    res.status(200).json({
      status: 'success',
      message: 'Lead engagement processed',
      scoreAdded: score,
      reason
    });

  } catch (error) {
    Logger.error('Lead engagement processing error', error);
    res.status(500).json({ error: 'Failed to process lead engagement' });
  }
}

// Trigger AI content based on engagement
async triggerEngagementContent(contactId, locationId, engagementType) {
  try {
    // Get contact details
    const contact = await GHLService.getContact(contactId, locationId);
    
    // Create personalized content based on engagement
    const contentTypes = {
      'link_clicked': 'follow_up_email',
      'form_submitted': 'welcome_sequence', 
      'page_visited': 'targeted_content'
    };

    const contentType = contentTypes[engagementType] || 'engagement_email';

    const content = await AIContentService.generateContent(
      {
        firstName: contact.firstName,
        email: contact.email,
        businessName: contact.businessName,
        engagementType: engagementType
      },
      contentType,
      'mof' // Middle of funnel
    );

    Logger.info('AI content triggered for engagement', {
      contactId,
      engagementType,
      contentType
    });

    return content;

  } catch (error) {
    Logger.error('Engagement content triggering failed', error);
  }
}

// Handle new contact creation
async handleNewContact(req, res) {
  try {
    const { contactId, locationId, contactData } = req.body;

    Logger.info('New contact webhook received', {
      contactId,
      locationId,
      email: contactData.email
    });

    // Add welcome note
    await GHLService.addContactNote(
      contactId, 
      locationId, 
      '🤖 AI Assistant: Contact added to marketing automation system. Ready for personalized content delivery.'
    );

    // Generate welcome content if business info available
    if (contactData.businessName) {
      const welcomeContent = await AIContentService.generateContent(
        contactData,
        'welcome_email',
        'tof'
      );

      Logger.info('Welcome content generated for new contact', {
        contactId,
        businessName: contactData.businessName
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'New contact processed',
      actions: ['welcome_note_added', 'content_queued']
    });

  } catch (error) {
    Logger.error('New contact processing error', error);
    res.status(500).json({ error: 'Failed to process new contact' });
  }
}

  // Handle Slack notifications
  async handleSlackNotification(req, res) {
    try {
      const { channel, message, type = 'info' } = req.body;
      
      Logger.info('Sending Slack notification', { channel, type });
      
      // TODO: Integrate with Slack webhook
      const slackResult = await this.sendToSlack(channel, message, type);
      
      res.status(200).json({
        status: 'success',
        message: 'Slack notification sent',
        result: slackResult
      });
    } catch (error) {
      Logger.error('Slack notification error', error);
      res.status(500).json({ error: 'Failed to send Slack notification' });
    }
  }

  async sendToSlack(channel, message, type) {
    // TODO: Implement actual Slack integration
    Logger.info('Simulating Slack message', { channel, type, message });
    
    return {
      ok: true,
      channel: channel,
      ts: Date.now().toString(),
      message: { text: message }
    };
  }
}

module.exports = WebhookController;
