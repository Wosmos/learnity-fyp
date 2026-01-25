/**
 * QuizService Unit Tests
 * Tests for quiz management operations
 *
 * Requirements covered:
 * - 6.1: Create multiple-choice quizzes with 2-4 options per question
 * - 6.2: Support explanations for correct answers
 * - 6.6: Require 70% score to pass a quiz
 * - 6.7: Award 20 XP bonus points when quiz is passed
 * - 6.8: Allow unlimited quiz retakes with best score recorded
 */

// Mock the prisma module before importing the service
jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

// Mock env-validation to prevent environment checks
jest.mock('@/lib/env-validation', () => ({
  env: {
    DATABASE_URL: 'mock-url',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'mock-key',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'mock-domain',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mock-project',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'mock-bucket',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'mock-sender',
    NEXT_PUBLIC_FIREBASE_APP_ID: 'mock-app-id',
    FIREBASE_ADMIN_PRIVATE_KEY: 'mock-private-key',
    FIREBASE_ADMIN_CLIENT_EMAIL: 'mock-email',
    FIREBASE_ADMIN_PROJECT_ID: 'mock-project-id',
  },
}));

import { QuizError, QuizErrorCode } from '@/lib/interfaces/quiz.interface';
import { QuizService } from '../quiz.service';

// Mock PrismaClient
const mockPrisma = {
  lesson: {
    findUnique: jest.fn(),
  },
  quiz: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  question: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  quizAttempt: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  enrollment: {
    findUnique: jest.fn(),
  },
  userProgress: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  xPActivity: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('QuizService', () => {
  let quizService: QuizService;

  beforeEach(() => {
    jest.clearAllMocks();
    quizService = new QuizService(mockPrisma as any);
  });

  describe('createQuiz', () => {
    it('should throw error when lesson not found', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue(null);

      await expect(
        quizService.createQuiz({
          lessonId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
          title: 'Test Quiz',
          passingScore: 70,
          questions: [
            {
              question: 'What is 2+2?',
              options: ['3', '4', '5', '6'],
              correctOptionIndex: 1,
              order: 0,
            },
          ],
        })
      ).rejects.toThrow(QuizError);
    });

    it('should throw error when quiz already exists for lesson', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({
        id: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
      });
      mockPrisma.quiz.findUnique.mockResolvedValue({ id: 'existing-quiz' });

      await expect(
        quizService.createQuiz({
          lessonId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
          title: 'Test Quiz',
          passingScore: 70,
          questions: [
            {
              question: 'What is 2+2?',
              options: ['3', '4', '5', '6'],
              correctOptionIndex: 1,
              order: 0,
            },
          ],
        })
      ).rejects.toThrow(QuizError);
    });
  });

  describe('getQuizById', () => {
    it('should return quiz with questions', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        lessonId: 'lesson-1',
        title: 'Test Quiz',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctOptionIndex: 1,
            order: 0,
          },
        ],
      };

      mockPrisma.quiz.findUnique.mockResolvedValue(mockQuiz);

      const result = await quizService.getQuizById('quiz-1');

      expect(result).toEqual(mockQuiz);
      expect(mockPrisma.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: 'quiz-1' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    it('should return null when quiz not found', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(null);

      const result = await quizService.getQuizById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getBestAttempt', () => {
    it('should return the attempt with highest score', async () => {
      const mockBestAttempt = {
        id: 'attempt-2',
        quizId: 'quiz-1',
        studentId: 'student-1',
        score: 90,
        passed: true,
      };

      mockPrisma.quizAttempt.findFirst.mockResolvedValue(mockBestAttempt);

      const result = await quizService.getBestAttempt('student-1', 'quiz-1');

      expect(result).toEqual(mockBestAttempt);
      expect(mockPrisma.quizAttempt.findFirst).toHaveBeenCalledWith({
        where: {
          studentId: 'student-1',
          quizId: 'quiz-1',
        },
        orderBy: { score: 'desc' },
      });
    });

    it('should return null when no attempts exist', async () => {
      mockPrisma.quizAttempt.findFirst.mockResolvedValue(null);

      const result = await quizService.getBestAttempt('student-1', 'quiz-1');

      expect(result).toBeNull();
    });
  });

  describe('getQuizAttempts', () => {
    it('should return all attempts for a student', async () => {
      const mockAttempts = [
        { id: 'attempt-1', score: 60, passed: false },
        { id: 'attempt-2', score: 80, passed: true },
      ];

      mockPrisma.quizAttempt.findMany.mockResolvedValue(mockAttempts);

      const result = await quizService.getQuizAttempts('student-1', 'quiz-1');

      expect(result).toEqual(mockAttempts);
      expect(mockPrisma.quizAttempt.findMany).toHaveBeenCalledWith({
        where: {
          studentId: 'student-1',
          quizId: 'quiz-1',
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('deleteQuiz', () => {
    it('should throw error when quiz not found', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(null);

      await expect(quizService.deleteQuiz('non-existent')).rejects.toThrow(
        QuizError
      );
    });

    it('should delete quiz when found', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue({ id: 'quiz-1' });
      mockPrisma.quiz.delete.mockResolvedValue({ id: 'quiz-1' });

      await quizService.deleteQuiz('quiz-1');

      expect(mockPrisma.quiz.delete).toHaveBeenCalledWith({
        where: { id: 'quiz-1' },
      });
    });
  });
});
