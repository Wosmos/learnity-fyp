/**
 * Service Factory
 * Centralized service instantiation following DI principles
 */

import { FirebaseAuthService } from '@/lib/services/firebase-auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { HCaptchaService } from '@/lib/services/hcaptcha.service';
import { AppCheckService } from '@/lib/services/app-check.service';
import { RoleManagerService } from '@/lib/services/role-manager.service';
import { SecurityService } from '@/lib/services/security.service';
import { NotificationService } from '@/lib/services/notification.service';
import { SessionManagerService } from '@/lib/services/session-manager.service';
import { TokenManagerService } from '@/lib/services/token-manager.service';
import { CourseService } from '@/lib/services/course.service';

/**
 * Service container for dependency injection
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Register a service instance
   */
  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  /**
   * Get a service instance
   */
  get<T>(key: string): T {
    return this.services.get(key);
  }

  /**
   * Check if service is registered
   */
  has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
  }
}

/**
 * Service factory with singleton pattern and lazy loading
 */
export class ServiceFactory {
  private static container = ServiceContainer.getInstance();

  /**
   * Get Firebase Auth Service instance
   */
  static getFirebaseAuthService(): FirebaseAuthService {
    const key = 'FirebaseAuthService';
    if (!this.container.has(key)) {
      this.container.register(key, new FirebaseAuthService());
    }
    return this.container.get<FirebaseAuthService>(key);
  }

  /**
   * Get Database Service instance
   */
  static getDatabaseService(): DatabaseService {
    const key = 'DatabaseService';
    if (!this.container.has(key)) {
      this.container.register(key, new DatabaseService());
    }
    return this.container.get<DatabaseService>(key);
  }

  /**
   * Get HCaptcha Service instance
   */
  static getHCaptchaService(): HCaptchaService {
    const key = 'HCaptchaService';
    if (!this.container.has(key)) {
      this.container.register(key, new HCaptchaService());
    }
    return this.container.get<HCaptchaService>(key);
  }

  /**
   * Get App Check Service instance
   */
  static getAppCheckService(): AppCheckService {
    const key = 'AppCheckService';
    if (!this.container.has(key)) {
      this.container.register(key, new AppCheckService());
    }
    return this.container.get<AppCheckService>(key);
  }

  /**
   * Get Role Manager Service instance
   */
  static getRoleManagerService(): RoleManagerService {
    const key = 'RoleManagerService';
    if (!this.container.has(key)) {
      this.container.register(key, new RoleManagerService());
    }
    return this.container.get<RoleManagerService>(key);
  }

  /**
   * Get Security Service instance
   */
  static getSecurityService(): SecurityService {
    const key = 'SecurityService';
    if (!this.container.has(key)) {
      this.container.register(key, new SecurityService());
    }
    return this.container.get<SecurityService>(key);
  }

  /**
   * Get Notification Service instance
   */
  static getNotificationService(): NotificationService {
    const key = 'NotificationService';
    if (!this.container.has(key)) {
      this.container.register(key, new NotificationService());
    }
    return this.container.get<NotificationService>(key);
  }

  /**
   * Get Session Manager Service instance
   */
  static getSessionManagerService(): SessionManagerService {
    const key = 'SessionManagerService';
    if (!this.container.has(key)) {
      this.container.register(key, new SessionManagerService());
    }
    return this.container.get<SessionManagerService>(key);
  }

  /**
   * Get Token Manager Service instance
   */
  static getTokenManagerService(): TokenManagerService {
    const key = 'TokenManagerService';
    if (!this.container.has(key)) {
      this.container.register(key, new TokenManagerService());
    }
    return this.container.get<TokenManagerService>(key);
  }

  /**
   * Get Course Service instance
   */
  static getCourseService(): CourseService {
    const key = 'CourseService';
    if (!this.container.has(key)) {
      this.container.register(key, new CourseService());
    }
    return this.container.get<CourseService>(key);
  }

  /**
   * Get all common auth services at once
   */
  static getAuthServices() {
    return {
      firebaseAuthService: this.getFirebaseAuthService(),
      databaseService: this.getDatabaseService(),
      hcaptchaService: this.getHCaptchaService(),
      appCheckService: this.getAppCheckService(),
      roleManagerService: this.getRoleManagerService(),
      securityService: this.getSecurityService(),
    };
  }

  /**
   * Clear all service instances (useful for testing)
   */
  static clearAll(): void {
    this.container.clear();
  }

  /**
   * Register custom service instance
   */
  static register<T>(key: string, service: T): void {
    this.container.register(key, service);
  }

  /**
   * Get custom service instance
   */
  static get<T>(key: string): T {
    return this.container.get<T>(key);
  }
}
