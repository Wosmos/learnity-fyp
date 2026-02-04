import { createHash } from 'crypto';
import type {
  DeviceFingerprintOptions,
  DeviceInfo,
} from '@/types/device-fingerprint';

/**
 * Device fingerprinting utility for security and analytics
 * Generates consistent device fingerprints across the application
 */

/**
 * Generate device fingerprint from Request object (recommended)
 * Uses multiple headers for better uniqueness and security
 */
export function generateDeviceFingerprint(
  request: Request,
  options: DeviceFingerprintOptions = {}
): string {
  const { hashLength = 24, enhancedEntropy = true } = options;

  const userAgent = request.headers.get('user-agent') || 'unknown';

  if (enhancedEntropy) {
    const acceptLanguage = request.headers.get('accept-language') || 'unknown';
    const acceptEncoding = request.headers.get('accept-encoding') || 'unknown';
    const connection = request.headers.get('connection') || 'unknown';

    const fingerprintData = [
      userAgent,
      acceptLanguage,
      acceptEncoding,
      connection,
    ].join('|');

    return createHash('sha256')
      .update(fingerprintData)
      .digest('hex')
      .substring(0, hashLength);
  }

  // Basic fingerprint for backward compatibility
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const ipAddress = xForwardedFor?.split(',')[0] || xRealIp || 'unknown';

  return createHash('sha256')
    .update(`${userAgent}:${ipAddress}`)
    .digest('hex')
    .substring(0, hashLength);
}

/**
 * Generate device fingerprint from individual parameters (legacy support)
 * @deprecated Use generateDeviceFingerprint(request) instead
 */
export function generateDeviceFingerprintLegacy(
  userAgent: string,
  ipAddress: string,
  options: DeviceFingerprintOptions = {}
): string {
  const { hashLength = 16 } = options;

  return createHash('sha256')
    .update(`${userAgent}:${ipAddress}`)
    .digest('hex')
    .substring(0, hashLength);
}

/**
 * Extract IP address from Request object
 * Handles various proxy headers correctly
 */
export function extractIpAddress(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  // Priority order: CF-Connecting-IP > X-Forwarded-For > X-Real-IP
  if (cfConnectingIp) return cfConnectingIp;
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  if (xRealIp) return xRealIp;

  return 'unknown';
}

/**
 * Extract user agent from Request object
 */
export function extractUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}
/**

 * Extract comprehensive device information from Request object
 */
export function extractDeviceInfo(request: Request): DeviceInfo {
  const userAgent = extractUserAgent(request);
  const ipAddress = extractIpAddress(request);
  const acceptLanguage = request.headers.get('accept-language') || undefined;
  const acceptEncoding = request.headers.get('accept-encoding') || undefined;
  const connection = request.headers.get('connection') || undefined;

  const fingerprint = generateDeviceFingerprint(request);

  return {
    fingerprint,
    userAgent,
    ipAddress,
    acceptLanguage,
    acceptEncoding,
    connection,
  };
}

/**
 * Generate device fingerprint with comprehensive device info
 * Returns both fingerprint and device information
 */
export function generateDeviceFingerprintWithInfo(
  request: Request,
  options: DeviceFingerprintOptions = {}
): { fingerprint: string; deviceInfo: DeviceInfo } {
  const deviceInfo = extractDeviceInfo(request);
  const fingerprint = generateDeviceFingerprint(request, options);

  return {
    fingerprint,
    deviceInfo: {
      ...deviceInfo,
      fingerprint,
    },
  };
}
