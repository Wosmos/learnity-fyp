import { getToken, AppCheck } from 'firebase/app-check';
import { appCheck } from '@/lib/config/firebase';

export class AppCheckService {
  private appCheck: AppCheck | null;

  constructor() {
    this.appCheck = appCheck;
  }

  /**
   * Get App Check token for bot protection
   */
  async getAppCheckToken(forceRefresh: boolean = false): Promise<string | null> {
    if (!this.appCheck) {
      console.warn('App Check not initialized. Bot protection may be limited.');
      return null;
    }

    try {
      const appCheckTokenResponse = await getToken(this.appCheck, forceRefresh);
      return appCheckTokenResponse.token;
    } catch (error) {
      console.error('Failed to get App Check token:', error);
      return null;
    }
  }

  /**
   * Verify if App Check is available and working
   */
  isAppCheckAvailable(): boolean {
    return this.appCheck !== null;
  }

  /**
   * Get App Check token with automatic retry
   */
  async getTokenWithRetry(maxRetries: number = 3): Promise<string | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const token = await this.getAppCheckToken(attempt > 1);
        if (token) {
          return token;
        }
      } catch (error) {
        console.warn(`App Check token attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          console.error('All App Check token attempts failed');
          return null;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    return null;
  }
}

// Export singleton instance
export const appCheckService = new AppCheckService();