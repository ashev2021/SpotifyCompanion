import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio-player";

interface NowPlayingProps {
  track?: {
    title: string;
    artist: string;
    albumArt?: string;
    duration: number;
  };
}

export function NowPlaying({ 
  track = {
    title: "Thunder",
    artist: "Imagine Dragons",
    albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
    duration: 187
  }
}: NowPlayingProps) {
  const { isPlaying, currentTime, duration, togglePlay } = useAudioPlayer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 50;

  return (
    <div className="bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20">
      <h3 className="text-lg font-semibold mb-4 text-white">Now Playing</h3>
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: isPlaying ? [1, 1.02, 1] : 1,
            rotate: isPlaying ? [0, 0.5, 0] : 0
          }}
          transition={{ 
            duration: 2, 
            repeat: isPlaying ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="relative mb-4"
        >
          <img 
            src={track.albumArt} 
            alt={`${track.title} album artwork`}
            className="w-48 h-48 rounded-2xl mx-auto shadow-lg"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"
            animate={{ opacity: isPlaying ? [0.2, 0.4, 0.2] : 0.2 }}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
          />
        </motion.div>
        
        <h4 className="font-semibold text-lg mb-1 text-white">{track.title}</h4>
        <p className="text-spotify-light text-sm mb-4">{track.artist}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-spotify-light mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(track.duration)}</span>
          </div>
          <div className="w-full bg-spotify-gray/50 rounded-full h-1 relative">
            <motion.div 
              className="bg-spotify-green h-1 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Button
            size="lg"
            className="w-10 h-10 bg-spotify-gray/50 hover:bg-spotify-gray/70 rounded-full p-0"
          >
            <SkipBack className="w-4 h-4 text-white" />
          </Button>
          
          <Button
            onClick={togglePlay}
            size="lg"
            className="w-12 h-12 bg-spotify-green hover:bg-spotify-green/80 rounded-full p-0"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </Button>
          
          <Button
            size="lg"
            className="w-10 h-10 bg-spotify-gray/50 hover:bg-spotify-gray/70 rounded-full p-0"
          >
            <SkipForward className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
