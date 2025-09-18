# Learnity Platform - Technical Design Document

## Overview

Learnity is a full-stack web application connecting Pakistani students with tutors through 1-on-1 sessions and collaborative study groups. The platform features real-time communication, video calling, and a gamified credit system to encourage engagement.

The architecture follows a modern microservices approach with a Next.js frontend, NestJS backend, PostgreSQL for structured data, Firebase for real-time features, and third-party integrations for video calling.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Next.js Frontend<br/>Vercel]
        B[Mobile Browser]
    end
    
    subgraph "API Layer"
        C[NestJS Backend<br/>Render]
        D[NextAuth.js]
    end
    
    subgraph "Data Layer"
        E[PostgreSQL<br/>Neon DB]
        F[Firebase Firestore<br/>Real-time Chat]
        G[Firebase Storage<br/>Profile Images]
    end
    
    subgraph "External Services"
        H[Jitsi Meet<br/>Video Calls]
        I[Sentry<br/>Error Monitoring]
        J[GitHub Actions<br/>CI/CD]
    end
    
    A --> C
    B --> C
    A --> D
    A --> F
    A --> G
    C --> E
    C --> I
    A --> H
    A --> I
    J --> A
    J --> C
```

### Technology Stack Rationale

**Frontend (Next.js 14)**
- App Router for modern routing and layouts
- Server-side rendering for SEO and performance
- Built-in API routes for simple backend operations
- Excellent TypeScript support and developer experience

**Backend (NestJS)**
- Modular architecture with decorators and dependency injection
- Built-in validation, guards, and interceptors
- Excellent TypeScript support and scalability
- Easy integration with PostgreSQL and authentication

**Database Strategy**
- **PostgreSQL (Neon)**: Structured data (users, sessions, bookings)
- **Firebase Firestore**: Real-time chat messages and presence
- **Firebase Storage**: File uploads (profile pictures)

## Components and Interfaces

### Frontend Architecture

#### Component Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Protected routes
│   │   ├── dashboard/
│   │   ├── tutors/
│   │   ├── groups/
│   │   └── profile/
│   ├── admin/             # Admin routes
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── chat/             # Chat components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── firebase.ts       # Firebase configuration
│   ├── db.ts            # Database utilities
│   └── validations.ts    # Zod schemas
└── stores/               # Zustand stores
    ├── auth.ts
    ├── chat.ts
    └── credits.ts
```

#### Key Components

**AuthProvider**
```typescript
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}
```

**ChatRoom Component**
```typescript
interface ChatRoomProps {
  groupId: string;
  userId: string;
  onVideoCallStart: () => void;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system';
}
```

**TutorCard Component**
```typescript
interface TutorCardProps {
  tutor: {
    id: string;
    name: string;
    subjects: string[];
    hourlyRate: number;
    rating: number;
    profileImage?: string;
    bio: string;
  };
  onBook: (tutorId: string) => void;
}
```

### Backend Architecture

#### Module Structure
```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── dto/
├── users/                # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── user.entity.ts
│   └── dto/
├── tutors/               # Tutor-specific features
├── groups/               # Study groups
├── sessions/             # Tutoring sessions
├── credits/              # Credit system
├── admin/                # Admin functionality
├── common/               # Shared utilities
│   ├── guards/
│   ├── decorators/
│   └── filters/
└── database/             # Database configuration
    ├── migrations/
    └── seeds/
```

#### Core Entities

**User Entity**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: 0 })
  credits: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => TutorProfile, { nullable: true })
  tutorProfile?: TutorProfile;

  @OneToMany(() => Session, session => session.student)
  studentSessions: Session[];

  @OneToMany(() => Session, session => session.tutor)
  tutorSessions: Session[];
}
```

**Session Entity**
```typescript
@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => User)
  tutor: User;

  @Column()
  subject: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'enum', enum: SessionStatus })
  status: SessionStatus;

  @Column({ default: false })
  isFree: boolean; // Paid with credits

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

**StudyGroup Entity**
```typescript
@Entity('study_groups')
export class StudyGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User)
  creator: User;

  @ManyToMany(() => User)
  @JoinTable()
  members: User[];

  @Column({ default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

## Data Models

### Database Schema Design

#### PostgreSQL Tables

**Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'tutor', 'admin')),
  profile_image TEXT,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tutor Profiles Table**
```sql
CREATE TABLE tutor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subjects TEXT[] NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Sessions Table**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  tutor_id UUID REFERENCES users(id),
  subject VARCHAR(100) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  is_free BOOLEAN DEFAULT FALSE,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Study Groups Table**
```sql
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);
```

#### Firebase Firestore Collections

**Messages Collection**
```typescript
interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: FirebaseFirestore.Timestamp;
  type: 'text' | 'system' | 'join' | 'leave';
}
```

**Group Presence Collection**
```typescript
interface GroupPresence {
  groupId: string;
  userId: string;
  userName: string;
  isOnline: boolean;
  lastSeen: FirebaseFirestore.Timestamp;
}
```

## Error Handling

### Frontend Error Handling

**Global Error Boundary**
```typescript
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global error:', error, errorInfo);
    // Send to Sentry
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

**API Error Handling**
```typescript
export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error occurred');
  }
}
```

### Backend Error Handling

**Global Exception Filter**
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    // Log error to Sentry
    Sentry.captureException(exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

## Testing Strategy

### Frontend Testing

**Component Testing with React Testing Library**
```typescript
describe('TutorCard', () => {
  const mockTutor = {
    id: '1',
    name: 'John Doe',
    subjects: ['Math', 'Physics'],
    hourlyRate: 25,
    rating: 4.5,
    bio: 'Experienced tutor',
  };

  it('should display tutor information correctly', () => {
    render(<TutorCard tutor={mockTutor} onBook={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('$25/hour')).toBeInTheDocument();
    expect(screen.getByText('Math, Physics')).toBeInTheDocument();
  });

  it('should call onBook when book button is clicked', () => {
    const mockOnBook = jest.fn();
    render(<TutorCard tutor={mockTutor} onBook={mockOnBook} />);
    
    fireEvent.click(screen.getByText('Book Session'));
    expect(mockOnBook).toHaveBeenCalledWith('1');
  });
});
```

**Integration Testing for Chat**
```typescript
describe('ChatRoom Integration', () => {
  it('should send and receive messages in real-time', async () => {
    const { getByTestId, getByText } = render(
      <ChatRoom groupId="test-group" userId="user1" />
    );

    // Send a message
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.click(sendButton);

    // Wait for message to appear
    await waitFor(() => {
      expect(getByText('Hello world')).toBeInTheDocument();
    });
  });
});
```

### Backend Testing

**Unit Testing with Jest**
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.STUDENT,
    };

    jest.spyOn(repository, 'save').mockResolvedValue(userData as User);
    
    const result = await service.create(userData);
    expect(result.email).toBe('test@example.com');
  });
});
```

**E2E Testing with Supertest**
```typescript
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'student',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.user.email).toBe('test@example.com');
        expect(res.body.token).toBeDefined();
      });
  });
});
```

## Security Considerations

### Authentication & Authorization

**JWT Token Strategy**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

**Role-based Guards**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Data Validation

**Input Validation with Zod**
```typescript
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['student', 'tutor']),
});

export const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters'),
  subject: z.string().min(2, 'Subject is required'),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});
```

**Backend DTO Validation**
```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(UserRole)
  role: UserRole;
}
```

### Security Headers & CORS

```typescript
// main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

## Performance Optimization

### Frontend Optimization

**Code Splitting & Lazy Loading**
```typescript
// Lazy load heavy components
const ChatRoom = lazy(() => import('@/components/chat/ChatRoom'));
const VideoCall = lazy(() => import('@/components/video/VideoCall'));

// Route-based code splitting
const TutorSearch = lazy(() => import('@/app/(dashboard)/tutors/page'));
```

**Image Optimization**
```typescript
import Image from 'next/image';

export function TutorAvatar({ src, alt, size = 40 }: AvatarProps) {
  return (
    <Image
      src={src || '/default-avatar.png'}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  );
}
```

**Caching Strategy**
```typescript
// SWR for data fetching
export function useTutors(filters: TutorFilters) {
  return useSWR(
    ['tutors', filters],
    () => fetchTutors(filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
}

// React Query for server state
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Backend Optimization

**Database Query Optimization**
```typescript
@Injectable()
export class TutorsService {
  async findTutors(filters: TutorFilters): Promise<TutorProfile[]> {
    const queryBuilder = this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.user', 'user')
      .where('tutor.isVerified = :verified', { verified: true })
      .andWhere('tutor.isAvailable = :available', { available: true });

    if (filters.subjects?.length) {
      queryBuilder.andWhere('tutor.subjects && :subjects', {
        subjects: filters.subjects,
      });
    }

    if (filters.minRating) {
      queryBuilder.andWhere('tutor.rating >= :minRating', {
        minRating: filters.minRating,
      });
    }

    return queryBuilder
      .orderBy('tutor.rating', 'DESC')
      .limit(20)
      .getMany();
  }
}
```

**Caching with Redis (Future Enhancement)**
```typescript
@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

## Deployment Strategy

### CI/CD Pipeline

**GitHub Actions Workflow**
```yaml
name: Deploy Learnity

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Run E2E tests
        run: npm run test:e2e

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Environment Configuration

**Frontend Environment Variables**
```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**Backend Environment Variables**
```bash
# .env
DATABASE_URL=postgresql://user:pass@host:5432/learnity
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
SENTRY_DSN=your-sentry-dsn
CORS_ORIGIN=http://localhost:3000
```

### Monitoring & Logging

**Sentry Configuration**
```typescript
// Frontend
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Backend
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

This design provides a solid foundation for your Learnity MVP while maintaining scalability for future enhancements. The architecture separates concerns properly, implements security best practices, and leverages modern technologies to deliver a performant user experience.