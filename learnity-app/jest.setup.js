// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock environment variables
process.env.ACCESS_TOKEN_SECRET = 'test-access-token-secret-key-for-testing';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-key-for-testing';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock Firebase Admin
jest.mock('./src/lib/config/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
    revokeRefreshTokens: jest.fn(),
  },
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $disconnect: jest.fn(),
  })),
}));

// Mock security service
jest.mock('./src/lib/services/security.service', () => ({
  securityService: {
    logSecurityEvent: jest.fn(),
    logAuthEvent: jest.fn(),
  },
}));
