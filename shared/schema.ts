import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  mood: text("mood"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const musicRecommendations = pgTable("music_recommendations", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  trackName: text("track_name").notNull(),
  artist: text("artist").notNull(),
  mood: text("mood"),
  energy: integer("energy"),
  metadata: jsonb("metadata"),
});

export const voiceCommands = pgTable("voice_commands", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  command: text("command").notNull(),
  intent: text("intent").notNull(),
  confidence: integer("confidence"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const biometricData = pgTable("biometric_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  heartRate: integer("heart_rate"),
  emotionScore: integer("emotion_score"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  timestamp: true,
});

export const insertMusicRecommendationSchema = createInsertSchema(musicRecommendations).omit({
  id: true,
});

export const insertVoiceCommandSchema = createInsertSchema(voiceCommands).omit({
  id: true,
  timestamp: true,
});

export const insertBiometricDataSchema = createInsertSchema(biometricData).omit({
  id: true,
  timestamp: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type MusicRecommendation = typeof musicRecommendations.$inferSelect;
export type VoiceCommand = typeof voiceCommands.$inferSelect;
export type BiometricData = typeof biometricData.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMusicRecommendation = z.infer<typeof insertMusicRecommendationSchema>;
export type InsertVoiceCommand = z.infer<typeof insertVoiceCommandSchema>;
export type InsertBiometricData = z.infer<typeof insertBiometricDataSchema>;
