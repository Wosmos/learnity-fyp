'use client';

/**
 * YouTubePlayer Component
 * Embeds YouTube video with progress tracking and resume functionality
 * Requirements: 5.1, 5.3, 5.6 - Embed YouTube video, track watch progress, resume from last position
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Video, Loader2, AlertCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

export interface YouTubePlayerProps {
  /** YouTube video ID */
  videoId: string;
  /** Lesson ID for progress tracking */
  lessonId: string;
  /** Video duration in seconds */
  duration: number;
  /** Last watched position in seconds (for resume) */
  lastPosition?: number;
  /** Callback when progress is updated */
  onProgressUpdate?: (watchedSeconds: number, lastPosition: number) => void;
  /** Callback when video is auto-completed (90% watched) */
  onAutoComplete?: () => void;
  /** Progress update interval in milliseconds */
  progressInterval?: number;
  /** Additional class name */
  className?: string;
}

/** Completion threshold - 90% watched */
const COMPLETION_THRESHOLD = 0.9;

/** Default progress update interval - 10 seconds */
const DEFAULT_PROGRESS_INTERVAL = 10000;

/**
 * YouTubePlayer - Embeds YouTube video with progress tracking
 * Uses YouTube IFrame API for playback control and progress monitoring
 */
export function YouTubePlayer({
  videoId,
  lessonId,
  duration,
  lastPosition = 0,
  onProgressUpdate,
  onAutoComplete,
  progressInterval = DEFAULT_PROGRESS_INTERVAL,
  className,
}: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoCompletedRef = useRef(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [maxWatchedSeconds, setMaxWatchedSeconds] = useState(0);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT?.Player) {
      setIsApiReady(true);
      return;
    }

    // Load the API script
    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);
    }

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };

    return () => {
      // Cleanup callback
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = () => {};
      }
    };
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!isApiReady || !videoId) return;

    const playerId = `youtube-player-${lessonId}`;
    
    // Create player container if it doesn't exist
    if (containerRef.current && !document.getElementById(playerId)) {
      const playerDiv = document.createElement('div');
      playerDiv.id = playerId;
      containerRef.current.appendChild(playerDiv);
    }

    // Initialize player
    try {
      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: Math.floor(lastPosition),
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
          onError: handleError,
        },
      });
    } catch (err) {
      console.error('Failed to initialize YouTube player:', err);
      setError('Failed to load video player');
      setIsLoading(false);
    }

    return () => {
      // Cleanup
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Player may already be destroyed
        }
        playerRef.current = null;
      }
    };
  }, [isApiReady, videoId, lessonId]);

  // Handle player ready
  const handlePlayerReady = useCallback((event: { target: YTPlayer }) => {
    setIsLoading(false);
    setError(null);
    
    // Seek to last position if provided
    if (lastPosition > 0) {
      event.target.seekTo(lastPosition, true);
    }
  }, [lastPosition]);

  // Handle state change
  const handleStateChange = useCallback((event: { data: number; target: YTPlayer }) => {
    const state = event.data;
    
    // Start progress tracking when playing
    if (state === window.YT.PlayerState.PLAYING) {
      startProgressTracking();
    } else {
      stopProgressTracking();
      
      // Update progress one final time when paused or ended
      if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.ENDED) {
        updateProgress();
      }
    }
  }, []);

  // Handle error
  const handleError = useCallback((event: { data: number }) => {
    const errorMessages: Record<number, string> = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found or removed',
      101: 'Video cannot be embedded',
      150: 'Video cannot be embedded',
    };
    
    setError(errorMessages[event.data] || 'Failed to load video');
    setIsLoading(false);
  }, []);

  // Start progress tracking interval
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;
    
    progressIntervalRef.current = setInterval(() => {
      updateProgress();
    }, progressInterval);
  }, [progressInterval]);

  // Stop progress tracking interval
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Update progress
  const updateProgress = useCallback(() => {
    if (!playerRef.current) return;
    
    try {
      const currentTime = playerRef.current.getCurrentTime();
      const videoDuration = playerRef.current.getDuration() || duration;
      
      // Track maximum watched seconds
      const newMaxWatched = Math.max(maxWatchedSeconds, currentTime);
      setMaxWatchedSeconds(newMaxWatched);
      
      // Call progress update callback
      onProgressUpdate?.(Math.floor(newMaxWatched), Math.floor(currentTime));
      
      // Check for auto-completion (90% threshold)
      if (!hasAutoCompletedRef.current && videoDuration > 0) {
        const watchedPercentage = newMaxWatched / videoDuration;
        if (watchedPercentage >= COMPLETION_THRESHOLD) {
          hasAutoCompletedRef.current = true;
          onAutoComplete?.();
        }
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  }, [duration, maxWatchedSeconds, onProgressUpdate, onAutoComplete]);

  // Retry loading
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    hasAutoCompletedRef.current = false;
    
    // Reinitialize player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // Ignore
      }
      playerRef.current = null;
    }
    
    // Trigger re-render to reinitialize
    setIsApiReady(false);
    setTimeout(() => setIsApiReady(true), 100);
  }, []);

  // Error state
  if (error) {
    return (
      <div className={cn('w-full h-full flex items-center justify-center bg-slate-900', className)}>
        <div className="text-center text-slate-400">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <p className="text-lg mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No video ID
  if (!videoId) {
    return (
      <div className={cn('w-full h-full flex items-center justify-center bg-slate-900', className)}>
        <div className="text-center text-slate-400">
          <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No video available for this lesson</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="text-center text-slate-400">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <p>Loading video...</p>
          </div>
        </div>
      )}
      
      {/* Player container */}
      <div 
        ref={containerRef} 
        className="w-full h-full [&>div]:w-full [&>div]:h-full [&>iframe]:w-full [&>iframe]:h-full"
      />
    </div>
  );
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export default YouTubePlayer;
