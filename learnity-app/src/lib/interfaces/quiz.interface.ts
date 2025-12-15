/**
 * Quiz Service Interface
 * Defines the contract for quiz management operations
 * 
 * Requirements covered:
 * - 6.1: Create multiple-choice quizzes with 2-4 options per question
 * - 6.2: Support explanations for correct answers
 * - 6.3: Display one question at a time with progress indicator
 * - 6.4: Provide immediate feedback showing correct/incorrect
 * - 6.5: Display final score and review of answers
 * - 6.6: Require 70% score to pass a quiz
 * - 6.7: Award 20 XP bonus points when quiz is passed
 * - 6.8: Allow unlimited quiz retakes with best score recorded
 * - 6.9: Track quiz attempts, scores, and time taken
 */

import { Quiz, Question, QuizAttempt } from '@prisma/client';
import { 
  CreateQuizData, 
  UpdateQuizData, 
  QuizAnswerData,
  CreateQuestionData,
  UpdateQuestionData,
} from '@/lib/validators/quiz';

// ============================================
// QUIZ DTOs AND TYPES
// ============================================

/**
 * Quiz with all questions included
 */
export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

/**
 * Quiz attempt with detailed answer information
 */
export interface QuizAttemptWithDetails extends QuizAttempt {
  quiz: Quiz;
}

/**
 * Individual answer result for quiz submission
 */
export interface AnswerResult {
  questionId: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation?: string | null;
}

/**
 * Result of submitting a quiz attempt
 */
export interface QuizSubmissionResult {
  attempt: QuizAttempt;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  answerResults: AnswerResult[];
  xpAwarded?: number;
}

/**
 * Quiz statistics for a student
 */
export interface QuizStats {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  passed: boolean;
  firstPassedAt?: Date;
}

// ============================================
// QUIZ SERVICE INTERFACE
// ============================================

/**
 * IQuizService - Quiz management operations interface
 * Implements all quiz-related business logic
 */
export interface IQuizService {
  /**
   * Create a new quiz for a lesson
   * @param data - Quiz creation data including questions
   * @returns The created quiz with questions
   * Requirements: 6.1, 6.2
   */
  createQuiz(data: CreateQuizData): Promise<QuizWithQuestions>;

  /**
   * Update an existing quiz
   * @param quizId - The quiz ID
   * @param data - Quiz update data
   * @returns The updated quiz
   * Requirements: 6.1, 6.2
   */
  updateQuiz(quizId: string, data: UpdateQuizData): Promise<Quiz>;

  /**
   * Delete a quiz
   * @param quizId - The quiz ID
   * Requirements: 6.1
   */
  deleteQuiz(quizId: string): Promise<void>;

  /**
   * Get a quiz by lesson ID
   * @param lessonId - The lesson ID
   * @returns The quiz with questions or null
   */
  getQuizByLesson(lessonId: string): Promise<QuizWithQuestions | null>;

  /**
   * Get a quiz by ID
   * @param quizId - The quiz ID
   * @returns The quiz with questions or null
   */
  getQuizById(quizId: string): Promise<QuizWithQuestions | null>;

  /**
   * Submit a quiz attempt
   * @param studentId - The student ID
   * @param quizId - The quiz ID
   * @param answers - Array of answers
   * @param timeTaken - Time taken in seconds
   * @returns The quiz submission result
   * Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.9
   */
  submitQuizAttempt(
    studentId: string,
    quizId: string,
    answers: QuizAnswerData[],
    timeTaken?: number
  ): Promise<QuizSubmissionResult>;

  /**
   * Get all quiz attempts for a student
   * @param studentId - The student ID
   * @param quizId - The quiz ID
   * @returns Array of quiz attempts
   * Requirements: 6.8
   */
  getQuizAttempts(studentId: string, quizId: string): Promise<QuizAttempt[]>;

  /**
   * Get the best quiz attempt for a student
   * @param studentId - The student ID
   * @param quizId - The quiz ID
   * @returns The best attempt or null
   * Requirements: 6.8
   */
  getBestAttempt(studentId: string, quizId: string): Promise<QuizAttempt | null>;

  /**
   * Get quiz statistics for a student
   * @param studentId - The student ID
   * @param quizId - The quiz ID
   * @returns Quiz statistics
   */
  getQuizStats(studentId: string, quizId: string): Promise<QuizStats>;

  /**
   * Add a question to an existing quiz
   * @param quizId - The quiz ID
   * @param data - Question data
   * @returns The created question
   */
  addQuestion(quizId: string, data: CreateQuestionData): Promise<Question>;

  /**
   * Update a question
   * @param questionId - The question ID
   * @param data - Question update data
   * @returns The updated question
   */
  updateQuestion(questionId: string, data: UpdateQuestionData): Promise<Question>;

  /**
   * Delete a question
   * @param questionId - The question ID
   */
  deleteQuestion(questionId: string): Promise<void>;

  /**
   * Reorder questions in a quiz
   * @param quizId - The quiz ID
   * @param questionIds - Array of question IDs in new order
   */
  reorderQuestions(quizId: string, questionIds: string[]): Promise<void>;
}

// ============================================
// QUIZ ERROR TYPES
// ============================================

/**
 * Quiz error codes for specific error handling
 */
export enum QuizErrorCode {
  // Validation errors
  INVALID_QUIZ_DATA = 'INVALID_QUIZ_DATA',
  INVALID_QUESTION_DATA = 'INVALID_QUESTION_DATA',
  INVALID_ANSWER_DATA = 'INVALID_ANSWER_DATA',
  TOO_FEW_OPTIONS = 'TOO_FEW_OPTIONS',
  TOO_MANY_OPTIONS = 'TOO_MANY_OPTIONS',
  INVALID_CORRECT_INDEX = 'INVALID_CORRECT_INDEX',
  
  // Business logic errors
  QUIZ_NOT_FOUND = 'QUIZ_NOT_FOUND',
  QUESTION_NOT_FOUND = 'QUESTION_NOT_FOUND',
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  QUIZ_ALREADY_EXISTS = 'QUIZ_ALREADY_EXISTS',
  NOT_ENROLLED = 'NOT_ENROLLED',
  MISSING_ANSWERS = 'MISSING_ANSWERS',
  DUPLICATE_ANSWERS = 'DUPLICATE_ANSWERS',
  
  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Custom error class for quiz-related errors
 */
export class QuizError extends Error {
  constructor(
    message: string,
    public code: QuizErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'QuizError';
  }
}
