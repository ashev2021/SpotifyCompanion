import { useState, useEffect } from "react";
import { Mic, MicOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationPanel } from "@/components/conversation-panel";
import { EnhancedMusicPlayer } from "@/components/enhanced-music-player";
import { MoodAnalysis } from "@/components/mood-analysis";
import { VoiceCommands } from "@/components/voice-commands";
import { BiometricSync } from "@/components/biometric-sync";
import { VoiceWaveVisualizer } from "@/components/voice-wave-visualizer";
import { MicrophonePermission } from "@/components/microphone-permission";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

export default function MusicAgent() {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [currentMood, setCurrentMood] = useState("energetic");
  const [energyLevel, setEnergyLevel] = useState(85);
  const [microphonePermissionGranted, setMicrophonePermissionGranted] = useState(false);

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: (result) => {
      console.log("Voice input:", result.transcript);
    }
  });

  useEffect(() => {
    setIsVoiceActive(isListening);
  }, [isListening]);

  const toggleVoiceListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-spotify-black text-white">
      {/* Header */}
      <header className="bg-spotify-gray/50 backdrop-blur-md border-b border-spotify-gray/30 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
                <i className="fab fa-spotify text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold">Spotify AI Agent</h1>
                <p className="text-spotify-light text-sm">Voice-Powered Music Discovery</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-spotify-gray/50 px-4 py-2 rounded-full">
                <div className={`w-3 h-3 rounded-full ${
                  isVoiceActive ? 'bg-voice-listening animate-pulse' : 'bg-spotify-light/50'
                }`}></div>
                <span className="text-sm font-medium">
                  {isVoiceActive ? 'Voice Active' : 'Voice Ready'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32&q=80" 
                  alt="User profile" 
                  className="w-8 h-8 rounded-full border-2 border-spotify-green" 
                />
                <span className="text-sm font-medium">Alex</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!microphonePermissionGranted ? (
            <MicrophonePermission 
              onPermissionGranted={() => setMicrophonePermissionGranted(true)}
            />
          ) : (
            <ConversationPanel />
          )}
          <MoodAnalysis currentMood={currentMood} energyLevel={energyLevel} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <EnhancedMusicPlayer />
          <VoiceCommands />
          <BiometricSync />
        </div>
      </main>

      {/* Footer Player */}
      <footer className="bg-spotify-gray/50 backdrop-blur-md border-t border-spotify-gray/30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80" 
              alt="Current track thumbnail" 
              className="w-12 h-12 rounded-lg" 
            />
            <div>
              <p className="text-sm font-medium">Thunder</p>
              <p className="text-xs text-spotify-light">Imagine Dragons</p>
            </div>
            <Button size="sm" variant="ghost" className="w-6 h-6 p-0">
              <i className="far fa-heart text-sm"></i>
            </Button>
          </div>
          
          <VoiceWaveVisualizer isActive={isVoiceActive} />
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-volume-up text-spotify-light text-sm"></i>
              <div className="w-20 bg-spotify-gray/50 rounded-full h-1">
                <div className="bg-spotify-green h-1 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>
            <Button
              onClick={toggleVoiceListening}
              className={`w-8 h-8 ${
                isListening 
                  ? 'bg-voice-listening hover:bg-voice-listening/80' 
                  : 'bg-spotify-green hover:bg-spotify-green/80'
              } rounded-full p-0`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
