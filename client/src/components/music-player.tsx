import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/use-audio-player";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  albumArt?: string;
  duration: number;
}

interface MusicPlayerProps {
  tracks?: Track[];
  autoPlay?: boolean;
}

// Sample tracks with actual audio URLs
const defaultTracks: Track[] = [
  {
    id: "1",
    title: "Chill Lofi Beat",
    artist: "Lofi Generator",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    duration: 180
  },
  {
    id: "2", 
    title: "Energetic Beat",
    artist: "AI Music",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    duration: 200
  },
  {
    id: "3",
    title: "Ambient Vibes",
    artist: "Synthesized",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", 
    albumArt: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    duration: 220
  }
];

export function MusicPlayer({ tracks = defaultTracks, autoPlay = false }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    play, 
    pause, 
    togglePlay, 
    seek, 
    setVolume 
  } = useAudioPlayer();

  const currentTrackData = tracks[currentTrackIndex];

  useEffect(() => {
    if (autoPlay && currentTrackData) {
      play({
        id: currentTrackData.id,
        title: currentTrackData.title,
        artist: currentTrackData.artist,
        url: currentTrackData.url,
        duration: currentTrackData.duration
      });
    }
  }, [currentTrackIndex, autoPlay]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrevious = () => {
    if (isShuffleOn) {
      setCurrentTrackIndex(Math.floor(Math.random() * tracks.length));
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
  };

  const handleNext = () => {
    if (repeatMode === 'one') {
      // Stay on the same track
      return;
    }
    
    if (isShuffleOn) {
      setCurrentTrackIndex(Math.floor(Math.random() * tracks.length));
    } else {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      if (repeatMode === 'off' && nextIndex === 0) {
        // Stop at end of playlist
        pause();
        return;
      }
      setCurrentTrackIndex(nextIndex);
    }
  };

  const handlePlayTrack = (trackData: Track) => {
    play({
      id: trackData.id,
      title: trackData.title,
      artist: trackData.artist,
      url: trackData.url,
      duration: trackData.duration
    });
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const progress = duration > 0 ? (currentTime / (currentTrackData?.duration || duration)) * 100 : 0;

  return (
    <div className="bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Music Player</h3>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsShuffleOn(!isShuffleOn)}
            className={`w-8 h-8 p-0 ${isShuffleOn ? 'text-spotify-green' : 'text-spotify-light'}`}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const modes = ['off', 'one', 'all'] as const;
              const currentIndex = modes.indexOf(repeatMode);
              setRepeatMode(modes[(currentIndex + 1) % modes.length]);
            }}
            className={`w-8 h-8 p-0 ${repeatMode !== 'off' ? 'text-spotify-green' : 'text-spotify-light'}`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-spotify-green rounded-full"></span>
            )}
          </Button>
        </div>
      </div>

      <div className="text-center mb-6">
        <motion.div
          animate={{ 
            scale: isPlaying ? [1, 1.02, 1] : 1,
            rotate: isPlaying ? [0, 0.5, 0] : 0
          }}
          transition={{ 
            duration: 3, 
            repeat: isPlaying ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="relative mb-4"
        >
          <img 
            src={currentTrackData?.albumArt} 
            alt={`${currentTrackData?.title} album artwork`}
            className="w-48 h-48 rounded-2xl mx-auto shadow-lg object-cover"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"
            animate={{ opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.3 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
          />
        </motion.div>
        
        <h4 className="font-semibold text-lg mb-1 text-white">{currentTrackData?.title}</h4>
        <p className="text-spotify-light text-sm mb-4">{currentTrackData?.artist}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-spotify-light mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrackData?.duration || 0)}</span>
          </div>
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={currentTrackData?.duration || 100}
            step={1}
            className="w-full mb-2"
          />
        </div>
        
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Button
            onClick={handlePrevious}
            size="lg"
            className="w-10 h-10 bg-spotify-gray/50 hover:bg-spotify-gray/70 rounded-full p-0"
          >
            <SkipBack className="w-4 h-4 text-white" />
          </Button>
          
          <Button
            onClick={() => handlePlayTrack(currentTrackData)}
            size="lg"
            className="w-14 h-14 bg-spotify-green hover:bg-spotify-green/80 rounded-full p-0"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </Button>
          
          <Button
            onClick={handleNext}
            size="lg"
            className="w-10 h-10 bg-spotify-gray/50 hover:bg-spotify-gray/70 rounded-full p-0"
          >
            <SkipForward className="w-4 h-4 text-white" />
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-3">
          <Volume2 className="w-4 h-4 text-spotify-light" />
          <Slider
            value={[volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-24"
          />
        </div>
      </div>

      {/* Playlist */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white mb-3">Up Next</h4>
        {tracks.slice(0, 3).map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              index === currentTrackIndex 
                ? 'bg-spotify-green/20 border border-spotify-green/30' 
                : 'bg-spotify-gray/20 hover:bg-spotify-gray/40'
            }`}
            onClick={() => {
              setCurrentTrackIndex(index);
              handlePlayTrack(track);
            }}
          >
            <div className="w-10 h-10 bg-spotify-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Play className="w-4 h-4 text-spotify-green" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white truncate">{track.title}</p>
              <p className="text-xs text-spotify-light truncate">{track.artist}</p>
            </div>
            <span className="text-xs text-spotify-light">{formatTime(track.duration)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}