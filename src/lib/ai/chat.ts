/**
 * AI Chat Service
 * Handles GPT-4 conversation generation with girl persona
 * Success delta calculation is handled by success-meter.ts
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import type {
  ChatAIOutput,
  GenerateChatParams,
  ConversationContext,
  MessageCategory,
} from '@/types/chat';
import { analyzeMessageQuality } from './success-meter';

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
 * Load AI girl instructions prompt template
 */
function loadGirlInstructions(): string {
  const promptPath = path.join(process.cwd(), 'src/prompts/ai_girl_instructions.md');
  return fs.readFileSync(promptPath, 'utf-8');
}

/**
 * Build system prompt with girl persona and instructions
 * Now focused only on response generation, not evaluation
 */
function buildSystemPrompt(
  context: ConversationContext,
  messageDelta: number
): string {
  const instructions = loadGirlInstructions();

  const deltaContext =
    messageDelta >= 5
      ? "The user's last message was excellent - show enthusiasm and warmth"
      : messageDelta >= 2
      ? "The user's last message was good - respond positively"
      : messageDelta >= -1
      ? "The user's last message was okay - maintain conversation"
      : messageDelta >= -4
      ? "The user's last message was poor - be less engaged"
      : "The user's last message was bad - respond coolly or dismissively";

  const systemPrompt = `${instructions}

## Your Character Context:
- **Your Name:** ${context.girlName}
- **Your Persona:** ${context.girlPersona || 'playful, confident, witty'}
- **Current Success Meter:** ${context.currentMeter}%
- **Message Count:** ${context.messageCount}

${context.girlDescription ? `## Your Appearance:\n${context.girlDescription}\n` : ''}

## Message Quality Context:
${deltaContext}

## Important Reminders:
- You are ${context.girlName}, an attractive woman on a dating app
- Respond naturally as ${context.girlName} would, staying true to your ${context.girlPersona} personality
- The success meter is at ${context.currentMeter}% - adjust your enthusiasm accordingly
- If the meter is low (<30%), be less engaged and more dismissive
- If the meter is high (>70%), be warmer, more flirtatious, and show genuine interest
- At 80%+, drop hints about wanting to meet in person
- Never break character or mention you're an AI

## Your Task:
Respond naturally to the user's message as ${context.girlName}. Just provide your response, nothing else.`;

  return systemPrompt;
}

// Function calling schema removed - evaluation now handled by success-meter.ts
// Chat generation is now simpler and focused only on creating responses

/**
 * Generate AI chat response with success delta calculation
 * Now separated: first analyze quality, then generate response
 */
export async function generateChatResponse(
  params: GenerateChatParams
): Promise<ChatAIOutput> {
  const openai = getOpenAIClient();

  const context: ConversationContext = {
    girlName: params.girlName,
    girlPersona: params.girlPersona,
    currentMeter: params.currentMeter,
    messageCount: params.conversationHistory.length / 2, // Rough estimate
    girlDescription: params.girlDescription,
  };

  try {
    // Step 1: Analyze message quality using dedicated success-meter module
    const analysis = await analyzeMessageQuality({
      userMessage: params.userMessage,
      conversationHistory: params.conversationHistory,
      context,
    });

    // Step 2: Generate girl's response based on message quality
    const systemPrompt = buildSystemPrompt(context, analysis.delta);

    // Prepare conversation history (last 10 messages for context)
    const recentHistory = params.conversationHistory.slice(-10);

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
        content: params.userMessage,
      },
    ];

    // Call GPT-4 to generate natural response
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages,
      temperature: 0.8, // Higher for more personality variety
      max_tokens: 200, // Sufficient for a text message response
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error('Empty response from GPT-4');
    }

    // Ensure response isn't too long (trim if needed)
    let finalResponse = aiResponse;
    if (finalResponse.length > 300) {
      console.warn('Response too long, trimming');
      finalResponse = finalResponse.substring(0, 297) + '...';
    }

    // Log the interaction for debugging
    console.log(`🤖 AI Response Generated:`, {
      delta: analysis.delta,
      category: analysis.category,
      responseLength: finalResponse.length,
      reasoning: analysis.reasoning.substring(0, 100),
    });

    // Return combined result
    return {
      response: finalResponse,
      successDelta: analysis.delta,
      category: analysis.category,
      reasoning: analysis.reasoning,
    };
  } catch (error: any) {
    console.error('Error generating chat response:', error);

    // Return a safe fallback response
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
}

// Utility functions moved to success-meter.ts for better organization
// Re-export them here for backward compatibility
export {
  getCategoryFromDelta,
  calculateNewMeter,
  determineGameStatus,
} from './success-meter';

