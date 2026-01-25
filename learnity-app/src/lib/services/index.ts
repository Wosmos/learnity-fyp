// Firebase Auth Services
// Note: FirebaseAuthService is for SERVER-SIDE use (API routes)
// ClientAuthService is for CLIENT-SIDE use (React components/hooks)
export { FirebaseAuthService } from './firebase-auth.service';
export { ClientAuthService, clientAuthService } from './client-auth.service';
export { AppCheckService, appCheckService } from './app-check.service';
export { TokenManagerService, tokenManager } from './token-manager.service';
export { RoleManagerService, roleManager } from './role-manager.service';
export {
  SessionManagerService,
  sessionManager,
} from './session-manager.service';

// Other Services
export { HCaptchaService } from './hcaptcha.service';
export { SyncService } from './sync.service';
export { SecurityService, securityService } from './security.service';
export { DatabaseService } from './database.service';
export { CourseService, courseService } from './course.service';
export { SectionService, sectionService } from './section.service';
export { LessonService, lessonService } from './lesson.service';
export { EnrollmentService, enrollmentService } from './enrollment.service';
export { ProgressService, progressService } from './progress.service';
export { QuizService, quizService } from './quiz.service';
export { ReviewService, reviewService } from './review.service';
export { CertificateService, certificateService } from './certificate.service';
export {
  GamificationService,
  gamificationService,
} from './gamification.service';

// Service Instances (Singletons)
// Note: FirebaseAuthService should be instantiated where needed to avoid circular dependencies

// Re-export types for convenience
export type { TokenInfo, TokenValidationResult } from './token-manager.service';

export type { AppCheckResult } from './app-check.service';

export type {
  ISessionManagerService,
  UserSession,
  SessionPayload,
  DeviceInfo,
  SessionStats,
} from '../interfaces/session.interface';
