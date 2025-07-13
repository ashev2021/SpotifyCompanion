import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: any) => any;
    };
  }
}

interface SpotifyPlayerState {
  context: any;
  disallows: any;
  duration: number;
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    next_tracks: SpotifyTrack[];
    previous_tracks: SpotifyTrack[];
  };
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
}

interface UseSpotifyPlayerProps {
  token: string;
  name?: string;
  volume?: number;
  onPlayerStateChanged?: (state: SpotifyPlayerState | null) => void;
  onReady?: (deviceId: string) => void;
  onError?: (error: string) => void;
}

export function useSpotifyPlayer({
  token,
  name = "AI Music Agent",
  volume = 0.5,
  onPlayerStateChanged,
  onReady,
  onError
}: UseSpotifyPlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [playerState, setPlayerState] = useState<SpotifyPlayerState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name,
        getOAuthToken: (cb: (token: string) => void) => cb(token),
        volume
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }: any) => {
        console.error('Spotify initialization error:', message);
        onError?.(`Initialization error: ${message}`);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: any) => {
        console.error('Spotify authentication error:', message);
        onError?.(`Authentication error: ${message}`);
      });

      spotifyPlayer.addListener('account_error', ({ message }: any) => {
        console.error('Spotify account error:', message);
        onError?.(`Account error: ${message}`);
      });

      spotifyPlayer.addListener('playback_error', ({ message }: any) => {
        console.error('Spotify playback error:', message);
        onError?.(`Playback error: ${message}`);
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }: any) => {
        console.log('Spotify player ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
        onReady?.(device_id);
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', ({ device_id }: any) => {
        console.log('Spotify device has gone offline', device_id);
        setIsReady(false);
        setIsActive(false);
      });

      // Player state changed
      spotifyPlayer.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
        if (!state) {
          setIsActive(false);
          return;
        }

        setPlayerState(state);
        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);
        setIsActive(true);
        
        onPlayerStateChanged?.(state);
      });

      // Connect to the player
      spotifyPlayer.connect().then((success: boolean) => {
        if (success) {
          console.log('Successfully connected to Spotify!');
        }
      });

      setPlayer(spotifyPlayer);
      playerRef.current = spotifyPlayer;
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token, name, volume, onPlayerStateChanged, onReady, onError]);

  // Player controls
  const togglePlay = async () => {
    if (player) {
      await player.togglePlay();
    }
  };

  const nextTrack = async () => {
    if (player) {
      await player.nextTrack();
    }
  };

  const previousTrack = async () => {
    if (player) {
      await player.previousTrack();
    }
  };

  const seek = async (positionMs: number) => {
    if (player) {
      await player.seek(positionMs);
    }
  };

  const setVolume = async (volumeLevel: number) => {
    if (player) {
      await player.setVolume(volumeLevel);
    }
  };

  // Play specific tracks using Web API
  const playTrack = async (uri: string) => {
    if (!deviceId) {
      onError?.("Device not ready");
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [uri]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to play track: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      onError?.(`Failed to play track: ${error}`);
    }
  };

  const playTracks = async (uris: string[], offset?: number) => {
    if (!deviceId) {
      onError?.("Device not ready");
      return;
    }

    try {
      const body: any = { uris };
      if (offset !== undefined) {
        body.offset = { position: offset };
      }

      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Failed to play tracks: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error playing tracks:', error);
      onError?.(`Failed to play tracks: ${error}`);
    }
  };

  return {
    player,
    deviceId,
    playerState,
    isReady,
    isActive,
    isPaused,
    currentTrack,
    position,
    duration,
    
    // Controls
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    playTrack,
    playTracks
  };
}