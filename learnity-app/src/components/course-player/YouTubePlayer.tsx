'use client';

/**
 * YouTubePlayer Component
 * Embeds YouTube video with progress tracking and resume functionality
 * Requirements: 5.1, 5.3, 5.6 - Embed YouTube video, track watch progress, resume from last position
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Video,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Link2Off,
  Youtube,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
      // Error updating progress
    }
  }, [duration, maxWatchedSeconds, onProgressUpdate, onAutoComplete]);

  // Start progress tracking interval
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = setInterval(() => {
      updateProgress();
    }, progressInterval);
  }, [progressInterval, updateProgress]);

  // Stop progress tracking interval
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Handle player ready
  const handlePlayerReady = useCallback(
    (event: { target: YTPlayer }) => {
      setIsLoading(false);
      setError(null);

      // Seek to last position if provided
      if (lastPosition > 0) {
        event.target.seekTo(lastPosition, true);
      }
    },
    [lastPosition]
  );

  // Handle state change
  const handleStateChange = useCallback(
    (event: { data: number; target: YTPlayer }) => {
      const state = event.data;

      // Start progress tracking when playing
      if (state === window.YT.PlayerState.PLAYING) {
        startProgressTracking();
      } else {
        stopProgressTracking();

        // Update progress one final time when paused or ended
        if (
          state === window.YT.PlayerState.PAUSED ||
          state === window.YT.PlayerState.ENDED
        ) {
          updateProgress();
        }
      }
    },
    [startProgressTracking, stopProgressTracking, updateProgress]
  );

  // Handle error
  const handleError = useCallback((event: { data: number }) => {
    const errorMessages: Record<number, string> = {
      2: 'Invalid video ID. The provided identifier is malformed.',
      5: 'HTML5 player error. Please try a different browser.',
      100: 'Video not found. It may have been removed or set to private.',
      101: 'The owner of this video does not allow it to be embedded.',
      150: 'The owner of this video does not allow it to be embedded.',
    };

    setError(errorMessages[event.data] || 'Failed to load video player');
    setIsLoading(false);
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!isApiReady || !videoId) {
      setError(null);
      setIsLoading(!videoId ? false : true);
      return;
    }

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
          origin: window.location.origin,
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
          onError: handleError,
        },
      });
    } catch (err) {
      console.error('YT Player Init Error:', err);
      setError('Failed to initialize video player');
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

      // Cleanup DOM
      const playerDiv = document.getElementById(playerId);
      if (playerDiv) playerDiv.remove();
    };
  }, [
    isApiReady,
    videoId,
    lessonId,
    handlePlayerReady,
    handleStateChange,
    handleError,
  ]);

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
    const isBrokenLink =
      error.includes('not found') || error.includes('Invalid video ID');

    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center bg-slate-950 border border-red-900/20 rounded-xl overflow-hidden',
          className
        )}
      >
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1),transparent)]' />
        <div className='relative z-10 text-center px-6 max-w-md'>
          <div className='bg-red-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-red-500/20'>
            {isBrokenLink ? (
              <Link2Off className='h-10 w-10 text-red-500' />
            ) : (
              <AlertCircle className='h-10 w-10 text-red-500' />
            )}
          </div>
          <Badge
            variant='outline'
            className='mb-4 border-red-500/50 text-red-500 bg-red-500/5'
          >
            {isBrokenLink ? 'BROKEN LINK DETECTED' : 'PLAYBACK ERROR'}
          </Badge>
          <h3 className='text-xl font-bold text-white mb-2'>
            {isBrokenLink ? 'Video Unavailable' : 'Oops! Something went wrong'}
          </h3>
          <p className='text-slate-400 mb-8'>
            {error}.{' '}
            {isBrokenLink
              ? 'The video link might be broken or the content was removed by the teacher.'
              : 'There was a problem loading the video player.'}
          </p>
          <div className='flex gap-3 justify-center'>
            <Button
              onClick={handleRetry}
              className='bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            >
              <RefreshCcw className='h-4 w-4 mr-2' />
              Retry Player
            </Button>
            {isBrokenLink && (
              <Button
                asChild
                variant='ghost'
                className='text-slate-400 hover:text-white'
              >
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Youtube className='h-4 w-4 mr-2' />
                  View on YouTube
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No video ID
  if (!videoId) {
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center bg-slate-950 border border-slate-800 rounded-xl',
          className
        )}
      >
        <div className='text-center text-slate-400'>
          <div className='bg-slate-900 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-slate-800'>
            <Video className='h-10 w-10 opacity-30' />
          </div>
          <p className='text-lg font-medium'>No source video found</p>
          <p className='text-sm opacity-60'>
            Contact your instructor if this seems wrong
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full h-full bg-black rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm z-10'>
          <div className='relative w-16 h-16 mb-4'>
            <div className='absolute inset-0 border-4 border-indigo-500/20 rounded-full' />
            <div className='absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin' />
          </div>
          <p className='text-indigo-400 font-medium tracking-wide animate-pulse'>
            SYNCHRONIZING CONTENT...
          </p>
        </div>
      )}

      {/* Player container */}
      <div
        ref={containerRef}
        key={`${lessonId}-${videoId}`} // Force re-render on video change to prevent blank screen
        className='w-full h-full [&>div]:w-full [&>div]:h-full [&>iframe]:w-full [&>iframe]:h-full'
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
