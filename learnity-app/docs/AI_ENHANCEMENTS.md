# ✨ AI Enhancements: The DeepSeek "Speed" Plan

Since we have **one day**, we are focusing on the most cost-effective and fastest implementation using **DeepSeek**.

---

### 🛠 The Tool: DeepSeek (V3 / R1)
- **API**: OpenAI Compatible (Drop-in replacement).
- **Cost**: Extremely cheap (~$0.14 per 1M tokens).
- **Speed**: Very fast response times for JSON generation.

### 🎯 Primary Feature: The AI Quiz Generator
This is the "King of Demo Features." It’s highly visual and shows immediate utility.

**Workflow:**
1. Teacher clicks **"Generate Quiz"**.
2. Frontend sends Lesson Description to `/api/ai/generate-quiz`.
3. DeepSeek returns 5 high-quality MCQs.
4. The UI automatically fills the quiz builder.

---

### 🚀 1-Hour Implementation Code (Snippet)

```typescript
// src/lib/services/ai.service.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com", // Or OpenRouter URL
});

export async function generateQuizFromContent(content: string) {
  const response = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: "You are a professional quiz generator. Return ONLY valid JSON." },
      { role: "user", content: `Create 5 MCQs from this: ${content}` }
    ],
    response_format: { type: 'json_object' }
  });
  return JSON.parse(response.choices[0].message.content);
}
```

---

### 📦 Dependencies
- `openai`: Use this for all DeepSeek/OpenRouter calls.

---
*Optimized for 24-hour delivery.*
