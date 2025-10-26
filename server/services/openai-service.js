const { OpenAI } = require('openai');
const Logger = require('../utils/logger');

class OpenAIService {
  constructor() {
    // Initialize with your OpenAI API key
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
    });
    this.model = 'gpt-3.5-turbo'; // Use GPT-3.5 for cost efficiency, can upgrade to GPT-4 later
  }

  // Generate content using OpenAI
  async generateContent(prompt, options = {}) {
    try {
      // If no API key, return mock response
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
        Logger.warn('OpenAI API key not configured, using mock response');
        return this.getMockResponse(prompt);
      }

      const startTime = Date.now();
      
      const completion = await this.client.chat.completions.create({
        model: options.model || this.model,
        messages: [
          {
            role: 'system',
            content: options.systemPrompt || 'You are an expert marketing copywriter and content creator. Create engaging, persuasive, and conversion-focused content that drives results.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.max_tokens || 800,
        temperature: options.temperature || 0.7,
      });

      const generationTime = Date.now() - startTime;
      
      const result = {
        content: completion.choices[0]?.message?.content,
        usage: completion.usage,
        generationTime,
        model: completion.model
      };

      Logger.info('OpenAI content generated successfully', {
        promptLength: prompt.length,
        tokensUsed: completion.usage.total_tokens,
        generationTime: `${generationTime}ms`
      });

      return result;
    } catch (error) {
      Logger.error('OpenAI content generation failed', error);
      // Fallback to mock response on error
      return this.getMockResponse(prompt, true);
    }
  }

  // Mock response when OpenAI is not available
  getMockResponse(prompt, isError = false) {
    const businessMatch = prompt.match(/Business: (.*?)(?:\n|$)/);
    const business = businessMatch ? businessMatch[1] : 'Your Business';
    
    const painPointsMatch = prompt.match(/Pain Points: (.*?)(?:\n|$)/);
    const painPoints = painPointsMatch ? painPointsMatch[1] : 'business challenges';
    
    const goalsMatch = prompt.match(/Goals: (.*?)(?:\n|$)/);
    const goals = goalsMatch ? goalsMatch[1] : 'achieving success';

    const mockContent = `🔥 **AI-Generated Content for ${business}** 🔥

We understand you're facing ${painPoints}. Our proven strategies help you ${goals} with remarkable results!

💡 **What We Offer:**
✅ Customized solutions for your specific needs
✅ Data-driven strategies that deliver real results  
✅ Expert guidance every step of the way

🚀 **Ready to transform your business?**
Contact us today for a FREE consultation!

#${business.replace(/\s+/g, '')} #BusinessGrowth #Success

${isError ? '\n(Note: Using enhanced mock content - add OpenAI API key for real AI generation)' : ''}`;

    return {
      content: mockContent,
      usage: {
        total_tokens: 150,
        prompt_tokens: 80,
        completion_tokens: 70
      },
      generationTime: 100,
      model: 'gpt-3.5-turbo-mock'
    };
  }

  // Generate marketing content with structured prompt
  async generateMarketingContent(clientData, contentType, funnelStage) {
    const prompt = this.buildMarketingPrompt(clientData, contentType, funnelStage);
    
    const options = {
      temperature: this.getTemperatureForContentType(contentType),
      max_tokens: this.getMaxTokensForContentType(contentType),
      systemPrompt: this.getSystemPromptForContentType(contentType)
    };

    return await this.generateContent(prompt, options);
  }

  // Build marketing-specific prompts
  buildMarketingPrompt(clientData, contentType, funnelStage) {
    return `
Create ${contentType} for ${funnelStage.toUpperCase()} funnel stage.

CLIENT INFORMATION:
- Business: ${clientData.businessName || 'Not specified'}
- Industry: ${clientData.industry || 'Not specified'}
- Target Audience: ${clientData.targetAudience || 'Not specified'}
- Pain Points: ${clientData.painPoints?.join(', ') || 'Not specified'}
- Goals: ${clientData.goals?.join(', ') || 'Not specified'}
- Client Story: ${clientData.clientStory || 'Not specified'}

CONTENT REQUIREMENTS:
- Funnel Stage: ${funnelStage.toUpperCase()} (${this.getFunnelStageDescription(funnelStage)})
- Content Type: ${contentType}
- Tone: Professional, engaging, and persuasive
- Call-to-Action: Clear and compelling
- Length: Appropriate for ${contentType}

Please generate high-converting content that resonates with the target audience and addresses their specific pain points.
`;
  }

  // Get funnel stage description
  getFunnelStageDescription(funnelStage) {
    const descriptions = {
      'tof': 'Top of Funnel - Awareness and education content',
      'mof': 'Middle of Funnel - Consideration and evaluation content', 
      'bof': 'Bottom of Funnel - Conversion and decision content'
    };
    return descriptions[funnelStage] || 'General marketing content';
  }

  // Content type specific configurations
  getTemperatureForContentType(contentType) {
    const temperatures = {
      'video_script': 0.8,
      'ad_copy': 0.7,
      'email': 0.6,
      'social_post': 0.9,
      'welcome_letter': 0.5,
      'analysis': 0.3
    };
    return temperatures[contentType] || 0.7;
  }

  getMaxTokensForContentType(contentType) {
    const tokens = {
      'video_script': 1200,
      'ad_copy': 400,
      'email': 600,
      'social_post': 300,
      'welcome_letter': 800,
      'analysis': 1500
    };
    return tokens[contentType] || 600;
  }

  getSystemPromptForContentType(contentType) {
    const prompts = {
      'video_script': 'You are a professional video scriptwriter. Create engaging video scripts with visual cues, spoken dialogue, and clear scene directions.',
      'ad_copy': 'You are a expert copywriter specializing in high-converting ad copy. Create attention-grabbing headlines and persuasive body text.',
      'email': 'You are an email marketing expert. Create compelling email content with engaging subject lines and clear calls-to-action.',
      'social_post': 'You are a social media marketing expert. Create engaging posts with relevant hashtags and platform-optimized content.',
      'welcome_letter': 'You are a professional business writer. Create warm, welcoming letters that build strong client relationships.'
    };
    return prompts[contentType] || 'You are an expert marketing copywriter and content creator.';
  }

  // Analyze strategy call transcript
  async analyzeCallTranscript(transcript) {
    const prompt = `
Analyze this strategy call transcript and extract key marketing insights:

TRANSCRIPT:
${transcript.substring(0, 3000)} // Limit transcript length

Please extract structured information about:
1. Client's business story and background
2. Key pain points and challenges mentioned
3. Goals and objectives discussed
4. Target audience details
5. Unique value propositions
6. Personal motivations

Provide the analysis in a structured format.
`;

    return await this.generateContent(prompt, {
      temperature: 0.3,
      max_tokens: 1200
    });
  }
}

module.exports = new OpenAIService();
