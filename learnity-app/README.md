# 🎓 Learnity: Advanced AI-Powered Learning Ecosystem

Learnity is a premium, feature-rich LMS designed with the "Onyx" aesthetic. It bridges the gap between students and educators through interactive course players, real-time community spaces, and a gamified progression system.

---

## 🏗 Project Architecture

### 🛡 Core Technologies
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion (for "Crispy" animations).
- **Backend/DB**: Prisma ORM with Neon (PostgreSQL).
- **Authentication**: Dual-layer system (Clerk/Firebase + Custom JWT Session Cookies).
- **Real-time**: GetStream.io (Chat) and 100ms.live (Video/Live Classes).

### 🧩 Module Breakdown
- **Student Dashboard**: Progress tracking, Streak management, and AI Study Mate.
- **Teacher Panel**: Curriculum Builder, Analytics, and Profile Optimization.
- **Admin Command Center**: User management, Application auditing, and System logs.
- **Course Player**: YouTube-integrated video player with auto-complete and synchronized quizzes.

---

## 📈 Current Project Status

We have built a robust infrastructure with high-fidelity UI. The following specialized documents track our next steps:

1.  **[ROADMAP & TODO](./TODO_LEARNITY.md)**: Prioritized list of functional integrations (Reviews, Messaging, Payments).
2.  **[AI ENHANCEMENTS](./docs/AI_ENHANCEMENTS.md)**: Strategy for "Magic" AI features like Quiz Generation and Study Assistants.
3.  **[AUTH FLOW](./docs/AUTH_FLOW.md)**: Understanding the secure registration and login handshake.

---

## 🚀 Future Vision: The Monetization Layer
Learnity is designed to be **Paywall Ready**. 
- Course enrollment logic is abstracted to allow a seamless swap between "Free Enrollment" and "Payment-gated Access."
- Support for Stripe and Local Gateways (bottom of priority list) is architected for later integration.

---

## 🛠 Getting Started

1.  **Install dependencies**:
    ```bash
    bun install
    ```
2.  **Setup Environment Variables**:
    Copy `.env.example` to `.env.local` and add your keys.
3.  **Run Development Server**:
    ```bash
    bun dev --webpack
    ```

---
*Maintained by the Learnity Core Team*
