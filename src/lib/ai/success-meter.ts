/**
 * Success Meter Calculation Service
 * Handles message quality analysis and success delta calculation
 * Separated from chat generation for better testability and reusability
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import type {
  MessageAnalysisParams,
  MessageAnalysisResult,
  MessageCategory,
  ConversationContext,
} from '@/types/chat';

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
  }
  return openaiClient;
}

/**
 * Load success delta evaluation prompt template
 */
function loadEvaluationPrompt(): string {
  const promptPath = path.join(
    process.cwd(),
    'src/prompts/success_delta_evaluation.md'
  );
  return fs.readFileSync(promptPath, 'utf-8');
}

/**
 * Calculate conversation momentum based on recent messages and meter
 */
function calculateConversationMomentum(
  conversationHistory: Array<{ role: string; content: string }>,
  currentMeter: number
): 'positive' | 'neutral' | 'negative' {
  // Look at last 3 exchanges (6 messages)
  const recentMessages = conversationHistory.slice(-6);
  
  // If too early in conversation, default to neutral
  if (recentMessages.length < 4) return 'neutral';
  
  // Analyze meter trend (use current meter as proxy)
  if (currentMeter < 25) return 'negative';
  if (currentMeter > 60) return 'positive';
  
  // Analyze sentiment/length of girl's recent responses
  const girlMessages = recentMessages.filter(m => m.role === 'assistant');
  if (girlMessages.length > 0) {
    const avgLength = girlMessages.reduce((sum, m) => sum + m.content.length, 0) / girlMessages.length;
    
    if (avgLength < 20) return 'negative'; // Short responses = low interest
    if (avgLength > 80) return 'positive'; // Long responses = high interest
  }
  
  return 'neutral';
}

/**
 * Detect if user mentions other girls or competition
 */
function detectCompetitionMention(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const competitionKeywords = [
    'other girl', 'other match', 'another girl', 'another match',
    'other girls', 'talking to', 'seeing someone', 'dating someone',
    'my ex', 'another date', 'other dates'
  ];
  
  return competitionKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Build system prompt for message evaluation
 */
function buildEvaluationSystemPrompt(
  context: ConversationContext,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const basePrompt = loadEvaluationPrompt();
  
  const momentum = calculateConversationMomentum(conversationHistory, context.currentMeter);
  
  const moodContext = momentum === 'negative'
    ? "MOOD: The conversation has been declining. The girl is getting annoyed and has LESS patience for mistakes. Be stricter in evaluation."
    : momentum === 'positive'
    ? "MOOD: The conversation has been going well. The girl is in a good mood and slightly MORE forgiving of minor missteps."
    : "MOOD: The conversation has been steady. Maintain standard evaluation.";

  const contextInfo = `
## Current Conversation Context:
- **Girl's Name:** ${context.girlName}
- **Girl's Persona:** ${context.girlPersona || 'playful, confident, witty'}
- **Current Success Meter:** ${context.currentMeter}%
- **Message Count:** ${context.messageCount} (${
    context.messageCount <= 3 ? 'early' : context.messageCount <= 10 ? 'mid' : 'late'
  } conversation)
- **Meter Status:** ${
    context.currentMeter < 30
      ? 'Low - user needs to recover'
      : context.currentMeter > 70
      ? 'High - maintain standards'
      : 'Medium - standard evaluation'
  }
- **${moodContext}**

${context.girlDescription ? `## Girl's Appearance Context:\n${context.girlDescription}\n` : ''}

Now evaluate the user's message considering all the above context.
`;

  return basePrompt + '\n\n' + contextInfo;
}

/**
 * Define JSON schema for structured output using OpenAI's response_format
 */
const evaluationSchema = {
  type: 'object',
  properties: {
    delta: {
      type: 'integer',
      description: 'Success meter change from -8 to +8',
      minimum: -8,
      maximum: 8,
    },
    category: {
      type: 'string',
      enum: ['excellent', 'good', 'neutral', 'poor', 'bad'],
      description: 'Quality category of the message',
    },
    reasoning: {
      type: 'string',
      description: 'Brief explanation (20-50 words) for the evaluation',
      minLength: 10,
      maxLength: 200,
    },
  },
  required: ['delta', 'category', 'reasoning'],
  additionalProperties: false,
};

/**
 * Analyze message quality and calculate success delta
 * Core function for evaluating user messages independently of response generation
 */
export async function analyzeMessageQuality(
  params: MessageAnalysisParams
): Promise<MessageAnalysisResult> {
  const openai = getOpenAIClient();

  // Check for competition mention
  const mentionsCompetition = detectCompetitionMention(params.userMessage);
  
  // Build system prompt with jealousy context if needed
  let systemPrompt = buildEvaluationSystemPrompt(params.context, params.conversationHistory);
  
  if (mentionsCompetition) {
    systemPrompt += `\n\nIMPORTANT: The user just mentioned other girls/matches. This is generally a turn-off for most women on dating apps. Penalize this moderately (-3 to -5) unless it's a thoughtful breakup story or very high meter (70+) where it might be acceptable.`;
  }

  // Prepare conversation history (last 10 messages for context)
  const recentHistory = params.conversationHistory.slice(-10);

  // Build the evaluation request
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...recentHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user',
      content: `Evaluate this message: "${params.userMessage}"`,
    },
  ];

  try {
    // Call GPT-4 with JSON mode for structured output
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7, // Consistent but not robotic evaluation
      max_tokens: 200, // Sufficient for analysis only
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse the JSON response
    const result = JSON.parse(content) as MessageAnalysisResult;

    // Validate and sanitize the result
    const validatedResult = validateAnalysisResult(result);

    // Log the analysis for debugging
    console.log(`📊 Message Analysis:`, {
      delta: validatedResult.delta,
      category: validatedResult.category,
      messagePreview: params.userMessage.substring(0, 50),
      reasoning: validatedResult.reasoning.substring(0, 80),
    });

    return validatedResult;
  } catch (error: any) {
    console.error('Error analyzing message quality:', error);

    // If JSON parsing fails, try to extract useful info
    if (error instanceof SyntaxError) {
      console.error('Failed to parse OpenAI response as JSON');
    }

    // Fallback to neutral evaluation on error
    console.warn('Using fallback neutral evaluation due to error');
    return {
      delta: 0,
      category: 'neutral',
      reasoning: 'Unable to evaluate message quality due to technical error',
    };
  }
}

/**
 * Validate and sanitize analysis result
 * Ensures all values are within acceptable ranges
 */
export function validateAnalysisResult(
  result: Partial<MessageAnalysisResult>
): MessageAnalysisResult {
  // Validate and clamp delta
  let delta = result.delta ?? 0;
  if (typeof delta !== 'number' || isNaN(delta)) {
    console.warn('Invalid delta type, defaulting to 0:', delta);
    delta = 0;
  }
  delta = Math.max(-8, Math.min(8, Math.round(delta)));

  // Validate category
  const validCategories: MessageCategory[] = [
    'excellent',
    'good',
    'neutral',
    'poor',
    'bad',
  ];
  let category: MessageCategory = result.category || 'neutral';
  if (!validCategories.includes(category)) {
    console.warn('Invalid category, using fallback:', category);
    category = getCategoryFromDelta(delta);
  }

  // Validate reasoning
  let reasoning = result.reasoning || 'No reasoning provided';
  if (typeof reasoning !== 'string') {
    reasoning = String(reasoning);
  }
  reasoning = reasoning.trim();
  if (reasoning.length < 10) {
    reasoning = 'Message evaluation completed';
  }
  if (reasoning.length > 200) {
    reasoning = reasoning.substring(0, 197) + '...';
  }

  return {
    delta,
    category,
    reasoning,
  };
}

/**
 * Map success delta to message category
 * Fallback function when AI doesn't provide category
 */
export function getCategoryFromDelta(delta: number): MessageCategory {
  if (delta >= 6) return 'excellent';
  if (delta >= 3) return 'good';
  if (delta >= -2) return 'neutral';
  if (delta >= -5) return 'poor';
  return 'bad';
}

/**
 * Calculate new success meter value after applying delta
 * Ensures meter stays within 0-100 bounds
 */
export function calculateNewMeter(currentMeter: number, delta: number): number {
  const newMeter = currentMeter + delta;
  return Math.max(0, Math.min(100, newMeter));
}

/**
 * Determine game status based on meter value
 * Returns whether the game should continue, end in victory, or defeat
 */
export function determineGameStatus(
  meter: number
): 'active' | 'won' | 'lost' {
  if (meter >= 100) return 'won';
  if (meter <= 5) return 'lost';
  return 'active';
}

/**
 * Validate user message before analysis
 * Returns error message if invalid, null if valid
 */
export function validateUserMessage(message: string): string | null {
  if (!message || typeof message !== 'string') {
    return 'Message must be a non-empty string';
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return 'Message cannot be empty';
  }

  if (trimmed.length > 500) {
    return 'Message too long (max 500 characters)';
  }

  // Check for gibberish (very basic check)
  // More sophisticated checks should be in content moderation
  const alphanumericCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
  const ratio = alphanumericCount / trimmed.length;

  if (ratio < 0.3 && trimmed.length > 10) {
    return 'Message appears to be gibberish';
  }

  return null; // Valid
}

/**
 * Batch analyze multiple messages (useful for testing or analytics)
 * Analyzes messages in sequence with shared context
 */
export async function batchAnalyzeMessages(
  messages: string[],
  context: ConversationContext
): Promise<MessageAnalysisResult[]> {
  const results: MessageAnalysisResult[] = [];
  const conversationHistory: Array<{ role: string; content: string }> = [];

  for (const message of messages) {
    const result = await analyzeMessageQuality({
      userMessage: message,
      conversationHistory,
      context: {
        ...context,
        messageCount: conversationHistory.length / 2,
        currentMeter: calculateNewMeter(
          context.currentMeter,
          results.reduce((sum, r) => sum + r.delta, 0)
        ),
      },
    });

    results.push(result);

    // Add to history for next evaluation
    conversationHistory.push(
      { role: 'user', content: message },
      {
        role: 'assistant',
        content: '[Response would be generated here]',
      }
    );
  }

  return results;
}

