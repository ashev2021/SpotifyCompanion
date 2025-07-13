import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Music, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { apiRequest } from "@/lib/queryClient";
import type { ConversationResponse } from "@/lib/openai";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  albumArt?: string;
  duration: number;
  mood?: string;
  energy?: number;
}

interface EnhancedMusicPlayerProps {
  className?: string;
}

// Enhanced sample tracks with different moods and energy levels
const sampleTracks: Track[] = [
  {
    id: "1",
    title: "Energetic Workout",
    artist: "AI Beat Generator",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    duration: 180,
    mood: "energetic",
    energy: 95
  },
  {
    id: "2",
    title: "Calm Morning",
    artist: "Ambient AI",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    duration: 240,
    mood: "calm",
    energy: 30
  },
  {
    id: "3",
    title: "Melancholic Thoughts",
    artist: "Deep Mind",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    duration: 200,
    mood: "melancholic",
    energy: 45
  },
  {
    id: "4",
    title: "Focus Flow",
    artist: "Productivity Sounds",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
    duration: 300,
    mood: "focused",
    energy: 65
  }
];

export function EnhancedMusicPlayer({ className = "" }: EnhancedMusicPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>(sampleTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [currentMood, setCurrentMood] = useState<string>("energetic");
  
  const queryClient = useQueryClient();
  
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

  const { speak } = useSpeechSynthesis();

  const currentTrackData = tracks[currentTrackIndex];

  // AI Music Recommendation Mutation
  const recommendationMutation = useMutation({
    mutationFn: async (mood: string) => {
      const response = await apiRequest("POST", "/api/conversation", {
        message: `I'm feeling ${mood}. Can you recommend some music that matches this mood?`,
        userId: 1
      });
      return response.json() as Promise<ConversationResponse>;
    },
    onSuccess: (data) => {
      // Convert AI recommendations to tracks
      const newTracks = data.recommendations.map((rec, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: rec.trackName,
        artist: rec.artist,
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Placeholder audio
        albumArt: `https://images.unsplash.com/photo-${1571019613454 + index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300`,
        duration: 180 + Math.floor(Math.random() * 120),
        mood: rec.mood,
        energy: rec.energy
      }));
      
      // Add new tracks to playlist
      setTracks(prev => [...prev, ...newTracks]);
      
      // Speak about the recommendations
      speak(`I found ${newTracks.length} songs that match your ${currentMood} mood. Adding them to your playlist now.`);
    },
    onError: (error) => {
      console.error("Failed to get AI recommendations:", error);
    }
  });

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
      return;
    }
    
    if (isShuffleOn) {
      setCurrentTrackIndex(Math.floor(Math.random() * tracks.length));
    } else {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      if (repeatMode === 'off' && nextIndex === 0) {
        pause();
        return;
      }
      setCurrentTrackIndex(nextIndex);
    }
  };

  const handlePlayTrack = (trackData: Track, index?: number) => {
    if (index !== undefined) {
      setCurrentTrackIndex(index);
    }
    
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

  const handleLikeTrack = (trackId: string) => {
    setLikedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const handleRequestRecommendations = (mood: string) => {
    setCurrentMood(mood);
    recommendationMutation.mutate(mood);
  };

  const progress = duration > 0 ? (currentTime / (currentTrackData?.duration || duration)) * 100 : 0;
  const trackProgress = currentTrackData?.duration > 0 ? (currentTime / currentTrackData.duration) * 100 : 0;

  const moodColors = {
    energetic: "from-red-500 to-orange-500",
    calm: "from-teal-500 to-green-500", 
    melancholic: "from-purple-500 to-indigo-500",
    focused: "from-blue-500 to-cyan-500"
  };

  return (
    <div className={`bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">AI Music Player</h3>
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

      {/* Now Playing */}
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
            className="w-40 h-40 rounded-2xl mx-auto shadow-lg object-cover"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"
            animate={{ opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.3 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
          />
          
          {/* Mood indicator */}
          {currentTrackData?.mood && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${moodColors[currentTrackData.mood as keyof typeof moodColors] || 'from-gray-500 to-gray-600'}`}>
              {currentTrackData.mood}
            </div>
          )}
        </motion.div>
        
        <div className="flex items-center justify-center space-x-2 mb-2">
          <h4 className="font-semibold text-lg text-white">{currentTrackData?.title}</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleLikeTrack(currentTrackData?.id || '')}
            className="w-6 h-6 p-0"
          >
            <Heart className={`w-4 h-4 ${likedTracks.has(currentTrackData?.id || '') ? 'text-red-500 fill-current' : 'text-spotify-light'}`} />
          </Button>
        </div>
        <p className="text-spotify-light text-sm mb-4">{currentTrackData?.artist}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-spotify-light mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrackData?.duration || 0)}</span>
          </div>
          <Slider
            value={[trackProgress]}
            onValueChange={(value) => handleSeek([value[0] * (currentTrackData?.duration || 100) / 100])}
            max={100}
            step={0.1}
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

        <div className="flex items-center justify-center space-x-3 mb-6">
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

      {/* AI Mood Recommendations */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">AI Recommendations</h4>
          {recommendationMutation.isPending && (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-spotify-green rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-spotify-green rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-spotify-green rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['energetic', 'calm', 'melancholic', 'focused'].map((mood) => (
            <Button
              key={mood}
              onClick={() => handleRequestRecommendations(mood)}
              disabled={recommendationMutation.isPending}
              size="sm"
              className={`h-8 text-xs bg-gradient-to-r ${moodColors[mood as keyof typeof moodColors]} hover:scale-105 transition-transform`}
            >
              <Plus className="w-3 h-3 mr-1" />
              {mood}
            </Button>
          ))}
        </div>
      </div>

      {/* Playlist */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white mb-3">Playlist ({tracks.length} tracks)</h4>
        <div className="max-h-60 overflow-y-auto space-y-2">
          <AnimatePresence>
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentTrackIndex 
                    ? 'bg-spotify-green/20 border border-spotify-green/30' 
                    : 'bg-spotify-gray/20 hover:bg-spotify-gray/40'
                }`}
                onClick={() => handlePlayTrack(track, index)}
              >
                <div className="w-10 h-10 bg-spotify-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  {index === currentTrackIndex && isPlaying ? (
                    <Pause className="w-4 h-4 text-spotify-green" />
                  ) : (
                    <Play className="w-4 h-4 text-spotify-green" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white truncate">{track.title}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-spotify-light truncate">{track.artist}</p>
                    {track.mood && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r ${moodColors[track.mood as keyof typeof moodColors]} text-white font-medium`}>
                        {track.mood}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeTrack(track.id);
                    }}
                    className="w-6 h-6 p-0"
                  >
                    <Heart className={`w-3 h-3 ${likedTracks.has(track.id) ? 'text-red-500 fill-current' : 'text-spotify-light'}`} />
                  </Button>
                  <span className="text-xs text-spotify-light">{formatTime(track.duration)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}