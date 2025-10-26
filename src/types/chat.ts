export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GirlProfile {
  name: string;
  imageUrl: string;
}

export interface ChatState {
  messages: Message[];
  girl: GirlProfile;
  isLoading: boolean;
}

