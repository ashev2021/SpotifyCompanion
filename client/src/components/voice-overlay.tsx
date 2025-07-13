import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { VoiceWaveVisualizer } from "./voice-wave-visualizer";

interface VoiceOverlayProps {
  isVisible: boolean;
  isListening: boolean;
  transcript?: string;
  onClose: () => void;
}

export function VoiceOverlay({ 
  isVisible, 
  isListening, 
  transcript = "", 
  onClose 
}: VoiceOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-spotify-gray/90 backdrop-blur-md border border-spotify-gray/30 rounded-3xl p-8 max-w-md mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isListening ? [1, 1.2, 1] : 1,
                    boxShadow: isListening 
                      ? ['0 0 20px rgba(0, 230, 118, 0.3)', '0 0 40px rgba(0, 230, 118, 0.6)', '0 0 20px rgba(0, 230, 118, 0.3)']
                      : '0 0 20px rgba(0, 230, 118, 0.3)'
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: isListening ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="w-24 h-24 bg-voice-listening rounded-full flex items-center justify-center"
                >
                  {isListening ? (
                    <Mic className="w-8 h-8 text-white" />
                  ) : (
                    <MicOff className="w-8 h-8 text-white" />
                  )}
                </motion.div>
                {isListening && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 w-24 h-24 border-4 border-voice-listening rounded-full"
                  />
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2 text-white">
              {isListening ? "Listening..." : "Voice Ready"}
            </h3>
            
            <p className="text-spotify-light text-sm mb-4">
              {isListening 
                ? "Speak naturally about your music preferences" 
                : "Click the microphone to start voice interaction"
              }
            </p>
            
            {transcript && (
              <div className="bg-spotify-gray/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-white">{transcript}</p>
              </div>
            )}
            
            <VoiceWaveVisualizer isActive={isListening} className="mb-4" />
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-spotify-gray/50 hover:bg-spotify-gray/70 rounded-full text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
