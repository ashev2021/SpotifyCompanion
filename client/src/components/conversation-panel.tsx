import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Play, Mic, Keyboard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { VoiceOverlay } from "./voice-overlay";
import { VoiceWaveVisualizer } from "./voice-wave-visualizer";
import { apiRequest } from "@/lib/queryClient";
import type { ConversationResponse, MusicRecommendation } from "@/lib/openai";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  recommendations?: MusicRecommendation[];
}

export function ConversationPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm your AI music agent. I can help you discover music based on your mood, activity, or any vibe you're looking for. What kind of music are you in the mood for today?",
      timestamp: new Date(),
    }
  ]);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const queryClient = useQueryClient();

  const { speak, isSpeaking } = useSpeechSynthesis({
    onEnd: () => console.log("Speech ended")
  });

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: (result) => {
      setCurrentTranscript(result.transcript);
      if (result.isFinal) {
        handleVoiceMessage(result.transcript);
      }
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      setShowVoiceOverlay(false);
    }
  });

  const conversationMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/conversation", {
        message,
        userId: 1
      });
      return response.json() as Promise<ConversationResponse>;
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: data.conversation.response,
        timestamp: new Date(),
        recommendations: data.recommendations
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the AI response
      speak(data.conversation.response, { rate: 0.9, pitch: 1.1 });
    },
    onError: (error) => {
      console.error("Conversation error:", error);
    }
  });

  const handleVoiceMessage = (transcript: string) => {
    if (transcript.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: transcript,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      conversationMutation.mutate(transcript);
    }
    setShowVoiceOverlay(false);
    setCurrentTranscript("");
    stopListening();
  };

  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
      setShowVoiceOverlay(false);
    } else {
      setShowVoiceOverlay(true);
      startListening();
    }
  };

  return (
    <div className="bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">AI Music Agent</h2>
        <div className="flex items-center space-x-2">
          <VoiceWaveVisualizer isActive={isListening || isSpeaking} barCount={3} />
          <span className="text-sm text-spotify-light">
            {isListening ? "Listening" : isSpeaking ? "Speaking" : "Ready"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start space-x-3 ${
                message.type === "user" ? "justify-end" : ""
              }`}
            >
              {message.type === "ai" && (
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${
                message.type === "ai" 
                  ? "bg-spotify-gray/50 rounded-2xl rounded-tl-sm" 
                  : "bg-spotify-green/20 rounded-2xl rounded-tr-sm"
              } p-4`}>
                <p className="text-sm text-white">{message.content}</p>
                
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 bg-spotify-gray/30 rounded-lg p-3"
                      >
                        <div className="w-12 h-12 bg-spotify-green/20 rounded-lg flex items-center justify-center">
                          <Play className="w-5 h-5 text-spotify-green" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-white">{rec.trackName}</p>
                          <p className="text-xs text-spotify-light">{rec.artist}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="w-8 h-8 bg-spotify-green hover:bg-spotify-green/80 rounded-full p-0"
                            onClick={() => {
                              if (rec.metadata?.external_url) {
                                window.open(rec.metadata.external_url, '_blank');
                                speak(`Opening "${rec.trackName}" by ${rec.artist} in Spotify`);
                              } else {
                                console.log(`Playing: ${rec.trackName} by ${rec.artist}`);
                                speak(`Playing "${rec.trackName}" by ${rec.artist}`);
                              }
                            }}
                            title="Open in Spotify"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                          {rec.metadata?.preview_url && (
                            <span className="text-xs text-spotify-light">Preview available</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {message.type === "user" && (
                <div className="w-8 h-8 bg-voice-active rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {conversationMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-spotify-gray/50 rounded-2xl rounded-tl-sm p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-spotify-green rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-spotify-green rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-spotify-green rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Button
          onClick={handleVoiceButtonClick}
          disabled={conversationMutation.isPending}
          className={`flex-1 ${
            isListening 
              ? "bg-voice-listening hover:bg-voice-listening/80" 
              : "bg-spotify-green hover:bg-spotify-green/80"
          } text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center justify-center space-x-2`}
        >
          <Mic className="w-4 h-4" />
          <span>{isListening ? "Listening..." : "Hold to Speak"}</span>
        </Button>
        
        <Button
          size="lg"
          className="w-12 h-12 bg-spotify-gray/50 hover:bg-spotify-gray/70 rounded-full p-0"
        >
          <Keyboard className="w-4 h-4 text-spotify-light" />
        </Button>
      </div>

      <VoiceOverlay
        isVisible={showVoiceOverlay}
        isListening={isListening}
        transcript={currentTranscript}
        onClose={() => {
          setShowVoiceOverlay(false);
          stopListening();
        }}
      />
    </div>
  );
}
