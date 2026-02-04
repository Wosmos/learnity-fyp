/**
 * AI Service
 * Handles interactions with DeepSeek/OpenRouter for AI features.
 */

import OpenAI from 'openai';

// Define the shape of a generated question
export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
}

class AIService {
  private client: OpenAI | null = null;

  private getClient() {
    if (!this.client) {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY is not configured');
      }

      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      });
    }
    return this.client;
  }

  /**
   * Generates a quiz based on lesson content
   */
  async generateQuizFromContent(
    content: string,
    lessonTitle: string
  ): Promise<GeneratedQuiz> {
    const client = this.getClient();

    const prompt = `
      You are an expert educator. Create a high-quality quiz based on the following lesson content.
      
      Lesson Title: ${lessonTitle}
      Lesson Content: ${content}

      REQUIREMENTS:
      1. Generate exactly 5 multiple choice questions.
      2. Each question must have between 2 to 4 options.
      3. Provide a clear explanation for Warum the correct answer is correct.
      4. return ONLY a valid JSON object matching the schema below.
      5. Do not include any markdown formatting like \`\`\`json.

      SCHEMA:
      {
        "title": "Quiz Title",
        "description": "Brief description of what this quiz covers",
        "questions": [
          {
            "question": "The question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctOptionIndex": 0,
            "explanation": "Why this answer is correct"
          }
        ]
      }
    `;

    try {
      const response = await client.chat.completions.create({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional educational content generator. You always respond with pure JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        // response_format: { type: 'json_object' } // Some providers might not support this, so we rely on prompt
      });

      const resultText = response.choices[0].message.content || '';

      // Clean result text in case AI added markdown
      const cleanedJson = resultText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleanedJson) as GeneratedQuiz;
    } catch (error) {
      console.error('Error generating quiz with AI:', error);
      throw new Error('Failed to generate quiz content. Please try again.');
    }
  }
}

export const aiService = new AIService();
