# Deployment Guide - Learnity App

## Prisma Deployment Fix

This guide addresses the common Prisma deployment issue on Vercel: `PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"`.

## What Was Fixed

### 1. Prisma Schema Configuration
- Added `binaryTargets = ["native", "rhel-openssl-3.0.x"]` to the Prisma generator
- This ensures the correct binary is included for Vercel's runtime environment

### 2. Next.js Configuration
- Added Prisma packages to `serverComponentsExternalPackages`
- Configured webpack to externalize `@prisma/client` on the server

### 3. Vercel Configuration
- Updated build command to use deployment setup script
- Added function configuration to include Prisma binaries
- Set environment variable to skip auto-install

### 4. Deployment Scripts
- Created `scripts/deploy-setup.js` for proper Prisma generation
- Added environment variable validation
- Created Prisma client singleton

## Deployment Steps

### 1. Environment Variables
Ensure these environment variables are set in your Vercel dashboard:

```bash
# Database
DATABASE_URL=your_neon_db_connection_string

# NextAuth
NEXTAUTH_SECRET=your_32_character_secret
NEXTAUTH_URL=https://your-domain.vercel.app

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PROJECT_ID=your_project_id

# Optional
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Verify Deployment

After deployment, check:
1. Database connection works
2. Prisma client is properly initialized
3. API routes respond correctly
4. Firebase integration works

## Troubleshooting

### If you still see Prisma errors:

1. **Clear Vercel build cache:**
   ```bash
   vercel --prod --force
   ```

2. **Regenerate Prisma client locally:**
   ```bash
   npm run db:generate
   ```

3. **Check environment variables:**
   - Ensure all required variables are set
   - Verify DATABASE_URL format
   - Check Firebase configuration

4. **Verify binary targets:**
   ```bash
   npx prisma generate --help
   ```

### Common Issues:

1. **Missing binary targets**: Fixed by adding `rhel-openssl-3.0.x` to schema
2. **Webpack externalization**: Fixed by Next.js config updates
3. **Build cache**: Clear with `--force` flag
4. **Environment variables**: Use the validation script to check

## Local Development

For local development, ensure you have:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database schema pushed to production DB
- [ ] Firebase project configured for production
- [ ] Domain configured in Vercel
- [ ] SSL certificate active
- [ ] Error monitoring configured
- [ ] Performance monitoring active

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection
4. Check Firebase configuration
5. Review Prisma client generation logs

The deployment setup script will provide detailed logs during the build process to help identify any issues.