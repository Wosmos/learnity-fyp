/**
 * Mock Object Factories
 * Factories for creating mock data for testing
 */

import { UserRole } from '../../src/types/auth';

export class MockUserFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `user-${Math.random().toString(36).substring(7)}`,
      firebaseUid: `firebase-${Math.random().toString(36).substring(7)}`,
      email: `user-${Math.random().toString(36).substring(7)}@example.com`,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.STUDENT,
      emailVerified: true,
      profilePicture: null,
      authProvider: 'email',
      socialProviders: [],
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createStudent(overrides: Partial<any> = {}) {
    return this.create({
      role: UserRole.STUDENT,
      studentProfile: MockStudentProfileFactory.create(),
      ...overrides
    });
  }

  static createTeacher(overrides: Partial<any> = {}) {
    return this.create({
      role: UserRole.TEACHER,
      teacherProfile: MockTeacherProfileFactory.create(),
      ...overrides
    });
  }

  static createAdmin(overrides: Partial<any> = {}) {
    return this.create({
      role: UserRole.ADMIN,
      adminProfile: MockAdminProfileFactory.create(),
      ...overrides
    });
  }

  static createPendingTeacher(overrides: Partial<any> = {}) {
    return this.create({
      role: UserRole.PENDING_TEACHER,
      teacherProfile: MockTeacherProfileFactory.create({
        applicationStatus: 'PENDING'
      }),
      ...overrides
    });
  }

  static createBatch(count: number, role: UserRole = UserRole.STUDENT) {
    return Array.from({ length: count }, () => {
      switch (role) {
        case UserRole.STUDENT:
          return this.createStudent();
        case UserRole.TEACHER:
          return this.createTeacher();
        case UserRole.ADMIN:
          return this.createAdmin();
        case UserRole.PENDING_TEACHER:
          return this.createPendingTeacher();
        default:
          return this.create({ role });
      }
    });
  }
}

export class MockStudentProfileFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `student-profile-${Math.random().toString(36).substring(7)}`,
      userId: 'user-id',
      gradeLevel: '10th Grade',
      subjects: ['Mathematics', 'Science', 'English'],
      learningGoals: ['Improve problem-solving skills', 'Master calculus'],
      interests: ['Technology', 'Sports', 'Music'],
      studyPreferences: ['Visual learning', 'Group study'],
      bio: 'Passionate student interested in STEM fields',
      profileCompletionPercentage: 85,
      profileVisibility: 'PUBLIC',
      showEmail: false,
      showLearningGoals: true,
      showInterests: true,
      showProgress: true,
      allowMessages: true,
      ...overrides
    };
  }

  static createIncomplete(overrides: Partial<any> = {}) {
    return this.create({
      learningGoals: [],
      interests: [],
      studyPreferences: [],
      profileCompletionPercentage: 20,
      ...overrides
    });
  }

  static createPrivate(overrides: Partial<any> = {}) {
    return this.create({
      profileVisibility: 'PRIVATE',
      showEmail: false,
      showLearningGoals: false,
      showInterests: false,
      showProgress: false,
      allowMessages: false,
      ...overrides
    });
  }
}

export class MockTeacherProfileFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `teacher-profile-${Math.random().toString(36).substring(7)}`,
      userId: 'user-id',
      applicationStatus: 'APPROVED',
      qualifications: ['PhD in Mathematics', 'Teaching Certificate'],
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      experience: 8,
      bio: 'Experienced educator with passion for helping students succeed',
      hourlyRate: 75,
      documents: ['degree.pdf', 'certificate.pdf'],
      rating: 4.8,
      reviewCount: 42,
      responseTime: '<1hr',
      availability: 'Available today',
      languages: ['English', 'Spanish'],
      timezone: 'America/New_York',
      videoIntroUrl: 'https://example.com/intro.mp4',
      lessonsCompleted: 156,
      activeStudents: 23,
      teachingStyle: 'Interactive and engaging',
      specialties: ['Algebra', 'Calculus', 'SAT Prep'],
      certifications: ['State Teaching License', 'Math Specialist'],
      education: ['PhD Mathematics - Stanford University', 'MS Education - Harvard'],
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      preferredTimes: ['Morning', 'Afternoon'],
      headline: 'Expert Math Tutor - Making Complex Concepts Simple',
      achievements: ['Top Rated Teacher 2023', 'Student Choice Award'],
      teachingApproach: 'I believe in personalized learning approaches that adapt to each student\'s unique learning style.',
      trustBadges: ['Verified ID', 'Background Check', 'Top Rated'],
      faqs: [
        { question: 'What is your teaching style?', answer: 'I focus on interactive learning with real-world applications.' },
        { question: 'Do you offer trial lessons?', answer: 'Yes, I offer a 30-minute trial lesson at half price.' }
      ],
      sampleLessons: [
        { title: 'Introduction to Algebra', description: 'Basic algebraic concepts', duration: '60 minutes' },
        { title: 'Calculus Fundamentals', description: 'Limits and derivatives', duration: '90 minutes' }
      ],
      successStories: [
        { studentName: 'Sarah M.', achievement: 'Improved grade from C to A', subject: 'Algebra' },
        { studentName: 'Mike L.', achievement: 'Passed AP Calculus exam', subject: 'Calculus' }
      ],
      whyChooseMe: [
        'Personalized learning approach',
        'Proven track record of student success',
        'Flexible scheduling options',
        'Interactive teaching methods'
      ],
      submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      reviewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      approvedBy: 'admin-user-id',
      rejectionReason: null,
      ...overrides
    };
  }

  static createPending(overrides: Partial<any> = {}) {
    return this.create({
      applicationStatus: 'PENDING',
      rating: 0,
      reviewCount: 0,
      lessonsCompleted: 0,
      activeStudents: 0,
      reviewedAt: null,
      approvedBy: null,
      ...overrides
    });
  }

  static createRejected(overrides: Partial<any> = {}) {
    return this.create({
      applicationStatus: 'REJECTED',
      reviewedAt: new Date(),
      rejectionReason: 'Insufficient qualifications',
      ...overrides
    });
  }

  static createTopRated(overrides: Partial<any> = {}) {
    return this.create({
      rating: 4.9,
      reviewCount: 100,
      lessonsCompleted: 500,
      activeStudents: 50,
      trustBadges: ['Verified ID', 'Background Check', 'Top Rated', 'Expert'],
      ...overrides
    });
  }
}

export class MockAdminProfileFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `admin-profile-${Math.random().toString(36).substring(7)}`,
      userId: 'user-id',
      department: 'Platform Management',
      isStatic: false,
      createdBy: 'system',
      ...overrides
    };
  }

  static createStatic(overrides: Partial<any> = {}) {
    return this.create({
      isStatic: true,
      createdBy: null,
      ...overrides
    });
  }
}

export class MockFirebaseUserFactory {
  static create(overrides: Partial<any> = {}) {
    const uid = `firebase-${Math.random().toString(36).substring(7)}`;
    return {
      uid,
      email: `user-${uid}@example.com`,
      displayName: 'Test User',
      photoURL: null,
      emailVerified: true,
      phoneNumber: null,
      providerId: 'firebase',
      providerData: [],
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
      getIdTokenResult: jest.fn().mockResolvedValue({
        token: 'mock-id-token',
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        claims: { role: UserRole.STUDENT }
      }),
      reload: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      ...overrides
    };
  }

  static createWithRole(role: UserRole, overrides: Partial<any> = {}) {
    return this.create({
      getIdTokenResult: jest.fn().mockResolvedValue({
        token: 'mock-id-token',
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        claims: { role }
      }),
      ...overrides
    });
  }
}

export class MockAPIResponseFactory {
  static success(data: any = {}, message: string = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message: string = 'Error occurred', code: string = 'UNKNOWN_ERROR', details?: any) {
    return {
      success: false,
      error: message,
      code,
      details,
      timestamp: new Date().toISOString()
    };
  }

  static validationError(field: string, message: string) {
    return this.error('Validation failed', 'VALIDATION_ERROR', {
      field,
      message
    });
  }

  static authError(code: string = 'UNAUTHORIZED') {
    return this.error('Authentication failed', code);
  }

  static notFound(resource: string = 'Resource') {
    return this.error(`${resource} not found`, 'NOT_FOUND');
  }
}

export class MockAuditLogFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `audit-${Math.random().toString(36).substring(7)}`,
      userId: 'user-id',
      firebaseUid: 'firebase-uid',
      eventType: 'AUTH_LOGIN',
      action: 'User login',
      resource: 'auth',
      oldValues: null,
      newValues: { loginTime: new Date() },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      deviceFingerprint: 'device-fingerprint-123',
      success: true,
      errorMessage: null,
      metadata: {},
      createdAt: new Date(),
      ...overrides
    };
  }

  static createFailure(overrides: Partial<any> = {}) {
    return this.create({
      success: false,
      errorMessage: 'Operation failed',
      ...overrides
    });
  }
}

export class MockSecurityEventFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `security-${Math.random().toString(36).substring(7)}`,
      userId: 'user-id',
      firebaseUid: 'firebase-uid',
      eventType: 'SUSPICIOUS_LOGIN',
      riskLevel: 'MEDIUM',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      deviceFingerprint: 'device-fingerprint-123',
      blocked: false,
      reason: 'Login from new device',
      metadata: { newDevice: true },
      createdAt: new Date(),
      ...overrides
    };
  }

  static createBlocked(overrides: Partial<any> = {}) {
    return this.create({
      riskLevel: 'HIGH',
      blocked: true,
      reason: 'Multiple failed login attempts',
      ...overrides
    });
  }
}