import { 
  users, 
  conversations, 
  musicRecommendations, 
  voiceCommands, 
  biometricData,
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type MusicRecommendation,
  type InsertMusicRecommendation,
  type VoiceCommand,
  type InsertVoiceCommand,
  type BiometricData,
  type InsertBiometricData
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversations(userId: number): Promise<Conversation[]>;
  
  createMusicRecommendation(recommendation: InsertMusicRecommendation): Promise<MusicRecommendation>;
  getRecommendationsByConversation(conversationId: number): Promise<MusicRecommendation[]>;
  
  createVoiceCommand(command: InsertVoiceCommand): Promise<VoiceCommand>;
  getVoiceCommands(userId: number): Promise<VoiceCommand[]>;
  
  createBiometricData(data: InsertBiometricData): Promise<BiometricData>;
  getLatestBiometricData(userId: number): Promise<BiometricData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private musicRecommendations: Map<number, MusicRecommendation>;
  private voiceCommands: Map<number, VoiceCommand>;
  private biometricData: Map<number, BiometricData>;
  
  private currentUserId: number = 1;
  private currentConversationId: number = 1;
  private currentRecommendationId: number = 1;
  private currentCommandId: number = 1;
  private currentBiometricId: number = 1;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.musicRecommendations = new Map();
    this.voiceCommands = new Map();
    this.biometricData = new Map();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      id,
      userId: insertConversation.userId ?? null,
      message: insertConversation.message,
      response: insertConversation.response,
      mood: insertConversation.mood ?? null,
      timestamp: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversations(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId,
    );
  }

  async createMusicRecommendation(insertRecommendation: InsertMusicRecommendation): Promise<MusicRecommendation> {
    const id = this.currentRecommendationId++;
    const recommendation: MusicRecommendation = {
      id,
      conversationId: insertRecommendation.conversationId ?? null,
      trackName: insertRecommendation.trackName,
      artist: insertRecommendation.artist,
      mood: insertRecommendation.mood ?? null,
      energy: insertRecommendation.energy ?? null,
      metadata: insertRecommendation.metadata ?? null,
    };
    this.musicRecommendations.set(id, recommendation);
    return recommendation;
  }

  async getRecommendationsByConversation(conversationId: number): Promise<MusicRecommendation[]> {
    return Array.from(this.musicRecommendations.values()).filter(
      (recommendation) => recommendation.conversationId === conversationId,
    );
  }

  async createVoiceCommand(insertCommand: InsertVoiceCommand): Promise<VoiceCommand> {
    const id = this.currentCommandId++;
    const command: VoiceCommand = {
      id,
      userId: insertCommand.userId ?? null,
      command: insertCommand.command,
      intent: insertCommand.intent,
      confidence: insertCommand.confidence ?? null,
      timestamp: new Date(),
    };
    this.voiceCommands.set(id, command);
    return command;
  }

  async getVoiceCommands(userId: number): Promise<VoiceCommand[]> {
    return Array.from(this.voiceCommands.values()).filter(
      (command) => command.userId === userId,
    );
  }

  async createBiometricData(insertData: InsertBiometricData): Promise<BiometricData> {
    const id = this.currentBiometricId++;
    const data: BiometricData = {
      id,
      userId: insertData.userId ?? null,
      heartRate: insertData.heartRate ?? null,
      emotionScore: insertData.emotionScore ?? null,
      timestamp: new Date(),
    };
    this.biometricData.set(id, data);
    return data;
  }

  async getLatestBiometricData(userId: number): Promise<BiometricData | undefined> {
    const userBiometrics = Array.from(this.biometricData.values())
      .filter((data) => data.userId === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    
    return userBiometrics[0];
  }
}

export const storage = new MemStorage();
