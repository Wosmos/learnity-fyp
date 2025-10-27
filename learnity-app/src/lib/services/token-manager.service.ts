import { User as FirebaseUser, getIdToken, getIdTokenResult } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { adminAuth } from '@/lib/config/firebase-admin';
import { CustomClaims, AuthError, AuthErrorCode } from '@/types/auth';

export interface TokenInfo {
  token: string;
  expirationTime: Date;
  issuedAtTime: Date;
  claims: CustomClaims;
}

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  needsRefresh: boolean;
  claims?: CustomClaims;
  error?: AuthError;
}

export class TokenManagerService {
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_TOKEN_AGE = 60 * 60 * 1000; // 1 hour
  private tokenCache = new Map<string, TokenInfo>();
  private refreshPromises = new Map<string, Promise<string>>();

  /**
   * Get current user's ID token with automatic refresh
   */
  async getCurrentUserToken(forceRefresh: boolean = false): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    return this.getUserToken(user, forceRefresh);
  }

  /**
   * Get ID token for a specific user with caching and refresh logic
   */
  async getUserToken(user: FirebaseUser, forceRefresh: boolean = false): Promise<string> {
    const userId = user.uid;

    // Check if there's already a refresh in progress
    if (this.refreshPromises.has(userId)) {
      return this.refreshPromises.get(userId)!;
    }

    // Check cache first
    const cachedToken = this.tokenCache.get(userId);
    if (!forceRefresh && cachedToken && this.isTokenUsable(cachedToken)) {
      return cachedToken.token;
    }

    // Start token refresh
    const refreshPromise = this.refreshUserToken(user);
    this.refreshPromises.set(userId, refreshPromise);

    try {
      const token = await refreshPromise;
      return token;
    } finally {
      this.refreshPromises.delete(userId);
    }
  }

  /**
   * Refresh token for a user and update cache
   */
  private async refreshUserToken(user: FirebaseUser): Promise<string> {
    try {
      const tokenResult = await getIdTokenResult(user, true);
      
      const tokenInfo: TokenInfo = {
        token: tokenResult.token,
        expirationTime: new Date(tokenResult.expirationTime),
        issuedAtTime: new Date(tokenResult.issuedAtTime),
        claims: (tokenResult.claims as unknown) as CustomClaims
      };

      // Update cache
      this.tokenCache.set(user.uid, tokenInfo);

      return tokenResult.token;
    } catch (error: any) {
      throw this.mapTokenError(error);
    }
  }

  /**
   * Validate a token and return validation result
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const expirationTime = new Date(decodedToken.exp * 1000);
      const currentTime = new Date();

      const isExpired = expirationTime <= currentTime;
      const needsRefresh = (expirationTime.getTime() - currentTime.getTime()) < this.TOKEN_REFRESH_THRESHOLD;

      return {
        isValid: !isExpired,
        isExpired,
        needsRefresh,
        claims: (decodedToken as unknown) as CustomClaims
      };
    } catch (error: any) {
      return {
        isValid: false,
        isExpired: true,
        needsRefresh: true,
        error: this.mapTokenError(error)
      };
    }
  }

  /**
   * Validate token and refresh if needed
   */
  async validateAndRefreshToken(token: string): Promise<{ token: string; claims: CustomClaims }> {
    const validation = await this.validateToken(token);

    if (!validation.isValid) {
      throw new Error(validation.error?.message || 'Invalid token');
    }

    if (validation.needsRefresh) {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user for token refresh');
      }

      const newToken = await this.getUserToken(user, true);
      const newValidation = await this.validateToken(newToken);
      
      return {
        token: newToken,
        claims: newValidation.claims!
      };
    }

    return {
      token,
      claims: validation.claims!
    };
  }

  /**
   * Get token info from cache
   */
  getTokenInfo(userId: string): TokenInfo | null {
    return this.tokenCache.get(userId) || null;
  }

  /**
   * Check if cached token is still usable
   */
  private isTokenUsable(tokenInfo: TokenInfo): boolean {
    const currentTime = Date.now();
    const expirationTime = tokenInfo.expirationTime.getTime();
    
    // Token is usable if it's not expired and doesn't need refresh soon
    return expirationTime > currentTime + this.TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Invalidate token cache for a user
   */
  invalidateUserToken(userId: string): void {
    this.tokenCache.delete(userId);
    this.refreshPromises.delete(userId);
  }

  /**
   * Clear all cached tokens
   */
  clearAllTokens(): void {
    this.tokenCache.clear();
    this.refreshPromises.clear();
  }

  /**
   * Get token expiration info
   */
  getTokenExpiration(userId: string): Date | null {
    const tokenInfo = this.tokenCache.get(userId);
    return tokenInfo ? tokenInfo.expirationTime : null;
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh(userId: string): boolean {
    const tokenInfo = this.tokenCache.get(userId);
    if (!tokenInfo) {
      return true;
    }

    const currentTime = Date.now();
    const expirationTime = tokenInfo.expirationTime.getTime();
    
    return (expirationTime - currentTime) < this.TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Batch validate multiple tokens
   */
  async batchValidateTokens(tokens: string[]): Promise<TokenValidationResult[]> {
    const validationPromises = tokens.map(token => this.validateToken(token));
    return Promise.all(validationPromises);
  }

  /**
   * Set up automatic token refresh for current user
   */
  setupAutoRefresh(): () => void {
    const user = auth.currentUser;
    if (!user) {
      return () => {};
    }

    const userId = user.uid;
    const tokenInfo = this.tokenCache.get(userId);
    
    if (!tokenInfo) {
      return () => {};
    }

    const currentTime = Date.now();
    const expirationTime = tokenInfo.expirationTime.getTime();
    const refreshTime = expirationTime - this.TOKEN_REFRESH_THRESHOLD;
    const timeUntilRefresh = refreshTime - currentTime;

    if (timeUntilRefresh <= 0) {
      // Token needs immediate refresh
      this.getUserToken(user, true).catch(console.error);
      return () => {};
    }

    const timeoutId = setTimeout(async () => {
      try {
        await this.getUserToken(user, true);
      } catch (error) {
        console.error('Auto token refresh failed:', error);
      }
    }, timeUntilRefresh);

    return () => clearTimeout(timeoutId);
  }

  /**
   * Get token statistics for monitoring
   */
  getTokenStats(): {
    cachedTokens: number;
    activeRefreshes: number;
    expiredTokens: number;
    tokensNeedingRefresh: number;
  } {
    const currentTime = Date.now();
    let expiredTokens = 0;
    let tokensNeedingRefresh = 0;

    for (const tokenInfo of this.tokenCache.values()) {
      const expirationTime = tokenInfo.expirationTime.getTime();
      
      if (expirationTime <= currentTime) {
        expiredTokens++;
      } else if ((expirationTime - currentTime) < this.TOKEN_REFRESH_THRESHOLD) {
        tokensNeedingRefresh++;
      }
    }

    return {
      cachedTokens: this.tokenCache.size,
      activeRefreshes: this.refreshPromises.size,
      expiredTokens,
      tokensNeedingRefresh
    };
  }

  /**
   * Map token-related errors
   */
  private mapTokenError(error: any): AuthError {
    const errorCode = error.code || 'unknown';
    
    switch (errorCode) {
      case 'auth/id-token-expired':
        return {
          code: AuthErrorCode.TOKEN_EXPIRED,
          message: 'Authentication token has expired'
        };
      
      case 'auth/id-token-revoked':
        return {
          code: AuthErrorCode.TOKEN_REVOKED,
          message: 'Authentication token has been revoked'
        };
      
      case 'auth/invalid-id-token':
        return {
          code: AuthErrorCode.TOKEN_INVALID,
          message: 'Invalid authentication token'
        };
      
      case 'auth/user-not-found':
        return {
          code: AuthErrorCode.ACCOUNT_NOT_FOUND,
          message: 'User account not found'
        };
      
      default:
        return {
          code: AuthErrorCode.INTERNAL_ERROR,
          message: error.message || 'Token validation failed'
        };
    }
  }
}

// Export singleton instance
export const tokenManager = new TokenManagerService();