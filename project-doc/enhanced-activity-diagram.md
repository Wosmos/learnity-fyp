# Enhanced Learnity Activity Diagram

## Overview

This enhanced activity diagram shows the complete user journey through the gamified Learnity platform, including streak management, XP earning, and social learning features.

## Main User Flow Diagram

```mermaid
flowchart TD
    Start([User Opens Learnity Platform]) --> RoleChoice{Who are you?}
    
    RoleChoice -->|Student| StudentSignup[Quick Signup]
    RoleChoice -->|Teacher| TeacherApplication[Apply as Teacher]
    RoleChoice -->|Admin| AdminLogin[Admin Login]
    
    StudentSignup --> EmailPassword[Email + Password]
    EmailPassword --> InstantAccess[✓ Instant Access]
    InstantAccess --> StudentDashboard[Student Dashboard]
    
    TeacherApplication --> FillForm[Fill Form + Upload Docs]
    FillForm --> SubmitToAdmin[Submit to Admin]
    SubmitToAdmin --> AdminReview[Admin Reviews]
    
    AdminLogin --> AdminDashboard[Admin Dashboard]
    
    AdminDashboard --> AdminActions{Admin Action}
    AdminActions -->|Review Applications| ReviewApplications[Review Applications]
    AdminActions -->|Manage Users| ManageUsers[Manage Users]
    AdminActions -->|View Analytics| ViewAnalytics[View Analytics]
    
    ReviewApplications --> ApprovalDecision{Admin Reviews}
    ApprovalDecision -->|Approve| ApproveTeacher[✓ Approve]
    ApprovalDecision -->|Reject| RejectTeacher[✗ Reject]
    
    ApproveTeacher --> TeacherDashboard[Teacher Dashboard]
    RejectTeacher --> SubmitToAdmin
    
    StudentDashboard --> StudentActions{Student Action}
    StudentActions -->|Book Tutor| BookTutor[Book Tutor]
    StudentActions -->|Join Study Group| JoinStudyGroup[Join Study Group]
    StudentActions -->|Watch Content| WatchContent[Watch Content]
    
    TeacherDashboard --> TeacherActions{Teacher Action}
    TeacherActions -->|Set Pricing| SetPricing[Set Pricing]
    TeacherActions -->|Upload Videos| UploadVideos[Upload Videos]
    TeacherActions -->|Conduct Sessions| ConductSessions[Conduct Sessions]
    
    %% Student Flows
    BookTutor --> BrowseTutors[Browse Available Tutors]
    BrowseTutors --> SelectTutor[Select Tutor]
    SelectTutor --> BookSession[Book Session]
    BookSession --> SessionBooked[Session Booked ✓]
    SessionBooked --> StudentDashboard
    
    JoinStudyGroup --> BrowseGroups[Browse Study Groups]
    BrowseGroups --> SelectGroup[Select Group]
    SelectGroup --> JoinGroup[Join Group]
    JoinGroup --> GroupJoined[Group Joined ✓]
    GroupJoined --> StudentDashboard
    
    WatchContent --> ContentLibrary[Content Library]
    ContentLibrary --> SelectContent[Select Video/Lesson]
    SelectContent --> WatchVideo[Watch Content]
    WatchVideo --> UpdateProgress[Update Learning Progress]
    UpdateProgress --> StudentDashboard
    
    %% Teacher Flows
    SetPricing --> PricingForm[Enter Hourly Rates]
    PricingForm --> SavePricing[Save Pricing ✓]
    SavePricing --> TeacherDashboard
    
    UploadVideos --> VideoUpload[Upload Video Files]
    VideoUpload --> AddMetadata[Add Title, Description, Tags]
    AddMetadata --> PublishVideo[Publish Video ✓]
    PublishVideo --> TeacherDashboard
    
    ConductSessions --> ViewSchedule[View Scheduled Sessions]
    ViewSchedule --> StartSession[Start Video Session]
    StartSession --> VideoCall[Conduct Video Call]
    VideoCall --> EndSession[End Session]
    EndSession --> CollectFeedback[Collect Student Feedback]
    CollectFeedback --> UpdateEarnings[Update Earnings ✓]
    UpdateEarnings --> TeacherDashboard
    
    %% Daily Challenge Flow
    ChallengeFlow --> ShowChallenge[Display Daily Challenge]
    ShowChallenge --> ChallengeType{Challenge Type}
    
    ChallengeType -->|Quick Quiz| QuickQuiz[5-Question Quiz]
    ChallengeType -->|Streak Goal| StreakGoal[Maintain Streak Goal]
    ChallengeType -->|Social| SocialChallenge[Help a Peer Challenge]
    
    QuickQuiz --> ChallengeComplete[Challenge Complete]
    StreakGoal --> ChallengeComplete
    SocialChallenge --> ChallengeComplete
    
    ChallengeComplete --> BonusXP[Award Bonus XP]
    BonusXP --> UpdateStreak
    
    %% Study Group Flow
    GroupFlow --> GroupAction{Group Action}
    GroupAction -->|Create Group| CreateGroup[Create Study Group]
    GroupAction -->|Join Group| JoinGroup[Join Existing Group]
    GroupAction -->|Browse Groups| BrowseGroups[Browse Public Groups]
    
    CreateGroup --> GroupSetup[Set Group Name, Subject, Description]
    GroupSetup --> GroupCreated[Group Created Successfully]
    
    BrowseGroups --> SelectGroup[Select Group to Join]
    SelectGroup --> JoinGroup
    
    JoinGroup --> GroupChat[Enter Group Chat]
    GroupCreated --> GroupChat
    
    GroupChat --> ChatActions{Chat Action}
    ChatActions -->|Send Message| SendMessage[Send Chat Message]
    ChatActions -->|Help Peer| HelpPeer[Answer Peer Question]
    ChatActions -->|Start Video Call| VideoCall[Initiate Jitsi Meet Call]
    ChatActions -->|View Group Progress| GroupProgress[View Group Stats]
    
    SendMessage --> AwardSocialXP[Award Social XP]
    HelpPeer --> AwardHelpXP[Award Help XP + Badge]
    VideoCall --> JitsiMeet[Open Jitsi Meet Room]
    GroupProgress --> ShowGroupStats[Show Group Streak & XP]
    
    AwardSocialXP --> GroupChat
    AwardHelpXP --> GroupChat
    JitsiMeet --> GroupChat
    ShowGroupStats --> GroupChat
    
    %% Tutor Booking Flow
    TutorFlow --> BrowseTutors[Browse Available Tutors]
    BrowseTutors --> FilterTutors[Filter by Subject/Rating]
    FilterTutors --> SelectTutor[Select Tutor]
    SelectTutor --> ViewTutorProfile[View Tutor Profile]
    
    ViewTutorProfile --> BookSession[Book Session]
    BookSession --> SelectTime[Select Available Time Slot]
    SelectTime --> ConfirmBooking[Confirm Booking]
    ConfirmBooking --> SessionBooked[Session Booked Successfully]
    
    SessionBooked --> SessionReminder[Send Calendar Reminder]
    SessionReminder --> WaitForSession[Wait for Session Time]
    
    WaitForSession --> SessionTime{Session Time?}
    SessionTime -->|Yes| StartSession[Start Video Session]
    SessionTime -->|No| WaitForSession
    
    StartSession --> JitsiSession[Jitsi Meet Session]
    JitsiSession --> SessionEnd[Session Ends]
    SessionEnd --> RateSession[Rate Tutor & Session]
    
    RateSession --> SessionXP[Award Session XP]
    SessionXP --> UpdateStreak
    
    %% Profile Management Flow
    ProfileFlow --> ProfileActions{Profile Action}
    ProfileActions -->|Edit Profile| EditProfile[Edit Profile Information]
    ProfileActions -->|View Achievements| ViewAchievements[View Badges & Achievements]
    ProfileActions -->|Apply as Tutor| TutorApplication[Tutor Application Form]
    ProfileActions -->|Settings| UserSettings[User Settings]
    
    EditProfile --> SaveProfile[Save Profile Changes]
    SaveProfile --> Dashboard
    
    ViewAchievements --> BadgeGallery[Display Badge Collection]
    BadgeGallery --> AchievementDetails[Show Achievement Details]
    AchievementDetails --> Dashboard
    
    TutorApplication --> UploadDocuments[Upload Verification Documents]
    UploadDocuments --> SubmitApplication[Submit for Admin Review]
    SubmitApplication --> ApplicationPending[Application Pending]
    ApplicationPending --> Dashboard
    
    UserSettings --> UpdateSettings[Update User Preferences]
    UpdateSettings --> Dashboard
    
    %% Admin Flow (Separate Branch)
    Dashboard -->|Admin User| AdminPanel[Admin Control Panel]
    AdminPanel --> AdminActions{Admin Action}
    
    AdminActions -->|Manage Users| UserManagement[User Management Dashboard]
    AdminActions -->|Review Tutors| TutorReview[Tutor Application Review]
    AdminActions -->|Content Management| ContentManagement[Lesson & Content Management]
    AdminActions -->|Analytics| PlatformAnalytics[Platform Analytics Dashboard]
    AdminActions -->|Gamification Config| GameConfig[Configure XP & Badges]
    
    TutorReview --> ReviewApplication[Review Tutor Application]
    ReviewApplication --> ApprovalDecision{Approve?}
    
    ApprovalDecision -->|Yes| ApproveTutor[Approve Tutor]
    ApprovalDecision -->|No| RejectTutor[Reject with Feedback]
    
    ApproveTutor --> NotifyTutor[Notify Tutor of Approval]
    RejectTutor --> NotifyRejection[Notify Tutor of Rejection]
    
    NotifyTutor --> AdminPanel
    NotifyRejection --> AdminPanel
    
    UserManagement --> AdminPanel
    ContentManagement --> AdminPanel
    PlatformAnalytics --> AdminPanel
    GameConfig --> AdminPanel
    
    %% Error Handling
    Dashboard -->|Error Occurs| ErrorHandler[Error Handler]
    ErrorHandler --> LogError[Log Error to Sentry]
    LogError --> ShowErrorMessage[Show User-Friendly Error]
    ShowErrorMessage --> Dashboard
    
    %% Logout Flow
    Dashboard -->|Logout| Logout[User Logout]
    Logout --> ClearSession[Clear User Session]
    ClearSession --> Start
```

## Gamification Flow Details

### Streak Management Flow

```mermaid
flowchart TD
    ActivityComplete[User Completes Activity] --> CheckLastActivity[Check Last Activity Date]
    CheckLastActivity --> DateComparison{Date Comparison}
    
    DateComparison -->|Same Day| NoStreakChange[No Streak Change]
    DateComparison -->|Yesterday| ContinueStreak[Continue Streak +1]
    DateComparison -->|Older| ResetStreak[Reset Streak to 1]
    
    ContinueStreak --> UpdateStreak[Update Current Streak]
    ResetStreak --> UpdateStreak
    
    UpdateStreak --> CheckLongest{New Longest Streak?}
    CheckLongest -->|Yes| UpdateLongest[Update Longest Streak]
    CheckLongest -->|No| CheckMilestones[Check Streak Milestones]
    
    UpdateLongest --> CheckMilestones
    
    CheckMilestones --> MilestoneCheck{Milestone Reached?}
    MilestoneCheck -->|7 Days| Award7Day[Award 7-Day Badge]
    MilestoneCheck -->|14 Days| Award14Day[Award 14-Day Badge]
    MilestoneCheck -->|30 Days| Award30Day[Award 30-Day Badge]
    MilestoneCheck -->|100 Days| Award100Day[Award 100-Day Badge]
    MilestoneCheck -->|365 Days| Award365Day[Award Year Badge]
    MilestoneCheck -->|No Milestone| StreakComplete[Streak Update Complete]
    
    Award7Day --> BonusXP[Award Bonus XP]
    Award14Day --> BonusXP
    Award30Day --> BonusXP
    Award100Day --> BonusXP
    Award365Day --> BonusXP
    
    BonusXP --> ShowCelebration[Show Milestone Celebration]
    ShowCelebration --> StreakComplete
    
    NoStreakChange --> StreakComplete
    StreakComplete --> UpdateUI[Update UI Elements]
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

### Social Learning Flow

```mermaid
flowchart TD
    JoinGroup[User Joins Study Group] --> GroupDashboard[Group Dashboard]
    GroupDashboard --> GroupActions{Group Action}
    
    GroupActions -->|Chat| SendMessage[Send Message]
    GroupActions -->|Help| HelpPeer[Help Another Student]
    GroupActions -->|Challenge| GroupChallenge[Participate in Group Challenge]
    GroupActions -->|Study Together| GroupStudy[Start Group Study Session]
    
    SendMessage --> SocialXP[Award Social XP]
    HelpPeer --> HelpXP[Award Help XP + Collaboration Badge]
    GroupChallenge --> ChallengeXP[Award Challenge XP]
    GroupStudy --> StudyXP[Award Group Study XP]
    
    SocialXP --> UpdateGroupStats[Update Group Statistics]
    HelpXP --> UpdateGroupStats
    ChallengeXP --> UpdateGroupStats
    StudyXP --> UpdateGroupStats
    
    UpdateGroupStats --> GroupLeaderboard[Update Group Leaderboard]
    GroupLeaderboard --> CheckGroupMilestone{Group Milestone?}
    
    CheckGroupMilestone -->|Yes| GroupBadge[Award Group Badge to All Members]
    CheckGroupMilestone -->|No| SocialComplete[Social Activity Complete]
    
    GroupBadge --> GroupCelebration[Group Celebration Animation]
    GroupCelebration --> SocialComplete
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