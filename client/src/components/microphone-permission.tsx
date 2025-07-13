import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MicrophonePermissionProps {
  onPermissionGranted: () => void;
  className?: string;
}

export function MicrophonePermission({ onPermissionGranted, className = "" }: MicrophonePermissionProps) {
  const [permissionState, setPermissionState] = useState<'pending' | 'requesting' | 'granted' | 'denied'>('pending');

  const requestPermission = async () => {
    setPermissionState('requesting');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately since we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState('granted');
      onPermissionGranted();
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionState('denied');
    }
  };

  if (permissionState === 'granted') {
    return null; // Hide component once permission is granted
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20 ${className}`}
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            permissionState === 'denied' 
              ? 'bg-red-500/20' 
              : permissionState === 'requesting'
              ? 'bg-yellow-500/20'
              : 'bg-spotify-green/20'
          }`}>
            {permissionState === 'denied' ? (
              <MicOff className="w-8 h-8 text-red-500" />
            ) : permissionState === 'requesting' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Mic className="w-8 h-8 text-yellow-500" />
              </motion.div>
            ) : (
              <Mic className="w-8 h-8 text-spotify-green" />
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">
          {permissionState === 'denied' 
            ? 'Microphone Access Denied'
            : permissionState === 'requesting'
            ? 'Requesting Permission...'
            : 'Enable Voice Features'
          }
        </h3>

        <p className="text-spotify-light text-sm mb-6">
          {permissionState === 'denied' 
            ? 'Voice features are disabled. Please enable microphone access in your browser settings and refresh the page.'
            : permissionState === 'requesting'
            ? 'Please allow microphone access to use voice commands and conversation features.'
            : 'Allow microphone access to use voice commands, speech recognition, and hands-free music control.'
          }
        </p>

        {permissionState === 'denied' ? (
          <div className="flex items-center justify-center space-x-2 text-yellow-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Check browser permissions</span>
          </div>
        ) : permissionState === 'requesting' ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-spotify-green rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-spotify-green rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-spotify-green rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        ) : (
          <Button
            onClick={requestPermission}
            className="bg-spotify-green hover:bg-spotify-green/80 text-white px-6 py-3 rounded-full font-medium"
          >
            <Mic className="w-4 h-4 mr-2" />
            Enable Voice Features
          </Button>
        )}
      </div>
    </motion.div>
  );
}