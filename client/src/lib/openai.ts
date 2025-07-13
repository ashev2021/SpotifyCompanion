// Client-side OpenAI utilities for voice processing
export interface MoodAnalysis {
  mood: string;
  energy: number;
  intent: string;
}

export interface MusicRecommendation {
  trackName: string;
  artist: string;
  mood: string;
  energy: number;
}

export interface ConversationResponse {
  conversation: {
    id: number;
    message: string;
    response: string;
    mood: string;
    timestamp: Date;
  };
  recommendations: MusicRecommendation[];
  analysis: MoodAnalysis;
}

export interface VoiceCommandResponse {
  voiceCommand: {
    id: number;
    command: string;
    intent: string;
    confidence: number;
  };
  analysis: {
    intent: string;
    confidence: number;
    action: string;
    parameters: Record<string, any>;
  };
}
