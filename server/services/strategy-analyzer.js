const Logger = require('../utils/logger');
const OpenAIService = require('./openai-service');

class StrategyAnalyzer {
  // Analyze call transcript and extract marketing insights
  async analyzeCallTranscript(transcript) {
    try {
      Logger.info('Analyzing strategy call transcript');

      const prompt = `
STRATEGY CALL ANALYSIS TASK:

Please analyze this sales/marketing strategy call transcript and extract structured information for marketing automation:

TRANSCRIPT:
${transcript.substring(0, 4000)} // Limit length

EXTRACT THE FOLLOWING STRUCTURED DATA:

1. CLIENT STORY & BACKGROUND:
   - Business origin story
   - Current situation
   - Personal motivations

2. PAIN POINTS & CHALLENGES:
   - Main business problems (list 3-5)
   - Specific pain points mentioned
   - Obstacles to growth

3. GOALS & OBJECTIVES:
   - Short-term goals (3 months)
   - Long-term vision
   - Specific metrics they want to improve

4. TARGET AUDIENCE:
   - Ideal customer description
   - Demographics if mentioned
   - Customer challenges they solve

5. COMPETITIVE LANDSCAPE:
   - Who they compete with
   - Unique advantages mentioned
   - Market positioning

6. SUCCESS CRITERIA:
   - What success looks like for them
   - Key performance indicators
   - Desired outcomes

Please provide this as a structured JSON object with these categories.
`;

      const analysis = await OpenAIService.generateContent(prompt, {
        temperature: 0.3,
        max_tokens: 1500
      });

      // Parse and structure the response
      return this.parseAnalysis(analysis.content);

    } catch (error) {
      Logger.error('Transcript analysis error', error);
      return this.getFallbackAnalysis(transcript);
    }
  }

  // Parse AI response into structured data
  parseAnalysis(content) {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback structure
      return {
        clientStory: this.extractSection(content, 'CLIENT STORY') || 'Business background extracted from conversation.',
        painPoints: this.extractList(content, 'PAIN POINTS') || ['Growth challenges', 'Customer acquisition'],
        goals: this.extractList(content, 'GOALS') || ['Increase revenue', 'Improve marketing'],
        targetAudience: this.extractSection(content, 'TARGET AUDIENCE') || 'Business owners and professionals',
        uniqueAdvantages: this.extractList(content, 'COMPETITIVE') || ['Quality service', 'Expert team'],
        successCriteria: this.extractSection(content, 'SUCCESS CRITERIA') || 'Business growth and customer satisfaction',
        rawAnalysis: content
      };
    } catch (error) {
      Logger.warn('Analysis parsing failed, using fallback');
      return this.getFallbackAnalysis();
    }
  }

  // Extract section from text
  extractSection(text, sectionName) {
    const regex = new RegExp(`${sectionName}[\\s\\S]*?\\n\\n`, 'i');
    const match = text.match(regex);
    return match ? match[0].replace(new RegExp(sectionName, 'i'), '').trim() : '';
  }

  // Extract list items
  extractList(text, sectionName) {
    const section = this.extractSection(text, sectionName);
    return section.split('\n')
      .filter(item => item.trim() && /^[•\-*\d]/.test(item.trim()))
      .map(item => item.replace(/^[•\-*\d.\s]+/, '').trim())
      .slice(0, 5);
  }

  // Fallback analysis
  getFallbackAnalysis(transcript = '') {
    return {
      clientStory: 'Business focused on growth and customer satisfaction.',
      painPoints: ['Marketing challenges', 'Customer acquisition', 'Revenue growth'],
      goals: ['Increase leads', 'Improve conversion rates', 'Scale business'],
      targetAudience: 'Business professionals and entrepreneurs',
      uniqueAdvantages: ['Quality service', 'Expert team', 'Proven results'],
      successCriteria: 'Measurable business growth and improved marketing performance',
      rawAnalysis: transcript.substring(0, 500) + '...'
    };
  }

  // Generate content brief from analysis
  generateContentBrief(analysis) {
    return {
      clientProfile: {
        story: analysis.clientStory,
        painPoints: analysis.painPoints,
        goals: analysis.goals
      },
      contentThemes: this.generateContentThemes(analysis),
      messaging: this.generateMessaging(analysis),
      targetAudience: analysis.targetAudience,
      toneGuidelines: {
        voice: 'Expert yet relatable',
        style: 'Professional but conversational',
        emotion: 'Empathetic and solution-focused'
      }
    };
  }

  generateContentThemes(analysis) {
    const themes = [];
    
    // Pain point themes
    analysis.painPoints.forEach(painPoint => {
      themes.push(`Solving ${painPoint}`, `Overcoming ${painPoint.toLowerCase()}`);
    });
    
    // Goal themes
    analysis.goals.forEach(goal => {
      themes.push(`Achieving ${goal}`, `Path to ${goal.toLowerCase()}`);
    });
    
    return themes.slice(0, 8);
  }

  generateMessaging(analysis) {
    return {
      valueProposition: `Helping businesses ${analysis.goals[0]?.toLowerCase() || 'grow'} by addressing ${analysis.painPoints[0]?.toLowerCase() || 'key challenges'}`,
      keyBenefits: analysis.uniqueAdvantages,
      proofPoints: ['Expert guidance', 'Proven strategies', 'Measurable results']
    };
  }
}

module.exports = new StrategyAnalyzer();
