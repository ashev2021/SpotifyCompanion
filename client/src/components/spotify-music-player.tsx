import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Music, Heart, Plus, LogIn, LogOut, Loader2, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SpotifySetupGuide } from "@/components/spotify-setup-guide";
import { useSpotifyPlayer } from "@/hooks/use-spotify-player";
import { useSpotifyAuth } from "@/hooks/use-spotify-auth";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { apiRequest } from "@/lib/queryClient";
import type { ConversationResponse } from "@/lib/openai";

interface SpotifyMusicPlayerProps {
  className?: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  uri: string;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export function SpotifyMusicPlayer({ className = "" }: SpotifyMusicPlayerProps) {
  const [playlist, setPlaylist] = useState<SpotifyTrack[]>([]);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [currentMood, setCurrentMood] = useState<string>("energetic");
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  const queryClient = useQueryClient();
  const { speak } = useSpeechSynthesis();

  // Spotify authentication
  const { 
    accessToken, 
    isAuthenticated, 
    isLoading: authLoading, 
    error: authError,
    login,
    logout,
    clearError
  } = useSpotifyAuth();

  // Spotify Web Playback SDK
  const {
    deviceId,
    playerState,
    isReady,
    isActive,
    isPaused,
    currentTrack,
    position,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    playTrack,
    playTracks
  } = useSpotifyPlayer({
    token: accessToken || '',
    onReady: (deviceId) => {
      console.log('Spotify player ready with device:', deviceId);
      speak("Spotify player connected! You can now play real music.");
    },
    onError: (error) => {
      console.error('Spotify player error:', error);
    },
    onPlayerStateChanged: (state) => {
      if (state?.track_window?.current_track) {
        // Update playlist from current Spotify state if needed
      }
    }
  });

  // AI Music Recommendation Mutation
  const recommendationMutation = useMutation({
    mutationFn: async (mood: string) => {
      const response = await apiRequest("POST", "/api/conversation", {
        message: `I'm feeling ${mood}. Can you find some great ${mood} songs on Spotify that match this mood?`,
        userId: 1
      });
      return response.json() as Promise<ConversationResponse>;
    },
    onSuccess: (data) => {
      // Extract Spotify tracks from recommendations
      const spotifyTracks: SpotifyTrack[] = data.recommendations
        .filter(rec => rec.metadata?.spotify_id)
        .map(rec => ({
          id: rec.metadata.spotify_id,
          name: rec.trackName,
          artists: [{ name: rec.artist }],
          album: {
            name: rec.metadata.album_name || "Unknown Album",
            images: rec.metadata.album_image ? [{ url: rec.metadata.album_image }] : []
          },
          duration_ms: rec.metadata.duration_ms || 180000,
          uri: rec.metadata.spotify_uri,
          preview_url: rec.metadata.preview_url,
          external_urls: {
            spotify: rec.metadata.external_url
          }
        }));
      
      if (spotifyTracks.length > 0) {
        setPlaylist(prev => [...prev, ...spotifyTracks]);
        speak(`I found ${spotifyTracks.length} great ${currentMood} songs and added them to your playlist!`);
        
        // Auto-play first track if nothing is currently playing
        if (!isActive && spotifyTracks[0]) {
          playTrack(spotifyTracks[0].uri);
        }
      }
    },
    onError: (error) => {
      console.error("Failed to get AI recommendations:", error);
    }
  });

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const handlePlayPlaylistTrack = async (track: SpotifyTrack, index: number) => {
    if (isAuthenticated && deviceId) {
      await playTrack(track.uri);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const handleSeek = (value: number[]) => {
    if (duration > 0) {
      const newPosition = (value[0] / 100) * duration;
      seek(newPosition);
    }
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const moodColors = {
    energetic: "from-red-500 to-orange-500",
    calm: "from-teal-500 to-green-500", 
    melancholic: "from-purple-500 to-indigo-500",
    focused: "from-blue-500 to-cyan-500",
    happy: "from-yellow-500 to-orange-500",
    romantic: "from-pink-500 to-rose-500"
  };

  // Show authentication UI if not logged in
  if (!isAuthenticated) {
    return (
      <div className={`bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20 ${className}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-spotify-green/20 rounded-full flex items-center justify-center">
              <Music className="w-8 h-8 text-spotify-green" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">Connect to Spotify</h3>
          <p className="text-spotify-light text-sm mb-6">
            Log in to your Spotify account to play real music and access your playlists.
          </p>
          
          {authError && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{authError}</p>
              <div className="flex space-x-2 mt-3">
                <Button
                  onClick={() => setShowSetupGuide(true)}
                  size="sm"
                  variant="outline"
                  className="text-red-400 border-red-400 hover:text-red-300 hover:border-red-300"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Setup Guide
                </Button>
                <Button
                  onClick={clearError}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button
              onClick={login}
              disabled={authLoading}
              className="bg-spotify-green hover:bg-spotify-green/80 text-white px-6 py-3 rounded-full font-medium flex-1"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect Spotify
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowSetupGuide(true)}
              variant="outline"
              className="px-3 py-3 rounded-full border-spotify-green/30 text-spotify-green hover:bg-spotify-green/10"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-spotify-light text-xs mt-4">
            Requires Spotify Premium subscription
          </p>
        </div>
        
        {/* Setup Guide Modal */}
        <AnimatePresence>
          {showSetupGuide && (
            <SpotifySetupGuide onClose={() => setShowSetupGuide(false)} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Spotify Player</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-spotify-light">
              {isReady ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          <Button
            onClick={logout}
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 text-spotify-light hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Now Playing */}
      {currentTrack && (
        <div className="text-center mb-6">
          <motion.div
            animate={{ 
              scale: !isPaused ? [1, 1.02, 1] : 1,
            }}
            transition={{ 
              duration: 3, 
              repeat: !isPaused ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="relative mb-4"
          >
            <img 
              src={currentTrack.album.images[0]?.url || "https://via.placeholder.com/160x160?text=♪"}
              alt={`${currentTrack.name} album artwork`}
              className="w-40 h-40 rounded-2xl mx-auto shadow-lg object-cover"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"
              animate={{ opacity: !isPaused ? [0.3, 0.5, 0.3] : 0.3 }}
              transition={{ duration: 3, repeat: !isPaused ? Infinity : 0 }}
            />
          </motion.div>
          
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h4 className="font-semibold text-lg text-white">{currentTrack.name}</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleLikeTrack(currentTrack.id)}
              className="w-6 h-6 p-0"
            >
              <Heart className={`w-4 h-4 ${likedTracks.has(currentTrack.id) ? 'text-red-500 fill-current' : 'text-spotify-light'}`} />
            </Button>
          </div>
          <p className="text-spotify-light text-sm mb-4">
            {currentTrack.artists.map(a => a.name).join(', ')}
          </p>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs text-spotify-light mb-2">
              <span>{formatTime(position)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full mb-2"
            />
          </div>
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Button
              onClick={previousTrack}
              size="lg"
              className="w-10 h-10 bg-spotify-gray/50 hover:bg-spotify-gray/70 rounded-full p-0"
            >
              <SkipBack className="w-4 h-4 text-white" />
            </Button>
            
            <Button
              onClick={togglePlay}
              size="lg"
              className="w-14 h-14 bg-spotify-green hover:bg-spotify-green/80 rounded-full p-0"
            >
              {isPaused ? (
                <Play className="w-6 h-6 text-white ml-1" />
              ) : (
                <Pause className="w-6 h-6 text-white" />
              )}
            </Button>
            
            <Button
              onClick={nextTrack}
              size="lg"
              className="w-10 h-10 bg-spotify-gray/50 hover:bg-spotify-gray/70 rounded-full p-0"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-3 mb-6">
            <Volume2 className="w-4 h-4 text-spotify-light" />
            <Slider
              value={[50]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      )}

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
          {['energetic', 'calm', 'happy', 'focused'].map((mood) => (
            <Button
              key={mood}
              onClick={() => handleRequestRecommendations(mood)}
              disabled={recommendationMutation.isPending || !isReady}
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
      {playlist.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white mb-3">
            AI Playlist ({playlist.length} tracks)
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            <AnimatePresence>
              {playlist.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentTrack?.id === track.id
                      ? 'bg-spotify-green/20 border border-spotify-green/30' 
                      : 'bg-spotify-gray/20 hover:bg-spotify-gray/40'
                  }`}
                  onClick={() => handlePlayPlaylistTrack(track, index)}
                >
                  <div className="w-10 h-10 bg-spotify-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {currentTrack?.id === track.id && !isPaused ? (
                      <Pause className="w-4 h-4 text-spotify-green" />
                    ) : (
                      <Play className="w-4 h-4 text-spotify-green" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate">{track.name}</p>
                    <p className="text-xs text-spotify-light truncate">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
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
                    <span className="text-xs text-spotify-light">{formatTime(track.duration_ms)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Setup Guide Modal */}
      <AnimatePresence>
        {showSetupGuide && (
          <SpotifySetupGuide onClose={() => setShowSetupGuide(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}