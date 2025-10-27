import { getToken, AppCheck } from 'firebase/app-check';
import { appCheck } from '@/lib/config/firebase';
import { SecurityAction, RiskLevel } from '@/types/auth';

export interface AppCheckResult {
  success: boolean;
  token?: string;
  riskLevel: RiskLevel;
  requiresAdditionalVerification: boolean;
  error?: string;
}

export class AppCheckService {
  private appCheck: AppCheck | null;
  private tokenCache = new Map<string, { token: string; expiry: number }>();
  private readonly TOKEN_CACHE_DURATION = 55 * 60 * 1000; // 55 minutes (tokens expire in 1 hour)

  constructor() {
    this.appCheck = appCheck;
  }

  /**
   * Get App Check token for bot protection with enhanced security assessment
   */
  async getAppCheckTokenForAction(action: SecurityAction, forceRefresh: boolean = false): Promise<AppCheckResult> {
    if (!this.appCheck) {
      // In development, allow without App Check but mark as medium risk
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          riskLevel: RiskLevel.MEDIUM,
          requiresAdditionalVerification: false
        };
      }

      return {
        success: false,
        riskLevel: RiskLevel.HIGH,
        requiresAdditionalVerification: true,
        error: 'App Check not initialized. Bot protection unavailable.'
      };
    }

    try {
      const token = await this.getAppCheckToken(forceRefresh);
      
      if (!token) {
        return {
          success: false,
          riskLevel: RiskLevel.HIGH,
          requiresAdditionalVerification: true,
          error: 'Failed to obtain App Check token'
        };
      }

      // Assess risk based on action type
      const riskLevel = this.assessActionRisk(action);
      
      return {
        success: true,
        token,
        riskLevel,
        requiresAdditionalVerification: riskLevel === RiskLevel.HIGH
      };
    } catch (error: any) {
      return {
        success: false,
        riskLevel: RiskLevel.HIGH,
        requiresAdditionalVerification: true,
        error: error.message || 'App Check verification failed'
      };
    }
  }

  /**
   * Get App Check token for bot protection
   */
  async getAppCheckToken(forceRefresh: boolean = false): Promise<string | null> {
    if (!this.appCheck) {
      console.warn('App Check not initialized. Bot protection may be limited.');
      return null;
    }

    // Check cache first
    const cacheKey = 'app-check-token';
    const cached = this.tokenCache.get(cacheKey);
    
    if (!forceRefresh && cached && cached.expiry > Date.now()) {
      return cached.token;
    }

    try {
      const appCheckTokenResponse = await getToken(this.appCheck, forceRefresh);
      
      // Cache the token
      this.tokenCache.set(cacheKey, {
        token: appCheckTokenResponse.token,
        expiry: Date.now() + this.TOKEN_CACHE_DURATION
      });
      
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
   * Get App Check token with automatic retry and exponential backoff
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
        
        // Wait before retry (exponential backoff with jitter)
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
      }
    }
    
    return null;
  }

  /**
   * Validate App Check token (server-side)
   */
  async validateAppCheckToken(token: string): Promise<boolean> {
    // This would typically be done server-side with Firebase Admin SDK
    // For now, we'll assume the token is valid if it exists
    return typeof token === 'string' && token.length > 0;
  }

  /**
   * Assess risk level based on action type
   */
  private assessActionRisk(action: SecurityAction): RiskLevel {
    const riskLevels = {
      [SecurityAction.LOGIN]: RiskLevel.MEDIUM,
      [SecurityAction.REGISTER]: RiskLevel.HIGH,
      [SecurityAction.PASSWORD_RESET]: RiskLevel.HIGH,
      [SecurityAction.PROFILE_UPDATE]: RiskLevel.LOW,
      [SecurityAction.TEACHER_APPLICATION]: RiskLevel.HIGH
    };

    return riskLevels[action] || RiskLevel.MEDIUM;
  }

  /**
   * Check if action requires App Check verification
   */
  requiresAppCheck(action: SecurityAction): boolean {
    const highRiskActions = [
      SecurityAction.REGISTER,
      SecurityAction.PASSWORD_RESET,
      SecurityAction.TEACHER_APPLICATION
    ];

    return highRiskActions.includes(action) || process.env.NODE_ENV === 'production';
  }

  /**
   * Clear token cache
   */
  clearCache(): void {
    this.tokenCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { cachedTokens: number; totalSize: number } {
    return {
      cachedTokens: this.tokenCache.size,
      totalSize: Array.from(this.tokenCache.values()).reduce((size, entry) => 
        size + entry.token.length, 0
      )
    };
  }

  /**
   * Preload App Check token for better performance
   */
  async preloadToken(): Promise<void> {
    try {
      await this.getAppCheckToken(false);
    } catch (error) {
      console.warn('Failed to preload App Check token:', error);
    }
  }
}

// Export singleton instance
export const appCheckService = new AppCheckService();