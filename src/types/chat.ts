/**
 * Chat-related type definitions for CharmDojo
 */

/**
 * Message category based on quality/success delta
 */
export type MessageCategory = 'excellent' | 'good' | 'neutral' | 'poor' | 'bad';

/**
 * Simplified message type for frontend components (alias for ChatMessage)
 */
export type Message = ChatMessage;

/**
 * Girl profile for chat interface
 */
export interface GirlProfile {
  name: string;
  imageUrl: string;
  description?: string;
  persona?: string;
}

/**
 * Game status after a message exchange
 */
export type GameStatus = 'active' | 'won' | 'lost';

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  role: 'user' | 'assistant';
  status?: 'sending' | 'read' | 'sent';
}

/**
 * Success meter update details
 */
export interface SuccessMeterUpdate {
  previous: number;
  delta: number;
  current: number;
  category: MessageCategory;
}

/**
 * Request body for chat message endpoint
 */
export interface ChatMessageRequest {
  roundId: string;
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
}

/**
 * Response from chat message endpoint
 */
export interface ChatMessageResponse {
  userMessage: ChatMessage;
  aiResponse: ChatMessage | null;
  successMeter: SuccessMeterUpdate;
  gameStatus: GameStatus;
  instantFail?: boolean;
  failReason?: string;
  ghosted?: boolean;
  disengaged?: boolean;
  multipleMessages?: string[];
}

/**
 * Structured output from GPT-4 for chat responses
 */
export interface ChatAIOutput {
  response: string;
  successDelta: number;
  category: MessageCategory;
  reasoning: string;
  disengaged?: boolean;
  multipleMessages?: string[];
}

/**
 * Parameters for generating a chat response
 */
export interface GenerateChatParams {
  roundId: string;
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  girlName: string;
  girlPersona: string;
  currentMeter: number;
  girlDescription?: string;
}

/**
 * Conversation context for AI
 */
export interface ConversationContext {
  girlName: string;
  girlPersona: string;
  currentMeter: number;
  messageCount: number;
  girlDescription?: string;
}

/**
 * Parameters for message quality analysis
 */
export interface MessageAnalysisParams {
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  context: ConversationContext;
}

/**
 * Result from message quality analysis
 */
export interface MessageAnalysisResult {
  delta: number;
  category: MessageCategory;
  reasoning: string;
}
