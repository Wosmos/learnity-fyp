# Learnity Platform - Complete Activity Diagram Flow

## Overview
This document provides a comprehensive activity diagram showing all user flows, authentication processes, and system interactions in the Learnity platform.

---

## 1. Main User Flow Diagram

```mermaid
flowchart TD
    Start([User Visits Platform]) --> CheckAuth{Authenticated?}
    
    %% Unauthenticated Flow
    CheckAuth -->|No| PublicRoutes[Public Routes Available]
    PublicRoutes --> LandingPage[Landing Page /]
    PublicRoutes --> LoginPage[Login Page /auth/login]
    PublicRoutes --> RegisterPage[Register Page /auth/register]
    PublicRoutes --> DemoPage[Demo Page /demo]
    
    %% Registration Flow
    RegisterPage --> SelectRole{Select Role}
    SelectRole -->|Student| StudentReg[Student Registration]
    SelectRole -->|Teacher| TeacherReg[Teacher Registration]
    
    StudentReg --> CreateAccount[Create Firebase Account]
    TeacherReg --> CreateAccount
    
    CreateAccount --> EmailVerification{Email Verified?}
    EmailVerification -->|No| SendVerificationEmail[Send Verification Email]
    SendVerificationEmail --> WaitVerification[Wait for Verification]
    WaitVerification --> EmailVerification
    
    EmailVerification -->|Yes| CreateProfile[Create User Profile in DB]
    CreateProfile --> SetCustomClaims[Set Firebase Custom Claims]
    SetCustomClaims --> CreateSession[Create Session Cookie]
    
    %% Login Flow
    LoginPage --> LoginMethod{Login Method}
    LoginMethod -->|Email/Password| EmailLogin[Email/Password Login]
    LoginMethod -->|Google| GoogleLogin[Google OAuth]
    LoginMethod -->|Social| SocialLogin[Social OAuth]
    
    EmailLogin --> ValidateCredentials{Valid Credentials?}
    GoogleLogin --> ValidateCredentials
    SocialLogin --> ValidateCredentials
    
    ValidateCredentials -->|No| LoginError[Show Error]
    LoginError --> LoginPage
    
    ValidateCredentials -->|Yes| SecurityCheck[Security Assessment]
    SecurityCheck --> RiskLevel{Risk Level}
    
    RiskLevel -->|High| RequireCaptcha[Require Captcha]
    RequireCaptcha --> CaptchaValid{Captcha Valid?}
    CaptchaValid -->|No| LoginError
    CaptchaValid -->|Yes| CreateSession
    
    RiskLevel -->|Low/Medium| CreateSession
    
    %% Authenticated Flow
    CheckAuth -->|Yes| GetUserClaims[Get User Claims & Role]
    CreateSession --> GetUserClaims
    
    GetUserClaims --> CheckRole{User Role?}
    
    %% Student Flow
    CheckRole -->|STUDENT| CheckStudentProfile{Profile Complete?}
    CheckStudentProfile -->|No| StudentOnboarding[Student Onboarding /onboarding]
    CheckStudentProfile -->|Yes| StudentDashboard[Student Dashboard /dashboard/student]
    
    StudentOnboarding --> CompleteBasicInfo[Complete Basic Info]
    CompleteBasicInfo --> SelectPreferences[Select Subjects & Interests]
    SelectPreferences --> StudentDashboard
    
    StudentDashboard --> StudentActions{Student Actions}
    StudentActions --> ViewCourses[View Available Courses]
    StudentActions --> JoinStudyGroup[Join Study Groups]
    StudentActions --> BookTutoring[Book Tutoring Sessions]
    StudentActions --> EnhanceProfile[Enhance Profile /profile/enhance]
    StudentActions --> ViewProgress[View Learning Progress]
    StudentActions --> UpdateProfile[Update Profile /profile]
    
    %% Teacher Flow
    CheckRole -->|TEACHER| TeacherDashboard[Teacher Dashboard /dashboard/teacher]
    TeacherDashboard --> TeacherActions{Teacher Actions}
    TeacherActions --> ManageSessions[Manage Sessions]
    TeacherActions --> ViewStudents[View Students /dashboard/teacher/students]
    TeacherActions --> UploadContent[Upload Content]
    TeacherActions --> ViewEarnings[View Earnings]
    TeacherActions --> UpdateTeacherProfile[Update Profile]
    
    %% Pending Teacher Flow
    CheckRole -->|PENDING_TEACHER| ApplicationStatus[Application Status /application/status]
    ApplicationStatus --> CheckAppStatus{Application Status}
    CheckAppStatus -->|Pending| WaitApproval[Wait for Admin Approval]
    CheckAppStatus -->|Rejected| ResubmitApp[Resubmit Application]
    CheckAppStatus -->|Approved| RoleUpgrade[Role Upgraded to TEACHER]
    RoleUpgrade --> TeacherDashboard
    
    %% Admin Flow
    CheckRole -->|ADMIN| AdminDashboard[Admin Dashboard /admin]
    AdminDashboard --> AdminActions{Admin Actions}
    AdminActions --> ManageUsers[Manage Users]
    AdminActions --> ApproveTeachers[Approve Teacher Applications]
    AdminActions --> ViewAuditLogs[View Audit Logs /admin/audit-logs]
    AdminActions --> ViewSecurityEvents[View Security Events /admin/security-events]
    AdminActions --> GenerateReports[Generate Reports]
    AdminActions --> ManagePlatform[Manage Platform Settings]
    
    %% Profile Management
    UpdateProfile --> ProfileActions{Profile Actions}
    ProfileActions --> UpdateAvatar[Update Avatar]
    ProfileActions --> UpdatePrivacy[Update Privacy Settings]
    ProfileActions --> ChangePassword[Change Password]
    
    UpdateAvatar --> UploadToFirebase[Upload to Firebase Storage]
    UploadToFirebase --> UpdateDB[Update Database]
    
    %% Logout Flow
    StudentActions --> Logout[Logout]
    TeacherActions --> Logout
    AdminActions --> Logout
    
    Logout --> ClearSession[Clear Session Cookie]
    ClearSession --> RevokeToken[Revoke Firebase Token]
    RevokeToken --> RedirectLogin[Redirect to Login]
    RedirectLogin --> Start
    
    %% Error Handling
    UpdateDB --> ErrorCheck{Error?}
    ErrorCheck -->|Yes| ShowError[Show Error Message]
    ErrorCheck -->|No| Success[Success]
    
    %% Unauthorized Access
    CheckRole -->|Invalid/No Role| UnauthorizedPage[Unauthorized Page /unauthorized]
    UnauthorizedPage --> ShowRoleError[Show Role-Based Error]
    ShowRoleError --> SuggestAction[Suggest Appropriate Action]
    SuggestAction --> RedirectToDashboard[Redirect to Correct Dashboard]
    
    style Start fill:#e1f5e1
    style StudentDashboard fill:#e3f2fd
    style TeacherDashboard fill:#f3e5f5
    style AdminDashboard fill:#fff3e0
    style UnauthorizedPage fill:#ffebee
    style Logout fill:#fce4ec
```

---

## 2. Authentication & Authorization Flow

```mermaid
flowchart TD
    Request([Incoming Request]) --> Middleware{Middleware Check}
    
    %% Middleware Processing
    Middleware --> CheckPath{Path Type?}
    
    CheckPath -->|Static Files| AllowAccess[Allow Access]
    CheckPath -->|API Route| APIAuth[API Auth Handler]
    CheckPath -->|Public Route| AllowAccess
    CheckPath -->|Protected Route| CheckSession{Session Cookie?}
    
    CheckSession -->|No| RedirectLogin[Redirect to /auth/login]
    CheckSession -->|Yes| VerifyToken[Verify Firebase Token]
    
    VerifyToken --> TokenValid{Token Valid?}
    TokenValid -->|No| RedirectLogin
    TokenValid -->|Yes| ExtractClaims[Extract Custom Claims]
    
    ExtractClaims --> CheckPermissions{Has Permission?}
    CheckPermissions -->|No| RedirectUnauthorized[Redirect to /unauthorized]
    CheckPermissions -->|Yes| AllowAccess
    
    %% API Authentication
    APIAuth --> CheckAPIAuth{Auth Header?}
    CheckAPIAuth -->|No| Return401[Return 401 Unauthorized]
    CheckAPIAuth -->|Yes| VerifyAPIToken[Verify Token]
    
    VerifyAPIToken --> APITokenValid{Valid?}
    APITokenValid -->|No| Return401
    APITokenValid -->|Yes| CheckAPIRole{Check Role & Permissions}
    
    CheckAPIRole -->|Authorized| ProcessRequest[Process API Request]
    CheckAPIRole -->|Unauthorized| Return403[Return 403 Forbidden]
    
    ProcessRequest --> AuditLog[Log to Audit Trail]
    AuditLog --> ReturnResponse[Return Response]
    
    style RedirectLogin fill:#ffebee
    style RedirectUnauthorized fill:#ffebee
    style Return401 fill:#ffcdd2
    style Return403 fill:#ffcdd2
    style AllowAccess fill:#c8e6c9
```

---

## 3. Teacher Application Flow

```mermaid
flowchart TD
    Start([Teacher Registers]) --> CreateAccount[Create Firebase Account]
    CreateAccount --> SetPendingRole[Set Role: PENDING_TEACHER]
    SetPendingRole --> ApplicationForm[Fill Application Form]
    
    ApplicationForm --> ProvideInfo{Provide Information}
    ProvideInfo --> Qualifications[Enter Qualifications]
    ProvideInfo --> Experience[Enter Experience]
    ProvideInfo --> Subjects[Select Subjects]
    ProvideInfo --> UploadDocs[Upload Documents]
    
    UploadDocs --> FirebaseStorage[Upload to Firebase Storage]
    FirebaseStorage --> SaveApplication[Save Application to DB]
    SaveApplication --> NotifyAdmin[Notify Admin]
    
    NotifyAdmin --> WaitReview[Wait for Admin Review]
    
    WaitReview --> AdminReview{Admin Reviews}
    AdminReview --> CheckQualifications{Qualifications OK?}
    
    CheckQualifications -->|No| RejectApplication[Reject Application]
    RejectApplication --> NotifyRejection[Notify Teacher]
    NotifyRejection --> ShowReason[Show Rejection Reason]
    ShowReason --> AllowResubmit[Allow Resubmission]
    AllowResubmit --> ApplicationForm
    
    CheckQualifications -->|Yes| ApproveApplication[Approve Application]
    ApproveApplication --> UpdateRole[Update Role to TEACHER]
    UpdateRole --> UpdateClaims[Update Firebase Claims]
    UpdateClaims --> NotifyApproval[Notify Teacher]
    NotifyApproval --> GrantAccess[Grant Teacher Dashboard Access]
    
    GrantAccess --> TeacherDashboard[Teacher Dashboard]
    
    style RejectApplication fill:#ffcdd2
    style ApproveApplication fill:#c8e6c9
    style TeacherDashboard fill:#f3e5f5
```

---

## 4. Profile Enhancement Flow (Student)

```mermaid
flowchart TD
    Start([Student Accesses Profile Enhancement]) --> CheckAuth{Authenticated?}
    CheckAuth -->|No| RedirectLogin[Redirect to Login]
    CheckAuth -->|Yes| CheckRole{Role = STUDENT?}
    
    CheckRole -->|No| Unauthorized[Show Unauthorized]
    CheckRole -->|Yes| LoadProfile[Load Current Profile]
    
    LoadProfile --> ShowForm[Show Enhancement Form]
    ShowForm --> UserActions{User Actions}
    
    UserActions --> UpdateAvatar[Update Avatar]
    UserActions --> UpdateBio[Update Bio]
    UserActions --> UpdateInterests[Update Interests]
    UserActions --> UpdateGoals[Update Learning Goals]
    UserActions --> UpdatePreferences[Update Study Preferences]
    
    UpdateAvatar --> UploadImage[Upload to Firebase Storage]
    UploadImage --> GetURL[Get Download URL]
    GetURL --> SaveChanges
    
    UpdateBio --> SaveChanges[Save to Database]
    UpdateInterests --> SaveChanges
    UpdateGoals --> SaveChanges
    UpdatePreferences --> SaveChanges
    
    SaveChanges --> UpdateProgress[Update Profile Completion %]
    UpdateProgress --> AuditLog[Log Profile Update]
    AuditLog --> ShowSuccess[Show Success Message]
    
    ShowSuccess --> RefreshProfile[Refresh Profile Data]
    RefreshProfile --> End([Profile Updated])
    
    style ShowSuccess fill:#c8e6c9
    style Unauthorized fill:#ffcdd2
```

---

## 5. Admin Security Monitoring Flow

```mermaid
flowchart TD
    Start([Admin Accesses Security Dashboard]) --> CheckAdmin{Role = ADMIN?}
    CheckAdmin -->|No| Unauthorized[Unauthorized Access]
    CheckAdmin -->|Yes| LoadDashboard[Load Security Dashboard]
    
    LoadDashboard --> DisplayMetrics{Display Metrics}
    
    DisplayMetrics --> FailedLogins[Failed Login Attempts]
    DisplayMetrics --> SuspiciousActivity[Suspicious Activities]
    DisplayMetrics --> RateLimits[Rate Limit Violations]
    DisplayMetrics --> SecurityAlerts[Security Alerts]
    
    FailedLogins --> AnalyzePatterns[Analyze Patterns]
    SuspiciousActivity --> AnalyzePatterns
    RateLimits --> AnalyzePatterns
    
    AnalyzePatterns --> DetectThreats{Threats Detected?}
    DetectThreats -->|Yes| GenerateAlert[Generate Security Alert]
    DetectThreats -->|No| ContinueMonitoring[Continue Monitoring]
    
    GenerateAlert --> NotifyAdmin[Notify Admin]
    NotifyAdmin --> AdminAction{Admin Action}
    
    AdminAction --> BlockUser[Block User]
    AdminAction --> ResetPassword[Force Password Reset]
    AdminAction --> InvestigateFurther[Investigate Further]
    
    BlockUser --> UpdateDB[Update Database]
    ResetPassword --> SendEmail[Send Reset Email]
    InvestigateFurther --> ViewAuditLogs[View Audit Logs]
    
    ViewAuditLogs --> ExportLogs[Export Logs]
    ExportLogs --> GenerateReport[Generate Security Report]
    
    SecurityAlerts --> ViewDetails[View Alert Details]
    ViewDetails --> TakeAction[Take Action]
    TakeAction --> ResolveAlert[Mark as Resolved]
    
    style GenerateAlert fill:#ffcdd2
    style ResolveAlert fill:#c8e6c9
```

---

## 6. API Request Flow

```mermaid
flowchart TD
    Request([API Request]) --> ValidateRequest{Valid Request?}
    ValidateRequest -->|No| Return400[Return 400 Bad Request]
    ValidateRequest -->|Yes| CheckAuth[Check Authorization]
    
    CheckAuth --> HasToken{Has Auth Token?}
    HasToken -->|No| Return401[Return 401 Unauthorized]
    HasToken -->|Yes| VerifyToken[Verify Firebase Token]
    
    VerifyToken --> TokenValid{Token Valid?}
    TokenValid -->|No| Return401
    TokenValid -->|Yes| ExtractClaims[Extract User Claims]
    
    ExtractClaims --> CheckPermission{Has Permission?}
    CheckPermission -->|No| Return403[Return 403 Forbidden]
    CheckPermission -->|Yes| ValidateInput[Validate Input Data]
    
    ValidateInput --> InputValid{Input Valid?}
    InputValid -->|No| Return422[Return 422 Validation Error]
    InputValid -->|Yes| ProcessRequest[Process Request]
    
    ProcessRequest --> DBOperation{Database Operation}
    
    DBOperation --> QueryDB[Query Database]
    DBOperation --> UpdateDB[Update Database]
    DBOperation --> DeleteDB[Delete from Database]
    
    QueryDB --> CheckResult{Result Found?}
    CheckResult -->|No| Return404[Return 404 Not Found]
    CheckResult -->|Yes| FormatResponse[Format Response]
    
    UpdateDB --> CheckSuccess{Success?}
    DeleteDB --> CheckSuccess
    
    CheckSuccess -->|No| Return500[Return 500 Server Error]
    CheckSuccess -->|Yes| LogAudit[Log to Audit Trail]
    
    LogAudit --> FormatResponse
    FormatResponse --> Return200[Return 200 Success]
    
    style Return200 fill:#c8e6c9
    style Return400 fill:#ffcdd2
    style Return401 fill:#ffcdd2
    style Return403 fill:#ffcdd2
    style Return404 fill:#ffcdd2
    style Return422 fill:#ffcdd2
    style Return500 fill:#ffcdd2
```

---

## 7. Session Management Flow

```mermaid
flowchart TD
    Login([User Logs In]) --> CreateToken[Create Firebase ID Token]
    CreateToken --> SetClaims[Set Custom Claims]
    SetClaims --> CreateSession[Create Session Cookie]
    
    CreateSession --> SetExpiry[Set Expiry Time]
    SetExpiry --> StoreSession[Store in Browser]
    
    StoreSession --> UserActivity[User Activity]
    
    UserActivity --> CheckExpiry{Session Expired?}
    CheckExpiry -->|No| ContinueSession[Continue Session]
    CheckExpiry -->|Yes| RefreshToken{Can Refresh?}
    
    RefreshToken -->|Yes| GetNewToken[Get New Token]
    GetNewToken --> CreateSession
    
    RefreshToken -->|No| ClearSession[Clear Session]
    ClearSession --> RedirectLogin[Redirect to Login]
    
    ContinueSession --> MonitorActivity[Monitor Activity]
    MonitorActivity --> InactivityCheck{Inactive Too Long?}
    
    InactivityCheck -->|Yes| ShowWarning[Show Timeout Warning]
    ShowWarning --> UserResponse{User Responds?}
    UserResponse -->|No| ClearSession
    UserResponse -->|Yes| ExtendSession[Extend Session]
    ExtendSession --> ContinueSession
    
    InactivityCheck -->|No| UserActivity
    
    UserActivity --> Logout{User Logs Out?}
    Logout -->|Yes| RevokeToken[Revoke Firebase Token]
    RevokeToken --> ClearSession
    
    style ClearSession fill:#ffcdd2
    style ContinueSession fill:#c8e6c9
```

---

## 8. Data Synchronization Flow (Firebase + PostgreSQL)

```mermaid
flowchart TD
    Event([User Event Occurs]) --> EventType{Event Type}
    
    EventType -->|Auth Event| FirebaseAuth[Firebase Authentication]
    EventType -->|Profile Update| UpdateProfile[Update Profile]
    EventType -->|File Upload| FileUpload[File Upload]
    
    FirebaseAuth --> CreateUser[Create Firebase User]
    CreateUser --> TriggerSync[Trigger Sync Service]
    
    TriggerSync --> SyncToDB[Sync to PostgreSQL]
    SyncToDB --> CreateDBRecord[Create DB Record]
    CreateDBRecord --> SetClaims[Set Firebase Custom Claims]
    SetClaims --> SyncComplete[Sync Complete]
    
    UpdateProfile --> UpdateFirestore[Update Firestore]
    UpdateProfile --> UpdatePostgres[Update PostgreSQL]
    
    UpdateFirestore --> CheckConsistency{Data Consistent?}
    UpdatePostgres --> CheckConsistency
    
    CheckConsistency -->|No| ResolveConflict[Resolve Conflict]
    ResolveConflict --> UseLatest[Use Latest Timestamp]
    UseLatest --> UpdateBoth[Update Both Systems]
    
    CheckConsistency -->|Yes| SyncComplete
    
    FileUpload --> UploadStorage[Upload to Firebase Storage]
    UploadStorage --> GetURL[Get Download URL]
    GetURL --> SaveURLToDB[Save URL to PostgreSQL]
    SaveURLToDB --> SyncComplete
    
    SyncComplete --> AuditLog[Log Sync Event]
    AuditLog --> NotifySuccess[Notify Success]
    
    style SyncComplete fill:#c8e6c9
    style ResolveConflict fill:#fff3e0
```

---

## Key Components Summary

### 1. **Authentication System**
- Firebase Authentication (Email/Password, OAuth)
- Custom Claims for role-based access
- Session management with cookies
- Token refresh mechanism

### 2. **Authorization System**
- Middleware-based route protection
- Role-based access control (RBAC)
- Permission-based actions
- Centralized auth verification (DRY principle)

### 3. **User Roles**
- **STUDENT**: Access to learning resources, tutoring, study groups
- **TEACHER**: Manage sessions, view students, upload content
- **PENDING_TEACHER**: Limited access until application approved
- **ADMIN**: Full platform management, security monitoring

### 4. **Data Storage**
- **Firebase**: Authentication, Storage (files), Firestore (real-time)
- **PostgreSQL (Neon DB)**: User profiles, applications, audit logs
- **Sync Service**: Maintains consistency between systems

### 5. **Security Features**
- Rate limiting
- Security assessment (risk levels)
- Captcha for high-risk actions
- Audit logging
- Security event monitoring
- Failed login tracking

### 6. **Key Routes**
- Public: `/`, `/auth/*`, `/demo`, `/welcome`
- Student: `/dashboard/student`, `/profile/enhance`
- Teacher: `/dashboard/teacher`, `/dashboard/teacher/students`
- Admin: `/admin`, `/admin/audit-logs`, `/admin/security-events`
- Shared: `/profile`, `/onboarding`, `/unauthorized`

---

## Technology Stack

### Frontend
- Next.js 15 (App Router)
- React 18
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Zustand (state management)

### Backend
- Next.js API Routes
- Firebase Admin SDK
- Prisma ORM
- PostgreSQL (Neon DB)

### Authentication & Storage
- Firebase Authentication
- Firebase Storage
- Firebase Firestore
- Custom session management

### Security
- hCaptcha
- Rate limiting
- Security monitoring
- Audit logging

---

## Best Practices Implemented

1. **DRY Principle**: Centralized auth in middleware
2. **Server Components**: Default to server-side rendering
3. **Suspense Boundaries**: Proper handling of async operations
4. **Type Safety**: Strict TypeScript throughout
5. **Error Handling**: Comprehensive error boundaries
6. **Security First**: Multiple layers of security checks
7. **Audit Trail**: Complete logging of sensitive operations
8. **Role-Based Access**: Granular permission system

---

*Last Updated: November 10, 2024*
