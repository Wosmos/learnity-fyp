/**
 * Global Test Setup
 * Configuration and setup for all tests
 */

import { jest } from '@jest/globals';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only-32-chars';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Firebase test configuration
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:test123';

process.env.FIREBASE_ADMIN_PRIVATE_KEY = 'test-private-key';
process.env.FIREBASE_ADMIN_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
process.env.FIREBASE_ADMIN_PROJECT_ID = 'test-project';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
  })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  OAuthProvider: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updatePassword: jest.fn(),
  onAuthStateChanged: jest.fn(),
  onIdTokenChanged: jest.fn(),
  getIdToken: jest.fn(),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  connectAuthEmulator: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  connectStorageEmulator: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('firebase/app-check', () => ({
  initializeAppCheck: jest.fn(),
  ReCaptchaEnterpriseProvider: jest.fn(),
}));

// Mock Firebase Admin
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn(),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    setCustomUserClaims: jest.fn(),
    getUser: jest.fn(),
  })),
}));

jest.mock('firebase-admin/storage', () => ({
  getStorage: jest.fn(),
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    studentProfile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    teacherProfile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    adminProfile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    securityEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  })),
  UserRole: {
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
    ADMIN: 'ADMIN',
    PENDING_TEACHER: 'PENDING_TEACHER',
  },
  ApplicationStatus: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  },
}));

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Map(),
    })),
    redirect: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock React hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: j  } };
  se,
     ass: fal
        p})`,n(', ')lidRoles.joi (${vauser role a valid to beed} receivpected ${=> `ex() ge:      messan {
   
      retur } else {
   
      }; true,ss:    pae`,
    er rolusd li a vabeot to received} nexpected ${) => `  message: ({
           return ss) {
 (pa  
    if d);
  ceivencludes(relidRoles.iass = vast p    conER'];
DING_TEACHMIN', 'PEN 'AD, 'TEACHER',UDENT'Roles = ['STnst valid{
    coany) ed: rRole(receiveValidUse  
  toHav
  },;
    }
,
      }ss: false    pa  ,
  D`irebase UI Fvalided} to be a d ${receiv => `expecteessage: () m    eturn {
      r   {

    } else  };,
      true       pass:ase UID`,
  valid Fireb aot to beed} nreceiv`expected ${() =>  message:       
  {eturn    rpass) {
  f (
    i;
    gth > 0ved.len' && recei= 'stringeived ==recf peo= tyst pass on
    cring) {st(received: seUiddFirebaali
  
  toBeV,  }
  }  };
  ,
    alse: f    pass`,
    mailvalid ebe a d} to receiveed ${ct () => `expesage:  mes      eturn {
{
      r} else     };
    
  pass: true,    
    id email`, a valnot to bereceived} ${cted () => `expee:  messag {
       urn    ret(pass) {
    
    if 
  ved);ceiex.test(reegilRt pass = ema cons;
   @]+$/\.[^\s^\s@]+/^[^\s@]+@[= ex ailRegconst emng) {
    rireceived: stil(malidE toBeVa{
 nd(exte
expect.rsatchem musto});

// CllMocks();
toreAst.res=> {
  jefterEach(() 

a});cks();
AllMoarest.cle() => {
  jforeEach(lpers
beteardown heetup and 
};

// S(),ror: jest.fn  erjest.fn(),
: arn.fn(),
  wo: jestn(),
  inf jest.fed
  log:ly needss explicitts unle.log in tesconsoless  // Suppreconsole,
 e = {
  ...bal.consollost.fn();
gtch = je.felobalies
gst utilit/ Global te
/));
null })),
}({ current: ) => f: jest.fn((),
  useRe()n((fn) => fnest.f  useMemo: jn),
=> f) st.fn((fnallback: je useC),
 est.fn(eContext: j(),
  usect: jest.fnseEff(),
  uest.fn