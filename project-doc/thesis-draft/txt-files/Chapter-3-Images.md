# LIST OF FIGURES (CHAPTER 3: DESIGN DIAGRAMS)

The following diagrams illustrate the design and architecture of the Learnity platform.

## Figure 3-1: Use Case Diagram

This diagram shows the interactions between the Student, Teacher, and Admin actors and the system's core functionalities.

```mermaid
usecaseDiagram
    actor Student
    actor Teacher
    actor Admin

    package "Learnity Eco-System" {
        usecase "Register/Login" as UC1
        usecase "Manage Profile" as UC_Profile

        package "Course Module" {
            usecase "Browse/Filter Courses" as UC_Browse
            usecase "Purchase Course" as UC_Buy
            usecase "Watch Lessons" as UC_Watch
            usecase "Take Quiz" as UC_Quiz
        }

        package "Teaching Module" {
            usecase "Create Course Content" as UC_Create
            usecase "Start Live Class" as UC_Live
            usecase "Review Assignments" as UC_Review
            usecase "Request Verification" as UC_Verify
        }

        package "Admin Module" {
            usecase "Approve Teacher" as UC_Approve
            usecase "Verify Payments" as UC_PayVerify
            usecase "System Analytics" as UC_Analytics
        }

        usecase "Chat in Classroom" as UC_Chat
    }

    Student --> UC_Browse
    Student --> UC_Buy
    Student --> UC_Watch
    Student --> UC_Quiz
    Student --> UC_Chat

    Teacher --> UC_Create
    Teacher --> UC_Live
    Teacher --> UC_Review
    Teacher --> UC_Verify
    Teacher --> UC_Chat

    Admin --> UC_Approve
    Admin --> UC_PayVerify
    Admin --> UC_Analytics

    %% Relationships
    UC_Buy ..> UC1 : <<include>>
    UC_Create ..> UC_Verify : <<requires>>
```

## Figure 3-2: Entity Relationship Diagram (ERD)

This diagram details the normalized database schema, showing relationships between Users, Courses, Sections, Lessons, Enrollments, and Payments.

```mermaid
erDiagram
    User ||--o| TeacherProfile : "has optional"
    User ||--o{ Enrollment : "has many"
    User ||--o{ CourseProgress : "tracks"
    User ||--o{ Message : "sends"

    TeacherProfile ||--o{ Course : "authors"
    TeacherProfile ||--o{ VerificationRequest : "submits"

    Course ||--|{ Section : "contains"
    Section ||--|{ Lesson : "contains"

    Course ||--o{ Enrollment : "has"
    Course ||--o{ ChatChannel : "has one"

    Enrollment ||--|| Payment : "linked to"

    User {
        string id PK
        string email
        string name
        enum role "STUDENT/TEACHER/ADMIN"
        int xp_points
        int streak_count
    }

    Course {
        string id PK
        string title
        text description
        float price
        boolean is_published
        string thumbnail_url
    }

    Lesson {
        string id PK
        string title
        enum type "VIDEO/TEXT/QUIZ"
        string content_url
        int duration_seconds
    }

    Enrollment {
        string id PK
        timestamp enrolled_at
        float amount_paid
        enum status "ACTIVE/EXPIRED"
    }

    Payment {
        string id PK
        string transaction_id
        string screenshot_url
        enum status "PENDING/VERIFIED"
    }
```

## Figure 3-3: Activity Diagram (Student Workflow)

This flowchart demonstrates the student's journey from course discovery to enrollment, payment, and learning.

```mermaid
stateDiagram-v2
    [*] --> Login
    Login --> Browse_Catalog
    Browse_Catalog --> Filter_Subjects : Select Grade/Subject
    Filter_Subjects --> Select_Course

    state Enrollment_Process {
        Select_Course --> Payment_Required
        Payment_Required --> Upload_Screenshot : Manual Payment
        Upload_Screenshot --> Wait_Verification
        Wait_Verification --> Access_Granted : Admin Approves
    }

    state Learning_Loop {
        Access_Granted --> Join_Classroom
        Join_Classroom --> Watch_Video
        Join_Classroom --> Join_Chat
        Watch_Video --> Take_Quiz
        Take_Quiz --> Earn_XP : Pass Quiz
        Earn_XP --> Update_Leaderboard
        Update_Leaderboard --> Watch_Video : Next Lesson
    }

    Learning_Loop --> [*]
```

## Figure 3-4: Activity Diagram (Teacher Workflow)

This diagrams the process of teacher verification, course creation, and conducting live sessions.

```mermaid
stateDiagram-v2
    [*] --> Register_User
    Register_User --> Request_Teacher_Access

    state Verification_Process {
        Request_Teacher_Access --> Upload_Degree
        Upload_Degree --> Pending_Admin_Review
        Pending_Admin_Review --> Rejected : Invalid Docs
        Pending_Admin_Review --> Approved : Valid Docs
    }

    state Course_Interaction {
        Approved --> Create_Course_Draft
        Create_Course_Draft --> Add_Sections
        Add_Sections --> Add_Lessons
        Add_Lessons --> Publish_Course

        Publish_Course --> Live_Session_Manager
        Live_Session_Manager --> Start_Video_Stream
        Start_Video_Stream --> Moderate_Chat
    }

    Rejected --> [*]
    Moderate_Chat --> End_Session
    End_Session --> [*]
```

## Figure 3-5: Activity Diagram (Admin Workflow)

This diagram illustrates the administrative processes for verifying teachers and payments.

```mermaid
stateDiagram-v2
    [*] --> Admin_Dashboard

    state User_Management {
        Admin_Dashboard --> Review_Teacher_Requests
        Review_Teacher_Requests --> Check_Documents
        Check_Documents --> Approve_Teacher
        Check_Documents --> Reject_Teacher
    }

    state Financial_Management {
        Admin_Dashboard --> View_Payment_Queue
        View_Payment_Queue --> Validate_Screenshots
        Validate_Screenshots --> Verify_Payment
        Verify_Payment --> Unlock_Student_Course
    }

    Approve_Teacher --> Admin_Dashboard
    Reject_Teacher --> Admin_Dashboard
    Unlock_Student_Course --> Admin_Dashboard
```

## Figure 3-6: System Architecture Diagram

This diagram breaks down the "Modular Monolith" architecture, showing the Client, Server (Next.js), Database (Postgres), and real-time services.

```mermaid
graph TD
    subgraph Client_Side ["Client Layer (Browser/PWA)"]
        UI[React UI Components]
        State[Zustand Store]
        Local[Local Storage (Tokens)]
    end

    subgraph Server_Side ["Server Layer (Next.js 14)"]
        API[Server Actions / API Routes]
        Auth[NextAuth.js Middleware]
        Upload[Vercel Blob Storage]
    end

    subgraph Data_Layer ["Data Persistence"]
        Prisma[Prisma ORM engine]
        Postgres[(Neon DB Cluster)]
    end

    subgraph RealTime ["Real-Time Infrastructure"]
        Stream[GetStream.io (Chat)]
        HMS[100ms.live (Video)]
    end

    UI -->|JSON/RPC| API
    UI -->|WebSocket| Stream
    UI -->|UDP/WebRTC| HMS

    API -->|Authenticate| Auth
    API -->|Validation| Prisma
    API -->|Store Images| Upload

    Prisma -->|Query/Transaction| Postgres
```
