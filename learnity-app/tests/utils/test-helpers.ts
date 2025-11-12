/**
 * Common Test Helper Functions
 * Shared utilities for testing across the application
 */

import { UserRole } from '../../src/types/auth';

// Mock user data factories
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-id',
  firebaseUid: 'test-firebase-uid',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
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
});

export const createMockStudentProfile = (overrides: Partial<any> = {}) => ({
  id: 'test-student-profile-id',
  userId: 'test-user-id',
  gradeLevel: '10th Grade',
  subjects: ['Mathematics', 'Science'],
  learningGoals: ['Improve math skills'],
  interests: ['Technology', 'Sports'],
  studyPreferences: ['Visual learning'],
  profileCompletionPercentage: 80,
  profileVisibility: 'PUBLIC',
  showEmail: false,
  showLearningGoals: true,
  showInterests: true,
  showProgress: true,
  allowMessages: true,
  ...overrides
});

export const createMockTeacherProfile = (overrides: Partial<any> = {}) => ({
  id: 'test-teacher-profile-id',
  userId: 'test-user-id',
  applicationStatus: 'APPROVED',
  qualifications: ['PhD in Mathematics'],
  subjects: ['Mathematics', 'Physics'],
  experience: 5,
  bio: 'Experienced math teacher',
  hourlyRate: 50,
  documents: [],
  rating: 4.8,
  reviewCount: 25,
  responseTime: '<1hr',
  availability: 'Available today',
  languages: ['English'],
  timezone: 'UTC',
  lessonsCompleted: 100,
  activeStudents: 15,
  teachingStyle: 'Interactive',
  specialties: ['Algebra', 'Calculus'],
  certifications: ['Teaching Certificate'],
  education: ['PhD Mathematics - MIT'],
  availableDays: ['Monday', 'Tuesday', 'Wednesday'],
  preferredTimes: ['Morning', 'Afternoon'],
  headline: 'Expert Math Tutor',
  achievements: ['Top Rated Teacher'],
  teachingApproach: 'Student-centered learning',
  trustBadges: ['Verified ID', 'Background Check'],
  submittedAt: new Date(),
  reviewedAt: new Date(),
  approvedBy: 'admin',
  rejectionReason: null,
  ...overrides
});

export const createMockAdminProfile = (overrides: Partial<any> = {}) => ({
  id: 'test-admin-profile-id',
  userId: 'test-user-id',
  department: 'Platform Management',
  isStatic: false,
  createdBy: 'system',
  ...overrides
});

// Mock Firebase User
export const createMockFirebaseUser = (overrides: Partial<any> = {}) => ({
  uid: 'test-firebase-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  phoneNumber: null,
  providerId: 'firebase',
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: jest.fn().mockResolvedValue({
    token: 'mock-id-token',
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    claims: { role: UserRole.STUDENT }
  }),
  reload: jest.fn().mockResolvedValue(undefined),
  ...overrides
});

// Mock Request object for API testing
export const createMockRequest = (options: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  url?: string;
} = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    url = 'http://localhost:3000/api/test'
  } = options;

  return {
    method,
    url,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
      ...headers
    },
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    formData: jest.fn().mockResolvedValue(new FormData()),
  } as any;
};

// Mock NextResponse for API testing
export const createMockResponse = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
  headers: new Map(),
});

// Database test helpers
export const cleanupTestData = async (prisma: any) => {
  // Clean up test data in reverse dependency order
  await prisma.auditLog.deleteMany({
    where: { firebaseUid: { startsWith: 'test-' } }
  });
  
  await prisma.securityEvent.deleteMany({
    where: { firebaseUid: { startsWith: 'test-' } }
  });
  
  await prisma.studentProfile.deleteMany({
    where: { user: { firebaseUid: { startsWith: 'test-' } } }
  });
  
  await prisma.teacherProfile.deleteMany({
    where: { user: { firebaseUid: { startsWith: 'test-' } } }
  });
  
  await prisma.adminProfile.deleteMany({
    where: { user: { firebaseUid: { startsWith: 'test-' } } }
  });
  
  await prisma.user.deleteMany({
    where: { firebaseUid: { startsWith: 'test-' } }
  });
};

// Auth test helpers
export const mockAuthState = (user: any = null) => {
  const mockAuth = {
    currentUser: user,
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn().mockResolvedValue(undefined),
  };
  
  return mockAuth;
};

// Component test helpers
export const renderWithProviders = (component: React.ReactElement, options: any = {}) => {
  // This would typically wrap with providers like AuthProvider, etc.
  // Implementation depends on your testing library setup
  return component;
};

// API test helpers
export const createAuthHeaders = (firebaseUid: string, idToken: string = 'mock-token') => ({
  'Authorization': `Bearer ${idToken}`,
  'X-Firebase-UID': firebaseUid,
  'Content-Type': 'application/json'
});

// Validation test helpers
export const expectValidationError = (result: any, field: string) => {
  expect(result.success).toBe(false);
  expect(result.error.issues).toContainEqual(
    expect.objectContaining({
      path: expect.arrayContaining([field])
    })
  );
};

// Time helpers for testing
export const advanceTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

export const mockDate = (date: string | Date) => {
  const mockDate = new Date(date);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
  return mockDate;
};

// Error simulation helpers
export const simulateNetworkError = () => {
  throw new Error('Network request failed');
};

export const simulateDatabaseError = () => {
  throw new Error('Database connection failed');
};

export const simulateFirebaseError = (code: string) => {
  const error = new Error(`Firebase: ${code}`);
  (error as any).code = code;
  throw error;
};

// Test data generators
export const generateRandomEmail = () => 
  `test-${Math.random().toString(36).substring(7)}@example.com`;

export const generateRandomString = (length: number = 10) =>
  Math.random().toString(36).substring(2, 2 + length);

export const generateRandomUser = (role: UserRole = UserRole.STUDENT) =>
  createMockUser({
    id: generateRandomString(),
    firebaseUid: `test-${generateRandomString()}`,
    email: generateRandomEmail(),
    role
  });

// Performance test helpers
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    executionTime: end - start
  };
};

// Async test helpers
export const waitFor = (ms: number) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
) => {
  const start = Date.now();
  while (!condition() && Date.now() - start < timeout) {
    await waitFor(interval);
  }
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};