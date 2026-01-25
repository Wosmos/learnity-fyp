import { HCaptchaResult } from '@/lib/interfaces/auth';

export class HCaptchaService {
  private secretKey: string;
  private siteKey: string;

  constructor() {
    this.secretKey = process.env.HCAPTCHA_SECRET_KEY || '';
    this.siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

    if (!this.secretKey || !this.siteKey) {
      console.warn(
        'hCaptcha keys not configured. Bot protection may be limited.'
      );
    }
  }

  /**
   * Verify hCaptcha token on the server side
   */
  async verifyToken(token: string, remoteip?: string): Promise<HCaptchaResult> {
    if (!this.secretKey) {
      throw new Error('hCaptcha secret key not configured');
    }

    try {
      const response = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: this.secretKey,
          response: token,
          ...(remoteip && { remoteip }),
        }),
      });

      if (!response.ok) {
        throw new Error(`hCaptcha verification failed: ${response.statusText}`);
      }

      const result: HCaptchaResult = await response.json();
      return result;
    } catch (error) {
      console.error('hCaptcha verification error:', error);
      throw new Error('Failed to verify hCaptcha token');
    }
  }

  /**
   * Verify hCaptcha token with additional validation
   */
  async verifyTokenWithValidation(
    token: string,
    expectedAction?: string,
    minScore?: number,
    remoteip?: string
  ): Promise<{ success: boolean; error?: string; result?: HCaptchaResult }> {
    try {
      const result = await this.verifyToken(token, remoteip);

      if (!result.success) {
        return {
          success: false,
          error: 'hCaptcha verification failed',
          result,
        };
      }

      // Additional validations can be added here if needed
      // hCaptcha doesn't have action/score like reCAPTCHA, but we keep the interface consistent

      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get the site key for client-side integration
   */
  getSiteKey(): string {
    return this.siteKey;
  }

  /**
   * Check if hCaptcha is properly configured
   */
  isConfigured(): boolean {
    return !!(this.secretKey && this.siteKey);
  }
}

// Export singleton instance
export const hCaptchaService = new HCaptchaService();
