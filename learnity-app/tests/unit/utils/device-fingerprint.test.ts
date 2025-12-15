/**
 * Tests for device fingerprint utility
 */

import { 
  generateDeviceFingerprint, 
  generateDeviceFingerprintLegacy,
  extractIpAddress,
  extractUserAgent,
  extractDeviceInfo
} from '../../../src/lib/utils/device-fingerprint';

// Mock Request object
const createMockRequest = (headers: Record<string, string> = {}): Request => {
  const defaultHeaders : any = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'accept-language': 'en-US,en;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'connection': 'keep-alive',
    'x-forwarded-for': '192.168.1.1',
    ...headers
  };

  return {
    headers: {
      get: (name: string) => defaultHeaders[name.toLowerCase()] || null
    }
  } as Request;
};

describe('Device Fingerprint Utility', () => {
  describe('generateDeviceFingerprint', () => {
    it('should generate consistent fingerprints for same request', () => {
      const request = createMockRequest();
      const fingerprint1 = generateDeviceFingerprint(request);
      const fingerprint2 = generateDeviceFingerprint(request);
      
      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toHaveLength(24); // default hash length
    });

    it('should generate different fingerprints for different requests', () => {
      const request1 = createMockRequest({ 'user-agent': 'Chrome' });
      const request2 = createMockRequest({ 'user-agent': 'Firefox' });
      
      const fingerprint1 = generateDeviceFingerprint(request1);
      const fingerprint2 = generateDeviceFingerprint(request2);
      
      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should respect custom hash length', () => {
      const request = createMockRequest();
      const fingerprint = generateDeviceFingerprint(request, { hashLength: 16 });
      
      expect(fingerprint).toHaveLength(16);
    });

    it('should handle basic fingerprinting when enhancedEntropy is false', () => {
      const request = createMockRequest();
      const fingerprint = generateDeviceFingerprint(request, { enhancedEntropy: false });
      
      expect(fingerprint).toHaveLength(24);
      expect(typeof fingerprint).toBe('string');
    });
  });

  describe('generateDeviceFingerprintLegacy', () => {
    it('should generate consistent fingerprints for same inputs', () => {
      const userAgent = 'Mozilla/5.0';
      const ipAddress = '192.168.1.1';
      
      const fingerprint1 = generateDeviceFingerprintLegacy(userAgent, ipAddress);
      const fingerprint2 = generateDeviceFingerprintLegacy(userAgent, ipAddress);
      
      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toHaveLength(16); // legacy default
    });
  });

  describe('extractIpAddress', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = createMockRequest({ 'x-forwarded-for': '203.0.113.1, 192.168.1.1' });
      const ip = extractIpAddress(request);
      
      expect(ip).toBe('203.0.113.1');
    });

    it('should extract IP from x-real-ip header when x-forwarded-for is not present', () => {
      const request = createMockRequest({ 'x-real-ip': '203.0.113.2' });
      const ip = extractIpAddress(request);
      
      expect(ip).toBe('203.0.113.2');
    });

    it('should prioritize cf-connecting-ip header', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '203.0.113.3',
        'x-forwarded-for': '203.0.113.1',
        'x-real-ip': '203.0.113.2'
      });
      const ip = extractIpAddress(request);
      
      expect(ip).toBe('203.0.113.3');
    });

    it('should return "unknown" when no IP headers are present', () => {
      const request = createMockRequest({});
      const ip = extractIpAddress(request);
      
      expect(ip).toBe('unknown');
    });
  });

  describe('extractUserAgent', () => {
    it('should extract user agent from header', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      const request = createMockRequest({ 'user-agent': userAgent });
      
      expect(extractUserAgent(request)).toBe(userAgent);
    });

    it('should return "unknown" when user agent is not present', () => {
      const request = createMockRequest({});
      
      expect(extractUserAgent(request)).toBe('unknown');
    });
  });

  describe('extractDeviceInfo', () => {
    it('should extract comprehensive device information', () => {
      const request = createMockRequest();
      const deviceInfo = extractDeviceInfo(request);
      
      expect(deviceInfo).toHaveProperty('fingerprint');
      expect(deviceInfo).toHaveProperty('userAgent');
      expect(deviceInfo).toHaveProperty('ipAddress');
      expect(deviceInfo).toHaveProperty('acceptLanguage');
      expect(deviceInfo).toHaveProperty('acceptEncoding');
      expect(deviceInfo).toHaveProperty('connection');
      
      expect(typeof deviceInfo.fingerprint).toBe('string');
      expect(deviceInfo.fingerprint.length).toBeGreaterThan(0);
    });
  });
});