import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, Heart, Plus, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { apiRequest } from "@/lib/queryClient";
import type { ConversationResponse } from "@/lib/openai";

interface SpotifyPreviewPlayerProps {
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

export function SpotifyPreviewPlayer({ className = "" }: SpotifyPreviewPlayerProps) {
  const [playlist, setPlaylist] = useState<SpotifyTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
  const { speak } = useSpeechSynthesis();

  const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;

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
          artists: rec.metadata.artist_names ? 
            rec.metadata.artist_names.map((name: string) => ({ name })) :
            [{ name: rec.artist }],
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
        const newPlaylist = [...playlist, ...spotifyTracks];
        setPlaylist(newPlaylist);
        
        // Auto-play first new track if nothing is currently playing
        if (currentTrackIndex === -1 && spotifyTracks[0]) {
          const firstNewTrackIndex = playlist.length;
          setCurrentTrackIndex(firstNewTrackIndex);
          
          if (spotifyTracks[0].preview_url) {
            setIsPlaying(true);
            speak(`Playing "${spotifyTracks[0].name}" by ${spotifyTracks[0].artists.map(a => a.name).join(', ')}. I found ${spotifyTracks.length} ${mood} songs! You can also click tracks in the conversation to open them in Spotify.`);
          } else {
            speak(`I found "${spotifyTracks[0].name}" and ${spotifyTracks.length - 1} other ${mood} songs. Click tracks in the conversation or playlist to open them in Spotify.`);
          }
        } else {
          speak(`Added ${spotifyTracks.length} great ${mood} songs to your playlist! Click any song to play its preview or open in Spotify.`);
        }
      } else {
        speak(`I found some ${mood} songs but they don't have previews available. Check the playlist to open them directly in Spotify!`);
      }
    },
    onError: (error) => {
      console.error("Failed to get AI recommendations:", error);
    }
  });

  // Audio control effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.preview_url) {
      setIsPlaying(false);
      return;
    }

    audio.src = currentTrack.preview_url;
    audio.volume = volume / 100;
    
    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex, currentTrack, isPlaying]);

  // Update volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.preview_url) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < playlist.length) {
      setCurrentTrackIndex(nextIndex);
      setCurrentTime(0);
    } else {
      setIsPlaying(false);
    }
  };

  const previousTrack = () => {
    const prevIndex = currentTrackIndex - 1;
    if (prevIndex >= 0) {
      setCurrentTrackIndex(prevIndex);
      setCurrentTime(0);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const playTrack = (track: SpotifyTrack, index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    
    if (track.preview_url) {
      setIsPlaying(true);
      speak(`Playing "${track.name}" by ${track.artists.map(a => a.name).join(', ')}`);
    } else {
      setIsPlaying(false);
      speak(`"${track.name}" doesn't have a preview. Opening in Spotify for full playback.`);
      setTimeout(() => {
        window.open(track.external_urls.spotify, '_blank');
      }, 1000);
    }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const moodColors = {
    energetic: "from-red-500 to-orange-500",
    calm: "from-teal-500 to-green-500", 
    melancholic: "from-purple-500 to-indigo-500",
    focused: "from-blue-500 to-cyan-500",
    happy: "from-yellow-500 to-orange-500",
    romantic: "from-pink-500 to-rose-500"
  };

  return (
    <div className={`bg-spotify-gray/30 rounded-2xl p-6 border border-spotify-gray/20 ${className}`}>
      <audio ref={audioRef} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Spotify Preview Player</h3>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-spotify-light">Preview Mode</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300">
          <strong>Preview Mode:</strong> Playing 30-second previews. For full tracks, click "Open in Spotify" or deploy this app for full Spotify integration.
        </p>
      </div>

      {/* Now Playing */}
      {currentTrack && (
        <div className="text-center mb-6">
          <motion.div
            animate={{ 
              scale: isPlaying ? [1, 1.02, 1] : 1,
            }}
            transition={{ 
              duration: 3, 
              repeat: isPlaying ? Infinity : 0,
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
              animate={{ opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.3 }}
              transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
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
          <p className="text-spotify-light text-sm mb-2">
            {currentTrack.artists.map(a => a.name).join(', ')}
          </p>
          
          <Button
            onClick={() => window.open(currentTrack.external_urls.spotify, '_blank')}
            size="sm"
            className="mb-4 bg-spotify-green hover:bg-spotify-green/80"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Spotify
          </Button>
          
          {currentTrack.preview_url ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-spotify-light mb-2">
                  <span>{formatTime(currentTime)}</span>
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
                  disabled={currentTrackIndex <= 0}
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
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" />
                  )}
                </Button>
                
                <Button
                  onClick={nextTrack}
                  disabled={currentTrackIndex >= playlist.length - 1}
                  size="lg"
                  className="w-10 h-10 bg-spotify-gray/50 hover:bg-spotify-gray/70 rounded-full p-0"
                >
                  <SkipForward className="w-4 h-4 text-white" />
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-3 mb-6">
                <Volume2 className="w-4 h-4 text-spotify-light" />
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>
            </>
          ) : (
            <p className="text-spotify-light text-sm mb-6">No preview available - open in Spotify to listen</p>
          )}
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
              onClick={() => recommendationMutation.mutate(mood)}
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
                    currentTrackIndex === index
                      ? 'bg-spotify-green/20 border border-spotify-green/30' 
                      : 'bg-spotify-gray/20 hover:bg-spotify-gray/40'
                  }`}
                  onClick={() => playTrack(track, index)}
                >
                  <div className="w-10 h-10 bg-spotify-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {currentTrackIndex === index && isPlaying ? (
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
                    {!track.preview_url && (
                      <span className="text-xs text-yellow-400">No preview</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(track.external_urls.spotify, '_blank');
                      }}
                      className="w-6 h-6 p-0"
                    >
                      <ExternalLink className="w-3 h-3 text-spotify-light" />
                    </Button>
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
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}