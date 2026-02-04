import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { aiService } from '@/lib/services/ai.service';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const cookieStore = cookies();
    const session = (await cookieStore).get('session')?.value;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(session);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { content, lessonTitle } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // 3. Generate quiz with AI
    const quizData = await aiService.generateQuizFromContent(
      content,
      lessonTitle || 'Lesson Quiz'
    );

    return NextResponse.json({
      success: true,
      data: quizData,
    });
  } catch (error) {
    console.error('API Error in generate-quiz:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
