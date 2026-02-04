/**
 * Quiz Service Implementation
 * Handles all quiz management operations
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

import {
  PrismaClient,
  Quiz,
  Question,
  QuizAttempt,
  XPReason,
  EnrollmentStatus,
} from '@prisma/client';
import {
  IQuizService,
  QuizWithQuestions,
  QuizSubmissionResult,
  QuizStats,
  AnswerResult,
  QuizError,
  QuizErrorCode,
} from '@/lib/interfaces/quiz.interface';
import {
  CreateQuizData,
  UpdateQuizData,
  QuizAnswerData,
  CreateQuestionData,
  UpdateQuestionData,
  CreateQuizSchema,
  UpdateQuizSchema,
  CreateQuestionSchema,
  UpdateQuestionSchema,
} from '@/lib/validators/quiz';
import { prisma as defaultPrisma } from '@/lib/prisma';

/** Default passing score percentage */
const DEFAULT_PASSING_SCORE = 70;

/** XP awarded for passing a quiz */
const QUIZ_PASS_XP = 20;

/**
 * QuizService - Implements quiz management business logic
 * Uses dependency injection for PrismaClient
 */
export class QuizService implements IQuizService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Create a new quiz for a lesson
   * Requirements: 6.1, 6.2
   */
  async createQuiz(data: CreateQuizData): Promise<QuizWithQuestions> {
    // Validate input with Zod schema
    const validatedData = CreateQuizSchema.parse(data);

    // Verify lesson exists
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: validatedData.lessonId },
    });

    if (!lesson) {
      throw new QuizError(
        'Lesson not found',
        QuizErrorCode.LESSON_NOT_FOUND,
        404
      );
    }

    // Check if quiz already exists for this lesson
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { lessonId: validatedData.lessonId },
    });

    if (existingQuiz) {
      throw new QuizError(
        'A quiz already exists for this lesson',
        QuizErrorCode.QUIZ_ALREADY_EXISTS,
        409
      );
    }

    // Create quiz with questions in a transaction
    const quiz = await this.prisma.$transaction(async tx => {
      // Create the quiz
      const createdQuiz = await tx.quiz.create({
        data: {
          lessonId: validatedData.lessonId,
          title: validatedData.title,
          description: validatedData.description,
          passingScore: validatedData.passingScore ?? DEFAULT_PASSING_SCORE,
        },
      });

      // Create questions
      const questions = await Promise.all(
        validatedData.questions.map((q, index) =>
          tx.question.create({
            data: {
              quizId: createdQuiz.id,
              question: q.question,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              explanation: q.explanation,
              order: q.order ?? index,
            },
          })
        )
      );

      return {
        ...createdQuiz,
        questions,
      };
    });

    return quiz as QuizWithQuestions;
  }

  /**
   * Update an existing quiz
   * Requirements: 6.1, 6.2
   */
  async updateQuiz(quizId: string, data: UpdateQuizData): Promise<Quiz> {
    // Validate input
    const validatedData = UpdateQuizSchema.parse(data);

    // Verify quiz exists
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      throw new QuizError('Quiz not found', QuizErrorCode.QUIZ_NOT_FOUND, 404);
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.passingScore !== undefined)
      updateData.passingScore = validatedData.passingScore;

    // Update quiz
    const quiz = await this.prisma.quiz.update({
      where: { id: quizId },
      data: updateData,
    });

    return quiz;
  }

  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId: string): Promise<void> {
    // Verify quiz exists
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      throw new QuizError('Quiz not found', QuizErrorCode.QUIZ_NOT_FOUND, 404);
    }

    // Delete quiz (cascades to questions and attempts)
    await this.prisma.quiz.delete({
      where: { id: quizId },
    });
  }

  /**
   * Get a quiz by lesson ID
   */
  async getQuizByLesson(lessonId: string): Promise<QuizWithQuestions | null> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return quiz as QuizWithQuestions | null;
  }

  /**
   * Get a quiz by ID
   */
  async getQuizById(quizId: string): Promise<QuizWithQuestions | null> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return quiz as QuizWithQuestions | null;
  }

  /**
   * Submit a quiz attempt
   * Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.9
   */
  async submitQuizAttempt(
    studentId: string,
    quizId: string,
    answers: QuizAnswerData[],
    timeTaken: number = 0
  ): Promise<QuizSubmissionResult> {
    // Get quiz with questions
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        lesson: {
          include: {
            section: {
              include: {
                course: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new QuizError('Quiz not found', QuizErrorCode.QUIZ_NOT_FOUND, 404);
    }

    const courseId = quiz.lesson.section.course.id;

    // Verify student is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new QuizError(
        'You must be enrolled in this course to take quizzes',
        QuizErrorCode.NOT_ENROLLED,
        403
      );
    }

    // Validate answers - check for missing or duplicate answers
    const questionIds = quiz.questions.map(q => q.id);
    const answeredQuestionIds = answers.map(a => a.questionId);

    // Check for duplicate answers
    const uniqueAnsweredIds = new Set(answeredQuestionIds);
    if (uniqueAnsweredIds.size !== answeredQuestionIds.length) {
      throw new QuizError(
        'Duplicate answers detected',
        QuizErrorCode.DUPLICATE_ANSWERS,
        400
      );
    }

    // Check for missing answers
    const missingQuestions = questionIds.filter(
      id => !uniqueAnsweredIds.has(id)
    );
    if (missingQuestions.length > 0) {
      throw new QuizError(
        `Missing answers for ${missingQuestions.length} question(s)`,
        QuizErrorCode.MISSING_ANSWERS,
        400
      );
    }

    // Create a map of questions for quick lookup
    const questionMap = new Map(quiz.questions.map(q => [q.id, q]));

    // Calculate score and build answer results
    let correctAnswers = 0;
    const answerResults: AnswerResult[] = [];
    const answersJson: Array<{
      questionId: string;
      selectedIndex: number;
      isCorrect: boolean;
    }> = [];

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        throw new QuizError(
          `Question ${answer.questionId} not found in this quiz`,
          QuizErrorCode.QUESTION_NOT_FOUND,
          400
        );
      }

      const isCorrect =
        answer.selectedOptionIndex === question.correctOptionIndex;
      if (isCorrect) {
        correctAnswers++;
      }

      answerResults.push({
        questionId: question.id,
        selectedOptionIndex: answer.selectedOptionIndex,
        correctOptionIndex: question.correctOptionIndex,
        isCorrect,
        explanation: question.explanation,
      });

      answersJson.push({
        questionId: question.id,
        selectedIndex: answer.selectedOptionIndex,
        isCorrect,
      });
    }

    // Calculate score percentage
    const totalQuestions = quiz.questions.length;
    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    // Determine if passed (70% threshold - Requirement 6.6)
    const passed = score >= quiz.passingScore;

    // Create quiz attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        studentId,
        score,
        passed,
        answers: answersJson,
        timeTaken,
      },
    });

    // Award XP if passed (Requirement 6.7)
    let xpAwarded: number | undefined;
    if (passed) {
      // Check if this is the first time passing
      const previousPassedAttempt = await this.prisma.quizAttempt.findFirst({
        where: {
          quizId,
          studentId,
          passed: true,
          id: { not: attempt.id },
        },
      });

      // Only award XP on first pass
      if (!previousPassedAttempt) {
        xpAwarded = await this.awardQuizXP(studentId, quizId);
      }
    }

    return {
      attempt,
      score,
      passed,
      totalQuestions,
      correctAnswers,
      answerResults,
      xpAwarded,
    };
  }

  /**
   * Get all quiz attempts for a student
   * Requirements: 6.8
   */
  async getQuizAttempts(
    studentId: string,
    quizId: string
  ): Promise<QuizAttempt[]> {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: {
        studentId,
        quizId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return attempts;
  }

  /**
   * Get the best quiz attempt for a student
   * Requirements: 6.8
   */
  async getBestAttempt(
    studentId: string,
    quizId: string
  ): Promise<QuizAttempt | null> {
    const bestAttempt = await this.prisma.quizAttempt.findFirst({
      where: {
        studentId,
        quizId,
      },
      orderBy: { score: 'desc' },
    });

    return bestAttempt;
  }

  /**
   * Get quiz statistics for a student
   */
  async getQuizStats(studentId: string, quizId: string): Promise<QuizStats> {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: {
        studentId,
        quizId,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
        passed: false,
      };
    }

    const totalAttempts = attempts.length;
    const bestScore = Math.max(...attempts.map(a => a.score));
    const averageScore = Math.round(
      attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
    );
    const passedAttempt = attempts.find(a => a.passed);

    return {
      totalAttempts,
      bestScore,
      averageScore,
      passed: !!passedAttempt,
      firstPassedAt: passedAttempt?.createdAt,
    };
  }

  /**
   * Add a question to an existing quiz
   */
  async addQuestion(
    quizId: string,
    data: CreateQuestionData
  ): Promise<Question> {
    // Validate input
    const validatedData = CreateQuestionSchema.parse(data);

    // Verify quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          select: { order: true },
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    });

    if (!quiz) {
      throw new QuizError('Quiz not found', QuizErrorCode.QUIZ_NOT_FOUND, 404);
    }

    // Determine order (append to end if not specified)
    const maxOrder = quiz.questions[0]?.order ?? -1;
    const order = validatedData.order ?? maxOrder + 1;

    // Create question
    const question = await this.prisma.question.create({
      data: {
        quizId,
        question: validatedData.question,
        options: validatedData.options,
        correctOptionIndex: validatedData.correctOptionIndex,
        explanation: validatedData.explanation,
        order,
      },
    });

    return question;
  }

  /**
   * Update a question
   */
  async updateQuestion(
    questionId: string,
    data: UpdateQuestionData
  ): Promise<Question> {
    // Validate input
    const validatedData = UpdateQuestionSchema.parse(data);

    // Verify question exists
    const existingQuestion = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      throw new QuizError(
        'Question not found',
        QuizErrorCode.QUESTION_NOT_FOUND,
        404
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (validatedData.question !== undefined)
      updateData.question = validatedData.question;
    if (validatedData.options !== undefined)
      updateData.options = validatedData.options;
    if (validatedData.correctOptionIndex !== undefined) {
      updateData.correctOptionIndex = validatedData.correctOptionIndex;
    }
    if (validatedData.explanation !== undefined)
      updateData.explanation = validatedData.explanation;
    if (validatedData.order !== undefined)
      updateData.order = validatedData.order;

    // Validate correctOptionIndex against options if both are being updated
    if (
      validatedData.options &&
      validatedData.correctOptionIndex !== undefined
    ) {
      if (validatedData.correctOptionIndex >= validatedData.options.length) {
        throw new QuizError(
          'Correct option index must be within the options array bounds',
          QuizErrorCode.INVALID_CORRECT_INDEX,
          400
        );
      }
    }

    // Update question
    const question = await this.prisma.question.update({
      where: { id: questionId },
      data: updateData,
    });

    return question;
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: string): Promise<void> {
    // Verify question exists
    const existingQuestion = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      throw new QuizError(
        'Question not found',
        QuizErrorCode.QUESTION_NOT_FOUND,
        404
      );
    }

    // Delete question
    await this.prisma.question.delete({
      where: { id: questionId },
    });
  }

  /**
   * Reorder questions in a quiz
   */
  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void> {
    // Verify quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          select: { id: true },
        },
      },
    });

    if (!quiz) {
      throw new QuizError('Quiz not found', QuizErrorCode.QUIZ_NOT_FOUND, 404);
    }

    // Verify all question IDs belong to this quiz
    const existingIds = new Set(quiz.questions.map(q => q.id));
    for (const id of questionIds) {
      if (!existingIds.has(id)) {
        throw new QuizError(
          `Question ${id} does not belong to this quiz`,
          QuizErrorCode.QUESTION_NOT_FOUND,
          400
        );
      }
    }

    // Update order for each question
    await this.prisma.$transaction(
      questionIds.map((id, index) =>
        this.prisma.question.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Award XP for passing a quiz
   * @private
   */
  private async awardQuizXP(
    studentId: string,
    quizId: string
  ): Promise<number> {
    // Get or create user progress
    let userProgress = await this.prisma.userProgress.findUnique({
      where: { userId: studentId },
    });

    if (!userProgress) {
      userProgress = await this.prisma.userProgress.create({
        data: {
          userId: studentId,
          totalXP: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    // Award XP in a transaction
    await this.prisma.$transaction([
      // Update total XP
      this.prisma.userProgress.update({
        where: { userId: studentId },
        data: {
          totalXP: { increment: QUIZ_PASS_XP },
          lastActivityAt: new Date(),
        },
      }),
      // Log XP activity
      this.prisma.xPActivity.create({
        data: {
          userId: studentId,
          amount: QUIZ_PASS_XP,
          reason: XPReason.QUIZ_PASS,
          sourceId: quizId,
        },
      }),
    ]);

    return QUIZ_PASS_XP;
  }
}

// Export singleton instance
export const quizService = new QuizService();
