/**
 * Vercel Blob Storage Service
 * Handles file uploads to Vercel Blob storage
 */

import { put, del, list } from '@vercel/blob';

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

export class BlobStorageService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  /**
   * Check if Vercel Blob is properly configured
   */
  private static isConfigured(): boolean {
    return !!process.env.BLOB_READ_WRITE_TOKEN;
  }
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  private static readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  private static readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];

  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Vercel Blob not configured, skipping file upload');
      return {
        url: '',
        pathname: '',
        contentType: file.type,
        contentDisposition: `inline; filename="${file.name}"`
      };
    }

    this.validateImageFile(file);
    
    const filename = `profile-pictures/${userId}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      contentDisposition: `inline; filename="${file.name}"`
    };
  }

  /**
   * Upload banner image
   */
  static async uploadBannerImage(file: File, userId: string): Promise<UploadResult> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Vercel Blob not configured, skipping file upload');
      return {
        url: '',
        pathname: '',
        contentType: file.type,
        contentDisposition: `inline; filename="${file.name}"`
      };
    }

    this.validateImageFile(file);
    
    const filename = `banner-images/${userId}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      contentDisposition: `inline; filename="${file.name}"`
    };
  }

  /**
   * Upload document (certificates, diplomas, etc.)
   */
  static async uploadDocument(file: File, userId: string): Promise<UploadResult> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Vercel Blob not configured, skipping file upload');
      return {
        url: '',
        pathname: '',
        contentType: file.type,
        contentDisposition: `attachment; filename="${file.name}"`
      };
    }

    this.validateDocumentFile(file);
    
    const filename = `documents/${userId}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      contentDisposition: `attachment; filename="${file.name}"`
    };
  }

  /**
   * Upload video introduction
   */
  static async uploadVideoIntro(file: File, userId: string): Promise<UploadResult> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Vercel Blob not configured, skipping file upload');
      return {
        url: '',
        pathname: '',
        contentType: file.type,
        contentDisposition: `inline; filename="${file.name}"`
      };
    }

    this.validateVideoFile(file);
    
    const filename = `video-intros/${userId}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      contentDisposition: `inline; filename="${file.name}"`
    };
  }

  /**
   * Delete file from blob storage
   */
  static async deleteFile(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      console.error('Error deleting file from blob storage:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * List files for a user
   */
  static async listUserFiles(userId: string, prefix?: string): Promise<any[]> {
    try {
      const { blobs } = await list({
        prefix: prefix || userId,
      });
      return blobs;
    } catch (error) {
      console.error('Error listing user files:', error);
      throw new Error('Failed to list files');
    }
  }

  /**
   * Validate image file
   */
  private static validateImageFile(file: File): void {
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid image type. Only JPEG, PNG, and WebP are allowed.');
    }
    
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }
  }

  /**
   * Validate document file
   */
  private static validateDocumentFile(file: File): void {
    if (!this.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      throw new Error('Invalid document type. Only PDF and Word documents are allowed.');
    }
    
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }
  }

  /**
   * Validate video file
   */
  private static validateVideoFile(file: File): void {
    if (!this.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error('Invalid video type. Only MP4, WebM, and QuickTime are allowed.');
    }
    
    const maxVideoSize = 50 * 1024 * 1024; // 50MB for videos
    if (file.size > maxVideoSize) {
      throw new Error('Video file size too large. Maximum size is 50MB.');
    }
  }

  /**
   * Get file type category
   */
  static getFileCategory(file: File): 'image' | 'document' | 'video' | 'unknown' {
    if (this.ALLOWED_IMAGE_TYPES.includes(file.type)) return 'image';
    if (this.ALLOWED_DOCUMENT_TYPES.includes(file.type)) return 'document';
    if (this.ALLOWED_VIDEO_TYPES.includes(file.type)) return 'video';
    return 'unknown';
  }
}

// Convenience functions for easier imports
export const uploadToVercelBlob = BlobStorageService;
export const uploadProfilePicture = BlobStorageService.uploadProfilePicture;
export const uploadBannerImage = BlobStorageService.uploadBannerImage;
export const uploadDocument = BlobStorageService.uploadDocument;
export const uploadVideoIntro = BlobStorageService.uploadVideoIntro;
export const deleteFile = BlobStorageService.deleteFile;