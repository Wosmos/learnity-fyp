# Enhanced Learnity Activity Diagram

## Overview

This enhanced activity diagram shows the complete user journey through the gamified Learnity platform, including streak management, XP earning, and social learning features.

## Main User Flow Diagram

```mermaid
---
config:
  layout: fixed
---
flowchart TD
    Start(["User Opens Platform"]) --> Landing["Landing Page"]
    Landing --> RoleSelect{"Select Role"}
    RoleSelect -- Student --> SLogin["Student Login/Register"]
    SLogin --> SAuth{"Valid Credentials?"}
    SAuth -- No --> SError["Show Error Message"]
    SError --> SLogin
    SAuth -- Yes --> SDash["Student Dashboard"]
    SDash --> SAction{"Choose Action"} & SLogout{"Logout?"}
    SAction -- Book Session --> SBrowse["Browse Teachers/Subjects"]
    SBrowse --> SSelect["Select Teacher"]
    SSelect --> SBook["Book Session"]
    SBook --> SPayment{"Payment Method"}
    SPayment -- Online --> SOnline["Pay via Card/Wallet"]
    SPayment -- Cash --> SCash["Pay in Cash Later"]
    SOnline --> SConfirm["Session Confirmed"]
    SCash --> SConfirm
    SConfirm --> SAttend["Attend Video Session"]
    SAttend --> SRate["Give Rating & Review"]
    SRate --> SEarn1["Earn 50 Points"]
    SEarn1 --> SDash
    SAction -- Take Quiz --> SQuizSelect["Select Quiz/Subject"]
    SQuizSelect --> STakeQuiz["Complete Quiz"]
    STakeQuiz --> SSubmit["Submit Answers"]
    SSubmit --> SResults["View Results & Key"]
    SResults --> SEarn2["Earn 30 Points"]
    SEarn2 --> SDash
    SAction -- Watch Videos --> SVidBrowse["Browse Video Library"]
    SVidBrowse --> SVidPlay["Play Video"]
    SVidPlay --> SVidComplete["Mark Complete"]
    SVidComplete --> SEarn3["Earn 20 Points"]
    SEarn3 --> SDash
    SAction -- Read Notes --> SNotesBrowse["Browse Study Notes"]
    SNotesBrowse --> SNotesRead["Read/Download Notes"]
    SNotesRead --> SDash
    SAction -- Redeem Points --> SRedeem{"Points Balance?"}
    SRedeem -- Sufficient --> SRedeemOpt["Select Redemption Option"]
    SRedeemOpt --> SRedeemConf["Confirm Redemption"]
    SRedeemConf --> SDash
    SRedeem -- Insufficient --> SInsufficent["Show Insufficient Points"]
    SInsufficent --> SDash
    RoleSelect -- Teacher --> TChoice{"Already Registered?"}
    TChoice -- No --> TApply["Apply as Teacher"]
    TApply --> TForm["Fill Application Form"]
    TForm --> TSubmit["Submit Application"]
    TSubmit --> TPending["Application Under Review"]
    TChoice -- Yes --> TLogin["Teacher Login"]
    TLogin --> TAuth{"Valid Credentials?"}
    TAuth -- No --> TError["Show Error Message"]
    TError --> TLogin
    TAuth -- Yes --> TDash["Teacher Dashboard"]
    TDash --> TAction{"Choose Action"} & TLogout{"Logout?"}
    TAction -- Create Content --> TContentType{"Content Type"}
    TContentType -- Video --> TUploadVid["Upload Video"]
    TContentType -- Quiz --> TCreateQuiz["Create Quiz"]
    TContentType -- Notes --> TUploadNotes["Upload Study Notes"]
    TUploadVid --> TSubmitContent["Submit for Review"]
    TCreateQuiz --> TSubmitContent
    TUploadNotes --> TSubmitContent
    TSubmitContent --> TContentPending["Content Under Admin Review"]
    TAction -- Manage Sessions --> TViewSessions["View Booked Sessions"]
    TViewSessions --> TSessionAction{"Action"}
    TSessionAction -- Confirm --> TConfirmSess["Confirm Session"]
    TSessionAction -- Reschedule --> TReschedule["Reschedule Session"]
    TSessionAction -- Conduct --> TConductSess["Conduct Video Session"]
    TConfirmSess --> TDash
    TReschedule --> TDash
    TConductSess --> TEarn["Earn PKR 200-300"]
    TEarn --> TDash
    TAction -- View Analytics --> TAnalytics["View Performance Analytics"]
    TAnalytics --> TDash
    TAction -- Withdraw Earnings --> TWithdraw{"Balance Available?"}
    TWithdraw -- Yes --> TWithdrawMethod["Select Withdrawal Method"]
    TWithdrawMethod --> TWithdrawConf["Confirm Withdrawal"]
    TWithdrawConf --> TDash
    TWithdraw -- No --> TInsufficient["Show Insufficient Balance"]
    TInsufficient --> TDash
    RoleSelect -- Admin --> ALogin["Admin Login"]
    ALogin --> AAuth{"Valid Credentials?"}
    AAuth -- No --> AError["Show Error Message"]
    AError --> ALogin
    AAuth -- Yes --> ADash["Admin Dashboard"]
    ADash --> AAction{"Choose Action"} & ALogout{"Logout?"}
    AAction -- Review Teachers --> AViewApps["View Pending Applications"]
    AViewApps --> AReviewApp["Review Application Details"]
    AReviewApp --> ADecision1{"Decision"}
    ADecision1 -- Approve --> AApproveTeacher["Approve Teacher"]
    AApproveTeacher --> ANotifyT1["Send Approval Email"]
    ANotifyT1 --> TDash
    ADecision1 -- Reject --> ARejectTeacher["Reject with Reason"]
    ARejectTeacher --> ANotifyT2["Send Rejection Email"]
    ANotifyT2 --> ACanReapply{"Can Reapply?"}
    ACanReapply -- Yes --> TApply
    ACanReapply L_ACanReapply_End1_0@-- No --> End1(["End"])
    AAction -- Review Content --> AViewContent["View Pending Content"]
    AViewContent --> AReviewContent["Review Content Details"]
    AReviewContent --> ADecision2{"Decision"}
    ADecision2 -- Approve --> AApproveContent["Approve Content"]
    AApproveContent --> APublish["Publish to Platform"]
    APublish --> ANotifyT3["Notify Teacher"]
    ANotifyT3 --> TDash
    ADecision2 -- Reject --> ARejectContent["Reject with Feedback"]
    ARejectContent --> ANotifyT4["Send Feedback to Teacher"]
    ANotifyT4 --> TDash
    AAction -- Manage Platform --> AManageOpt{"Management Option"}
    AManageOpt -- Users --> AManageUsers["Manage Users/Bans"]
    AManageOpt -- Reports --> AViewReports["View Platform Reports"]
    AManageOpt -- Settings --> ASettings["Update Platform Settings"]
    AManageUsers --> ADash
    AViewReports --> ADash
    ASettings --> ADash
    AAction -- Process Withdrawals --> AViewWithdrawals["View Pending Withdrawals"]
    AViewWithdrawals --> AProcessWithdraw["Process Withdrawal Request"]
    AProcessWithdraw --> AWithdrawDone["Mark as Completed"]
    AWithdrawDone --> ADash
    SLogout -- Yes --> End2(["End Session"])
    TLogout -- Yes --> End2
    ALogout -- Yes --> End2
    SLogout -- No --> SDash
    TLogout -- No --> TDash
    ALogout -- No --> ADash
     RoleSelect:::decisionClass
     SLogin:::studentClass
     SAuth:::decisionClass
     SError:::errorClass
     SDash:::studentClass
     SAction:::decisionClass
     SLogout:::decisionClass
     SBrowse:::studentClass
     SSelect:::studentClass
     SBook:::studentClass
     SPayment:::decisionClass
     SConfirm:::studentClass
     SAttend:::studentClass
     SRate:::studentClass
     SEarn1:::earnClass
     SQuizSelect:::studentClass
     STakeQuiz:::studentClass
     SSubmit:::studentClass
     SResults:::studentClass
     SEarn2:::earnClass
     SVidBrowse:::studentClass
     SVidPlay:::studentClass
     SVidComplete:::studentClass
     SEarn3:::earnClass
     SNotesBrowse:::studentClass
     SNotesRead:::studentClass
     SRedeem:::decisionClass
     SRedeemOpt:::studentClass
     SRedeemConf:::studentClass
     SInsufficent:::errorClass
     TChoice:::decisionClass
     TApply:::teacherClass
     TForm:::teacherClass
     TSubmit:::teacherClass
     TPending:::pendingClass
     TLogin:::teacherClass
     TAuth:::decisionClass
     TError:::errorClass
     TDash:::teacherClass
     TAction:::decisionClass
     TLogout:::decisionClass
     TContentType:::decisionClass
     TUploadVid:::teacherClass
     TCreateQuiz:::teacherClass
     TUploadNotes:::teacherClass
     TContentPending:::pendingClass
     TViewSessions:::teacherClass
     TSessionAction:::decisionClass
     TConfirmSess:::teacherClass
     TReschedule:::teacherClass
     TConductSess:::teacherClass
     TEarn:::earnClass
     TAnalytics:::teacherClass
     TWithdraw:::decisionClass
     TWithdrawMethod:::teacherClass
     TWithdrawConf:::teacherClass
     TInsufficient:::errorClass
     ALogin:::adminClass
     AAuth:::decisionClass
     AError:::errorClass
     ADash:::adminClass
     AAction:::decisionClass
     ALogout:::decisionClass
     AViewApps:::adminClass
     AReviewApp:::adminClass
     ADecision1:::decisionClass
     AApproveTeacher:::adminClass
     ANotifyT1:::adminClass
     ARejectTeacher:::adminClass
     ANotifyT2:::adminClass
     ACanReapply:::decisionClass
     AViewContent:::adminClass
     AReviewContent:::adminClass
     ADecision2:::decisionClass
     AApproveContent:::adminClass
     APublish:::adminClass
     ANotifyT3:::adminClass
     ARejectContent:::adminClass
     ANotifyT4:::adminClass
     AManageOpt:::decisionClass
     AManageUsers:::adminClass
     AViewReports:::adminClass
     ASettings:::adminClass
     AViewWithdrawals:::adminClass
     AProcessWithdraw:::adminClass
     AWithdrawDone:::adminClass
    classDef studentClass fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    classDef teacherClass fill:#F5A623,stroke:#D68910,stroke-width:2px,color:#fff
    classDef adminClass fill:#E74C3C,stroke:#C0392B,stroke-width:2px,color:#fff
    classDef decisionClass fill:#FFE66D,stroke:#F4D03F,stroke-width:2px,color:#333
    classDef earnClass fill:#2ECC71,stroke:#27AE60,stroke-width:2px,color:#fff
    classDef errorClass fill:#E74C3C,stroke:#C0392B,stroke-width:2px,color:#fff
    classDef pendingClass fill:#95A5A6,stroke:#7F8C8D,stroke-width:2px,color:#fff
    L_ACanReapply_End1_0@{ animation: none }

```

## Gamification Flow Details

### Streak Management Flow

```mermaid

```

### XP and Leveling Flow

```mermaid
flowchart TD
    EarnXP[User Earns XP] --> CalculateMultiplier[Calculate Streak Multiplier]
    CalculateMultiplier --> ApplyMultiplier[Apply Multiplier to Base XP]
    ApplyMultiplier --> AddToTotal[Add to Total XP]
    
    AddToTotal --> CalculateLevel[Calculate New Level]
    CalculateLevel --> LevelCheck{Level Increased?}
    
    LevelCheck -->|Yes| LevelUp[Level Up!]
    LevelCheck -->|No| UpdateXPBar[Update XP Progress Bar]
    
    LevelUp --> LevelUpAnimation[Show Level Up Animation]
    LevelUpAnimation --> CheckLevelBadge[Check for Level Badge]
    CheckLevelBadge --> AwardLevelBadge[Award Level Badge]
    AwardLevelBadge --> UpdateXPBar
    
    UpdateXPBar --> RecordActivity[Record XP Activity]
    RecordActivity --> XPComplete[XP Update Complete]
```

## Key Gamification Elements

### 1. Streak Visualization
- **Fire emoji indicators** (like Snapchat)
- **Streak counter** with current and best streaks
- **Heat map calendar** (like GitHub contributions)
- **Streak freeze** options for premium users

### 2. XP and Leveling
- **Progress bars** with smooth animations
- **Level badges** with unique designs
- **XP multipliers** based on streaks
- **Bonus XP** for consistent activity

### 3. Achievement System
- **Milestone badges** for streaks (7, 14, 30, 100, 365 days)
- **Activity badges** for different types of learning
- **Social badges** for helping peers
- **Rare badges** for exceptional achievements

### 4. Social Features
- **Group leaderboards** for friendly competition
- **Peer help system** with XP rewards
- **Achievement sharing** on social feeds
- **Group challenges** and competitions

### 5. Daily Engagement
- **Daily challenges** with bonus XP
- **Login streaks** separate from learning streaks
- **Push notifications** for streak reminders
- **Personalized goals** based on user behavior

This enhanced activity diagram provides a comprehensive view of how users interact with the gamified Learnity platform, ensuring engagement through multiple touchpoints and reward mechanisms.