# Learnity Learning Module Flow

This document describes the entire lifecycle of a learning module (Course) within the Learnity platform, detailing the roles and capabilities of Students, Instructors, and Administrators.

---

## 1. Student (User) Flow
Students are the primary consumers of the learning content. Their journey focuses on discovery, engagement, and mastery.

### **Discovery & Enrollment**
- **Course Catalog**: Students browse a high-performance "Course Terminal" to discover curated modules.
- **Search & Filter**: Real-time search with advanced filtering by **Category**, **Difficulty**, and **Rating**.
- **Course Preview**: View comprehensive details including lesson breakdown, total duration, and teacher credentials.
- **Enrollment**: Seamless integration with the student dashboard upon enrollment.

### **The Learning Experience (Course Player)**
- **Interactive Player**: A dedicated learning interface featuring:
  - **YouTube Content Delivery**: Optimized video playback for instructional content.
  - **Dynamic Sidebar**: Track progress across sections and jump between lessons instantly.
  - **Sequence Mastery**: Visual indicators for completed, current, and locked lessons.
- **Interactive Quizzes**: Knowledge checkpoints with immediate feedback and performance-based progression.
- **Gamification & Incentives**:
  - **XP System**: Earn experience points for completing lessons and passing quizzes.
  - **Streak Counter**: Daily engagement tracking to encourage consistent learning habits.
  - **XP Badges**: Visual recognition of learning achievements.

---

## 2. Instructor (Teacher) Flow
Instructors are the content architects. They leverage powerful tools to build and refine the educational experience.

### **Management Dashboard**
- **Deployment Control**: Centralized hub to monitor course status (Draft, Pending, Published).
- **Student Analytics**: Real-time data on enrollment, engagement levels, and quiz performance.

### **Course Construction (Course Builder)**
- **Curriculum Architecture**:
  - **Section Manager**: Organize content into logical chapters (e.g., "Standard Operations", "Advanced Protocols").
  - **Lesson Manager**: Create educational nodes.
    - **Video Nodes**: Link high-quality YouTube content.
    - **Quiz Nodes**: Build complex assessments with custom passing thresholds.
  - **Quiz Builder**: Create multiple-choice questions with detailed explanations for correct answers.
- **Preview Engine**: Test the entire learning flow as a student would before going live.
- **Validation & Deployment**: Intelligent pre-publish checklists ensure all requirements (metadata, content, and structure) are met.

---

## 3. Administrator Flow
Administrators manage the platform's ecosystem, ensuring high standards and operational health.

### **Ecosystem Management**
- **Category Taxonomy**: Admins define the global categorization system used by all teachers.
- **Teacher Onboarding**: Review and verify teacher applications to maintain instructional quality.
- **Platform Configuration**:
  - Toggle core features (Messaging, Video Sessions, Teacher Apps).
  - Manage **Maintenance Mode** and **Registration Security**.

### **Security & Operations**
- **Audit capabilities**: Monitor security events and platform-wide audit logs.
- **Platform Statistics**: High-level view of users, revenue growth, and system performance.
- **Health Monitoring**: Monitor real-time system metrics like uptime and response times.

---

## Comparison: Instructor vs. Admin Capabilities

| Feature | Instructor | Administrator |
| :--- | :---: | :---: |
| Build Courses & Curriculums | ✅ | ✅ |
| Define Global Categories | ❌ | ✅ |
| Approve/Verify Teachers | ❌ | ✅ |
| View Individual Course Stats | ✅ | ✅ |
| Access Global Revenue & Uptime | ❌ | ✅ |
| Configure Platform Security | ❌ | ✅ |
| Administrative User Control | ❌ | ✅ |

---

## Process Overview
1.  **Framework**: **Admin** sets up categories and verifies **Teachers**.
2.  **Creation**: **Teacher** uses the **Course Builder** to architect sections and lessons (Video/Quiz).
3.  **Validation**: System validates the course; **Teacher** deploys it to the **Catalog**.
4.  **Learning**: **Student** discovers the course via the **Catalog** and enrolls.
5.  **Engagement**: **Student** uses the **Course Player**, earning **XP** and maintaining **Streaks**.
6.  **Insights**: **System** generates data for teacher improvements and admin oversight.
