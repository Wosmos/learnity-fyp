// Firebase Auth Services
export { FirebaseAuthService } from './firebase-auth.service';
export { AppCheckService, appCheckService } from './app-check.service';
export { TokenManagerService, tokenManager } from './token-manager.service';
export { RoleManagerService, roleManager } from './role-manager.service';

// Other Services
export { HCaptchaService } from './hcaptcha.service';
export { SyncService } from './sync.service';
export { SecurityService, securityService } from './security.service';
export { DatabaseService } from './database.service';

// Service Instances (Singletons)
// Note: FirebaseAuthService should be instantiated where needed to avoid circular dependencies

// Re-export types for convenience
export type {
  TokenInfo,
  TokenValidationResult
} from './token-manager.service';

export type {
  AppCheckResult
} from './app-check.service';