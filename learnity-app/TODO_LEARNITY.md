# 🧠 Learnity "One-Day" Mastery Guide & Roadmap

This document transforms the development task list into a **Skill-based instruction set**. Follow these steps to move from a "UI Shell" to a "Functional Powerhouse" in 24 hours.

---

## 🛠 Prerequisites

### 🔐 API Keys & Environment
Ensure your `.env.local` contains the following:
```bash
# AI - Using DeepSeek via OpenRouter or Direct
DEEPSEEK_API_KEY="your_api_key"

# Services
NEXT_PUBLIC_STREAM_API_KEY="your_key"
STREAM_API_SECRET="your_secret"
```

### 📦 Dependencies
Run: `bun add openai` (For DeepSeek/OpenRouter integration).

---

## ⚡ SKILL 1: The "Wow Factor" AI Quiz Generator
**Goal**: Allow teachers to generate quizzes from lesson text in 3 seconds.
**Impact**: Highest demonstration value for a Final Year Project.

### 1. The Backend Proxy (`src/app/api/ai/quiz/route.ts`)
*   **Action**: Create a route that accepts `lessonContent`.
*   **Instruction**: Use `deepseek-chat` model. Send a strict system prompt: *"Return ONLY a JSON array of 5 questions. Schema: {question: string, options: string[], correctIndex: number, explanation: string}"*.
*   **Warning**: Do not allow AI to return markdown blocks (```json). Use `response_format: { type: 'json_object' }`.

### 2. The Frontend Button (`src/components/course-builder/QuizStep.tsx`)
*   **Action**: Add a "✨ Magic Generate" button next to the "Add Question" button.
*   **Integration**: On click, fetch `/api/ai/quiz` using the `lesson.description`.
*   **UX**: Show a loading spinner with text: *"DeepSeek is analyzing your content..."*

---

## 📝 SKILL 2: The "Social Proof" Review System
**Goal**: Let students rate courses to make the dashboard feel alive.
**Impact**: Essential for "Real-world" LMS credibility.

### 1. The Completion Trigger (`src/components/course-player/LessonCompleteDialog.tsx`)
*   **Instruction**: Check if `courseCompleted === true`.
*   **Action**: If yes, render a 5-star rating component and a "Leave a review" textarea.
*   **Endpoint**: Use the existing `POST /api/courses/[courseId]/reviews`.

### 2. The Rating Display
*   **Location 1**: `CourseCard.tsx` - Show a small "⭐ 4.8" badge.
*   **Location 2**: `PublicCoursePage.tsx` - Create a simple list mapping through the reviews returned by the API.

---

## 🎨 SKILL 3: Premium Teacher Branding
**Goal**: Transform the profile from "User Account" to "Education Portfolio."
**Impact**: Massive visual improvement for the Onyx theme.

### 1. Banner & Niche Fields
*   **Modification**: Update `src/app/dashboard/teacher/profile/enhance/page.tsx`.
*   **Action**: Add the `BannerUpload` component (similar to AvatarUpload).
*   **Instruction**: Add 3 simple Select/Multi-select fields for:
    1.  **Target Age Group**: (Kids, Teens, Adults).
    2.  **Teaching Style**: (Interactive, Lecture-based, Project-heavy).
    3.  **Top Tools**: (Miro, Zoom, VS Code).

### 2. FAQ & Success Stories
*   **Instruction**: Use a simple "List Editor" (already exists in the codebase) to manage the `faqs` JSON field.
*   **UI**: Each FAQ = `{ question, answer }`.

---

## 💬 SKILL 4: 1-on-1 Student-Teacher Chat
**Goal**: Enable real communication.
**Impact**: High functional depth for the project final review.

### 1. The "Message Instructor" Button
*   **Action**: Add this button on the `PublicTeacherProfile` and `CourseCommunityPage`.
*   **Logic**: Call `streamChatService.createDirectMessageChannel(studentId, teacherId)`.
*   **UX**: Redirect the user to a new `/dashboard/messages` route.

### 2. The Message Hub (`src/app/dashboard/messages/page.tsx`)
*   **Action**: Use the GetStream `<Chat />` and `<ChannelList />` components.
*   **Instruction**: Filter the channel list to only show `type: 'messaging'`.

---

## 💸 THE "PAYWALL BRIDGE" (Future Proofing)
**Do not implement payments yet.** Instead, design the access logic like this:

1.  **Storage**: Use a column in `Course` called `isPremium` (Boolean).
2.  **Logic**: In the `Enrollment` logic, check:
    ```typescript
    if (course.isPremium && !user.isPro) {
       return <PaywallModal />
    }
    ```
3.  **Visual**: Add a "Locked" padlock icon 🔒 next to lessons if `isPremium` is true.

---

## 📋 One-Day Delivery Checklist
- [ ] DeepSeek API Integration (The "AI Sprinkle").
- [ ] Rating Form in LessonCompleteDialog.
- [ ] Review Stars on Course Cards.
- [ ] Teacher Banner Upload.
- [ ] FAQ Manager in Profile.
- [ ] "Message Instructor" Button.

---
*Created for Learnity Mastery Delivery*
