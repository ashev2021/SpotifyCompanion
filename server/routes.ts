import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertConversationSchema, insertMusicRecommendationSchema, insertVoiceCommandSchema, insertBiometricDataSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Voice conversation endpoint
  app.post("/api/conversation", async (req, res) => {
    try {
      const { message, userId = 1 } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Analyze mood and intent from the message
      const moodAnalysis = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a music mood analyzer. Analyze the user's message and determine their mood, energy level, and music preferences. Respond with JSON in this format: { 'mood': string, 'energy': number (1-10), 'intent': string, 'recommendations': array of {trackName: string, artist: string, mood: string, energy: number} }"
          },
          {
            role: "user",
            content: message
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(moodAnalysis.choices[0].message.content || "{}");

      // Generate conversational response
      const conversationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a friendly AI music agent. Respond conversationally to the user's music request. Be enthusiastic and provide context about your recommendations. Keep responses concise but engaging."
          },
          {
            role: "user",
            content: `User said: "${message}". Their mood is ${analysis.mood} with energy level ${analysis.energy}. Provide a conversational response about the music recommendations.`
          }
        ]
      });

      const response = conversationResponse.choices[0].message.content || "";

      // Save conversation
      const conversation = await storage.createConversation({
        userId,
        message,
        response,
        mood: analysis.mood
      });

      // Save music recommendations
      const recommendations = [];
      if (analysis.recommendations && Array.isArray(analysis.recommendations)) {
        for (const rec of analysis.recommendations) {
          const recommendation = await storage.createMusicRecommendation({
            conversationId: conversation.id,
            trackName: rec.trackName,
            artist: rec.artist,
            mood: rec.mood,
            energy: rec.energy,
            metadata: rec
          });
          recommendations.push(recommendation);
        }
      }

      res.json({
        conversation,
        recommendations,
        analysis: {
          mood: analysis.mood,
          energy: analysis.energy,
          intent: analysis.intent
        }
      });
    } catch (error) {
      console.error("Conversation error:", error);
      res.status(500).json({ error: "Failed to process conversation" });
    }
  });

  // Get conversation history
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Voice command processing
  app.post("/api/voice-command", async (req, res) => {
    try {
      const { command, userId = 1 } = req.body;
      
      if (!command) {
        return res.status(400).json({ error: "Command is required" });
      }

      // Analyze voice command intent
      const intentAnalysis = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a voice command interpreter for a music app. Analyze the command and determine the intent. Respond with JSON in this format: { 'intent': string, 'confidence': number (0-100), 'action': string, 'parameters': object }"
          },
          {
            role: "user",
            content: command
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(intentAnalysis.choices[0].message.content || "{}");

      // Save voice command
      const voiceCommand = await storage.createVoiceCommand({
        userId,
        command,
        intent: analysis.intent,
        confidence: analysis.confidence
      });

      res.json({
        voiceCommand,
        analysis
      });
    } catch (error) {
      console.error("Voice command error:", error);
      res.status(500).json({ error: "Failed to process voice command" });
    }
  });

  // Biometric data endpoint
  app.post("/api/biometric", async (req, res) => {
    try {
      const data = insertBiometricDataSchema.parse(req.body);
      const biometricData = await storage.createBiometricData(data);
      res.json(biometricData);
    } catch (error) {
      console.error("Biometric data error:", error);
      res.status(500).json({ error: "Failed to save biometric data" });
    }
  });

  // Get latest biometric data
  app.get("/api/biometric/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const data = await storage.getLatestBiometricData(userId);
      res.json(data);
    } catch (error) {
      console.error("Get biometric data error:", error);
      res.status(500).json({ error: "Failed to fetch biometric data" });
    }
  });

  // Music recommendations by conversation
  app.get("/api/recommendations/:conversationId", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const recommendations = await storage.getRecommendationsByConversation(conversationId);
      res.json(recommendations);
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
