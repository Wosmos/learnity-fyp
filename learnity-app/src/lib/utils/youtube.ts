import { z } from 'zod';

// ============================================
// YOUTUBE URL VALIDATION UTILITY
// Requirements: 1.7, 1.8
// ============================================

/**
 * YouTube video metadata interface
 */
export interface YouTubeMetadata {
  videoId: string;
  title: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  authorName: string;
}

/**
 * YouTube oEmbed API response interface
 */
interface YouTubeOEmbedResponse {
  title: string;
  author_name: string;
  thumbnail_url: string;
  html: string;
}

/**
 * Regular expressions for YouTube URL formats
 */
const YOUTUBE_PATTERNS = {
  // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  standard: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&.*)?$/,
  
  // Short URL: https://youtu.be/VIDEO_ID
  short: /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
  
  // Embed URL: https://www.youtube.com/embed/VIDEO_ID
  embed: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
  
  // Mobile URL: https://m.youtube.com/watch?v=VIDEO_ID
  mobile: /^(?:https?:\/\/)?m\.youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&.*)?$/,
};

/**
 * Validates if a string is a valid YouTube video ID
 * YouTube video IDs are exactly 11 characters containing alphanumeric, underscore, and hyphen
 */
export function isValidYouTubeVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

/**
 * Extracts video ID from a YouTube URL
 * Supports multiple URL formats: youtube.com/watch, youtu.be, youtube.com/embed, m.youtube.com
 * 
 * @param url - The YouTube URL to parse
 * @returns The video ID if valid, null otherwise
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmedUrl = url.trim();

  // Try each pattern
  for (const pattern of Object.values(YOUTUBE_PATTERNS)) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if a URL is a valid YouTube video URL
 * 
 * @param url - The URL to validate
 * @returns true if valid YouTube URL, false otherwise
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Zod schema for YouTube URL validation
 */
export const YouTubeUrlSchema = z.string()
  .min(1, 'YouTube URL is required')
  .refine(
    (url) => isValidYouTubeUrl(url),
    'Invalid YouTube URL. Please use youtube.com/watch or youtu.be format'
  );

/**
 * Fetches video metadata from YouTube oEmbed API
 * 
 * @param videoId - The YouTube video ID
 * @returns Video metadata or null if fetch fails
 */
export async function fetchYouTubeMetadata(videoId: string): Promise<YouTubeMetadata | null> {
  if (!isValidYouTubeVideoId(videoId)) {
    return null;
  }

  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oEmbedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`YouTube oEmbed API error: ${response.status}`);
      return null;
    }

    const data: YouTubeOEmbedResponse = await response.json();

    return {
      videoId,
      title: data.title,
      duration: 0, // oEmbed doesn't provide duration, would need YouTube Data API
      thumbnailUrl: data.thumbnail_url,
      authorName: data.author_name,
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return null;
  }
}

/**
 * Validates a YouTube URL and fetches its metadata
 * 
 * @param url - The YouTube URL to validate and fetch metadata for
 * @returns Object with validation result and metadata
 */
export async function validateAndFetchYouTubeUrl(url: string): Promise<{
  isValid: boolean;
  videoId: string | null;
  metadata: YouTubeMetadata | null;
  error?: string;
}> {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return {
      isValid: false,
      videoId: null,
      metadata: null,
      error: 'Invalid YouTube URL. Please use youtube.com/watch or youtu.be format',
    };
  }

  const metadata = await fetchYouTubeMetadata(videoId);

  if (!metadata) {
    return {
      isValid: false,
      videoId,
      metadata: null,
      error: 'Could not fetch video metadata. Please check if the video exists and is public.',
    };
  }

  return {
    isValid: true,
    videoId,
    metadata,
  };
}

/**
 * Generates a YouTube embed URL from a video ID
 * 
 * @param videoId - The YouTube video ID
 * @returns The embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Generates a YouTube thumbnail URL from a video ID
 * 
 * @param videoId - The YouTube video ID
 * @param quality - Thumbnail quality (default, medium, high, standard, maxres)
 * @returns The thumbnail URL
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Generates a wa.me direct chat link for WhatsApp
 * Requirements: 11.4
 * 
 * @param phoneNumber - Phone number with country code (e.g., +1234567890)
 * @param message - Optional pre-filled message
 * @returns The wa.me URL
 */
export function generateWhatsAppLink(phoneNumber: string, message?: string): string {
  // Remove any non-numeric characters except the leading +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '').replace(/^\+/, '');
  
  let url = `https://wa.me/${cleanNumber}`;
  
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }
  
  return url;
}
