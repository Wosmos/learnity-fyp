/**
 * Type definitions for device fingerprinting utilities
 */

export interface DeviceFingerprintOptions {
  /** Length of the generated fingerprint hash (default: 24) */
  hashLength?: number;
  /** Include additional headers for enhanced entropy (default: true) */
  enhancedEntropy?: boolean;
}

export interface DeviceInfo {
  /** Device fingerprint hash */
  fingerprint: string;
  /** User agent string */
  userAgent: string;
  /** IP address */
  ipAddress: string;
  /** Accept-Language header */
  acceptLanguage?: string;
  /** Accept-Encoding header */
  acceptEncoding?: string;
  /** Connection header */
  connection?: string;
}

export interface FingerprintAnalysis {
  /** Unique device fingerprint */
  fingerprint: string;
  /** Risk level based on fingerprint analysis */
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  /** Whether this is a known device */
  isKnownDevice: boolean;
  /** Confidence score (0-1) */
  confidence: number;
  /** Additional metadata */
  metadata: Record<string, any>;
}