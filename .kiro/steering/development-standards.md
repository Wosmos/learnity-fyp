# Learnity Development Standards & Best Practices

## Core Principles

### 1. Object-Oriented Programming (OOP) & Dependency Injection (DI)
- **MUST** use class-based architecture for all business logic
- **MUST** implement dependency injection patterns
- **MUST** follow SOLID principles strictly
- **MUST** use interfaces for all service contracts
- **MUST** implement proper abstraction layers

### 2. Next.js 15 Best Practices
- **MUST** use App Router exclusively (no Pages Router)
- **MUST** implement Server Components by default
- **MUST** use Client Components only when necessary
- **MUST** leverage Next.js new caching strategies
- **MUST** implement proper error boundaries
- **MUST** implement Partial Pre Rendering
- **MUST** use TypeScript strictly with no `any` types
- **MUST** set interfaces at there dedecated file
- **MUST** set helper functions at there dedecated file or folder
- **MUST** avoid dublication as much as possible
- **MUST** improve DRI and better optimization practices for speed and better code quality
- **MUST** test each and every task we implemented
- **MUST** always verify if we are using correct code structre for each tech stack using their official documentation
- **MUST** follow the design pattern provided in /design folder
- **MUST** follow the proper consistent cleaner design pattern for better product
- **MUST** follow proper error handling 
- **MUST** follow proper type safety 
- **MUST** follow proper next js all best practices as much as possible 
- **MUST** follow proper optional chaining and usefull error loging and handling also use toasts for proper user flow guidance for user

### 3. Architecture Patterns
- **MUST** follow Clean Architecture principles
- **MUST** implement Repository pattern for data access
- **MUST** use Service layer for business logic
- **MUST** implement Command/Query separation
- **MUST** use Factory pattern for object creation
- **MUST** implement Observer pattern for events

## Technology Stack Requirements

### Frontend Stack
```typescript
// Required stack components
const TECH_STACK = {
  framework: "Next.js 16 (App Router)",
  language: "TypeScript (strict mode)",
  styling: "Tailwind CSS + shadcn/ui",
  stateManagement: "Zustand with TypeScript",
  forms: "React Hook Form + Zod validation",
  fileUpload: "Firebase Storage SDK",
  realtime: "Firebase Firestore SDK",
  testing: "Jest + React Testing Library",
  linting: "ESLint + Prettier + TypeScript ESLint"
} as const;
```

### Backend Stack
```typescript
const BACKEND_STACK = {
  api: "Next.js API Routes (App Router)",
  database: "PostgreSQL (Neon DB) with Prisma ORM",
  authentication: "NextAuth.js v5",
  validation: "Zod schemas",
  caching: "Next.js built-in caching",
  realtime: "Firebase Firestore",
  fileStorage: "Firebase Storage"
} as const;
```

### Required Dependencies
```json
{
  "dependencies": {
    "firebase": "^10.7.0",
    "firebase-admin": "^11.11.1",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "next-auth": "^5.0.0-beta.4",
    "zod": "^3.22.4",
    "zustand": "^4.4.6",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

## Code Organization Standards

### 1. Directory Structure (MANDATORY)
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   ├── (dashboard)/       # Dashboard route group
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Core utilities
│   ├── services/         # Business logic services
│   ├── repositories/     # Data access layer
│   ├── interfaces/       # TypeScript interfaces
│   ├── factories/        # Object factories
│   ├── validators/       # Zod schemas
│   └── utils/           # Utility functions
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── constants/           # Application constants
```

### 2. Class-Based Service Architecture
```typescript
// Example service implementation
interface IUserService {
  createUser(userData: CreateUserDto): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: UpdateUserDto): Promise<User>;
}

@Injectable()
class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly gamificationService: IGamificationService
  ) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    // Implementation with proper error handling
  }
}
```

### 3. Repository Pattern Implementation
```typescript
interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  
  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
```

## Performance & Scalability Requirements

### 1. Performance Targets (MANDATORY)
- **Page Load Time**: < 2 seconds (LCP)
- **Bundle Size**: < 500KB initial load
- **API Response Time**: < 200ms average
- **Database Queries**: < 100ms average
- **Mobile Performance**: 60fps animations

### 2. Caching Strategy
```typescript
// Required caching implementation
const CACHING_STRATEGY = {
  staticData: "Next.js Static Generation",
  dynamicData: "Next.js Data Cache",
  apiResponses: "Next.js Route Cache",
  userSessions: "NextAuth.js built-in",
  realTimeData: "Firebase Firestore cache",
  fileStorage: "Firebase Storage CDN"
} as const;
```

### 3. Code Splitting & Optimization
- **MUST** use dynamic imports for heavy components
- **MUST** implement lazy loading for images
- **MUST** use React.memo for expensive components
- **MUST** implement proper loading states
- **MUST** use Suspense boundaries

## Security Standards (MANDATORY)

### 1. Authentication & Authorization
```typescript
// Required security implementation
interface IAuthService {
  authenticate(credentials: LoginDto): Promise<AuthResult>;
  authorize(user: User, resource: string, action: string): Promise<boolean>;
  validateToken(token: string): Promise<User | null>;
}

// Role-based access control
enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}
```

### 2. Data Validation
- **MUST** use Zod schemas for all inputs
- **MUST** validate on both client and server
- **MUST** sanitize all user inputs
- **MUST** implement rate limiting
- **MUST** use HTTPS only in production

### 3. Error Handling
```typescript
// Required error handling pattern
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}

// Global error handler
const errorHandler = (error: AppError, req: Request, res: Response) => {
  // Implementation
};
```

## Testing Requirements (MANDATORY)

### 1. Testing Strategy
- **Unit Tests**: 80%+ coverage for services and utilities
- **Integration Tests**: All API endpoints
- **Component Tests**: All UI components
- **E2E Tests**: Critical user flows

### 2. Testing Implementation
```typescript
// Required test structure
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    userService = new UserService(mockUserRepository);
  });

  it('should create user successfully', async () => {
    // Test implementation
  });
});
```

## Gamification System Standards

### 1. XP System Implementation
```typescript
interface IGamificationService {
  awardXP(userId: string, activity: ActivityType, amount: number): Promise<void>;
  calculateLevel(totalXP: number): number;
  updateStreak(userId: string): Promise<StreakResult>;
  checkAchievements(userId: string): Promise<Achievement[]>;
}

class GamificationService implements IGamificationService {
  // Implementation following OOP principles
}
```

### 2. Streak System Rules
- **Daily Activity**: Must be tracked precisely
- **Streak Calculation**: Based on consecutive days
- **Timezone Handling**: User's local timezone
- **Streak Rewards**: Multiplier bonuses

## Database Standards

### 1. Neon DB + Prisma Schema Requirements
```prisma
// Required schema patterns for Neon DB
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      UserRole
  avatarUrl String?  // Firebase Storage URL
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  progress UserProgress?
  
  @@map("users")
}

model UserProgress {
  id           String   @id @default(cuid())
  userId       String   @unique
  totalXP      Int      @default(0)
  currentLevel Int      @default(1)
  streak       Int      @default(0)
  lastActivity DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_progress")
}
```

### 2. Firebase Integration Standards
```typescript
// Required Firebase client setup
interface IFirebaseService {
  uploadFile(path: string, file: File): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getDownloadUrl(path: string): Promise<string>;
  subscribeToCollection<T>(collection: string, callback: (data: T[]) => void): () => void;
}

class FirebaseService implements IFirebaseService {
  constructor(
    private readonly storage: FirebaseStorage,
    private readonly firestore: Firestore
  ) {}
  
  async uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
}
```

### 3. Query Optimization (Neon DB)
- **MUST** use proper indexes
- **MUST** implement pagination
- **MUST** use select for specific fields
- **MUST** implement connection pooling
- **MUST** use transactions for related operations
- **MUST** leverage Neon DB's serverless scaling

## File Storage & Real-time Standards (Firebase)

### 1. Firebase Storage Implementation
```typescript
// Required file storage patterns
interface IFileStorageService {
  uploadAvatar(userId: string, file: File): Promise<string>;
  uploadDocument(userId: string, file: File): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getDownloadUrl(path: string): Promise<string>;
}

class FirebaseStorageService implements IFileStorageService {
  private readonly STORAGE_PATHS = {
    AVATARS: 'avatars',
    DOCUMENTS: 'documents',
    LESSON_CONTENT: 'lesson-content'
  } as const;

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileName = `${this.STORAGE_PATHS.AVATARS}/${userId}/${Date.now()}-${file.name}`;
    return this.uploadFile(fileName, file);
  }

  private async uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
}
```

### 2. Firebase Firestore Real-time Implementation
```typescript
// Required real-time patterns
interface IRealTimeService {
  subscribeToStudyGroup(groupId: string, callback: (messages: any[]) => void): () => void;
  subscribeToUserProgress(userId: string, callback: (progress: any) => void): () => void;
  addMessage(groupId: string, message: any): Promise<void>;
}

class FirestoreRealTimeService implements IRealTimeService {
  subscribeToStudyGroup(groupId: string, callback: (messages: any[]) => void) {
    const messagesRef = collection(this.firestore, 'study-groups', groupId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  }

  async addMessage(groupId: string, message: any): Promise<void> {
    const messagesRef = collection(this.firestore, 'study-groups', groupId, 'messages');
    await addDoc(messagesRef, {
      ...message,
      createdAt: serverTimestamp()
    });
  }
}
```

### 3. Firebase Security Rules
```javascript
// Required Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Study group messages
    match /study-groups/{groupId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}

// Firebase Storage security rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own avatars
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can upload documents
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Mobile-First Development

### 1. Responsive Design Requirements
- **MUST** design for mobile first
- **MUST** use Tailwind responsive classes
- **MUST** implement touch-friendly interfaces
- **MUST** optimize for various screen sizes
- **MUST** ensure 60fps animations on mobile

### 2. Progressive Web App Features
- **MUST** implement service workers
- **MUST** add web app manifest
- **MUST** enable offline functionality
- **MUST** implement push notifications
- **MUST** optimize for mobile networks

## Code Quality Standards

### 1. TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 2. ESLint Configuration
- **MUST** use TypeScript ESLint rules
- **MUST** enforce consistent code style
- **MUST** prevent common errors
- **MUST** ensure accessibility compliance
- **MUST** follow React best practices

### 3. Git Workflow
- **MUST** use conventional commits
- **MUST** create feature branches
- **MUST** require PR reviews
- **MUST** run tests before merge
- **MUST** maintain clean commit history

## Deployment Standards

### 1. Environment Configuration
```typescript
// Required environment validation
const envSchema = z.object({
  DATABASE_URL: z.string().url(), // Neon DB connection string
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string(),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string(),
  // ... other required env vars
});

export const env = envSchema.parse(process.env);
```

### 2. Production Requirements
- **MUST** use environment variables for secrets
- **MUST** implement proper logging
- **MUST** set up monitoring and alerts
- **MUST** implement health checks
- **MUST** use CDN for static assets

## Documentation Standards

### 1. Code Documentation
- **MUST** document all public APIs
- **MUST** use JSDoc for functions
- **MUST** maintain README files
- **MUST** document architecture decisions
- **MUST** keep documentation up to date

### 2. API Documentation
- **MUST** document all endpoints
- **MUST** include request/response examples
- **MUST** specify error codes
- **MUST** maintain OpenAPI specs
- **MUST** provide integration examples

## Compliance Checklist

Before any code is considered complete, it MUST pass this checklist:

- [ ] Follows OOP principles with proper DI
- [ ] Uses TypeScript with strict mode
- [ ] Implements proper error handling
- [ ] Has comprehensive tests (80%+ coverage)
- [ ] Follows security best practices
- [ ] Optimized for performance
- [ ] Mobile-responsive design
- [ ] Proper documentation
- [ ] Passes all linting rules
- [ ] Uses approved tech stack only

## Enforcement

These standards are MANDATORY and will be enforced in every code review and implementation. Any deviation must be explicitly justified and approved.

**Remember**: Fast development doesn't mean compromising on quality. These standards ensure we build a scalable, maintainable, and high-performance application quickly.