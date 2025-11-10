# Prisma Vercel Deployment Fix

## Problem
`PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"`

## Root Cause
The Prisma query engine binary wasn't being properly included in Vercel's serverless functions.

## Solution Applied

### 1. Updated `prisma/schema.prisma`
Already configured with correct binary targets:
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

### 2. Updated `next.config.ts`
Added configuration to ensure Prisma binaries are included in the build:
- `outputFileTracingIncludes`: Ensures `.prisma/client` files are traced and included
- `webpack` config: Properly externalizes Prisma for server-side rendering
- `serverExternalPackages`: Prevents bundling of Prisma packages

### 3. Updated `vercel.json`
Simplified configuration:
- Build command explicitly runs `prisma generate`
- Removed manual file inclusion (Next.js handles this automatically now)

### 4. Updated `package.json`
- `build` script: Ensures `prisma generate` runs before build
- `postinstall` script: Generates Prisma client after npm install
- `vercel-build` script: Special script for Vercel that includes migrations

## Deployment Steps

### For New Deployments:
1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Fix Prisma deployment configuration for Vercel"
   git push
   ```

2. **Verify Environment Variables in Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Ensure `DATABASE_URL` is set correctly
   - Add any other required environment variables

3. **Trigger a new deployment:**
   - Vercel will automatically deploy on push
   - Or manually trigger from Vercel dashboard

### For Existing Deployments:
1. **Clear Vercel build cache:**
   - Go to Vercel Dashboard → Your Project → Settings → General
   - Scroll to "Build & Development Settings"
   - Clear the build cache

2. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on the latest deployment
   - Select "Redeploy"

## Verification

After deployment, check:
1. ✅ Build logs show "Generating Prisma Client..."
2. ✅ No errors about missing query engine
3. ✅ Login/Register functionality works
4. ✅ Teacher dynamic pages load correctly

## Additional Notes

### If Issues Persist:
1. **Check Prisma version compatibility:**
   ```bash
   npm list @prisma/client prisma
   ```
   Ensure both are the same version (currently 5.22.0)

2. **Manually regenerate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for any Prisma-related errors

### Environment Variables Required:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Your deployment URL
- Any Firebase-related environment variables

## Testing Locally Before Deploy:
```bash
# Clean install
rm -rf node_modules .next
npm install

# Generate Prisma client
npm run db:generate

# Build the project
npm run build

# Start production server
npm start
```

## Common Errors and Solutions:

### Error: "Cannot find module '@prisma/client'"
**Solution:** Run `npm install` and `prisma generate`

### Error: "Environment variable not found: DATABASE_URL"
**Solution:** Add DATABASE_URL to Vercel environment variables

### Error: "Query engine binary not found"
**Solution:** Ensure `binaryTargets` includes "rhel-openssl-3.0.x" in schema.prisma

## Support
If issues persist after following this guide:
1. Check Vercel build logs for specific errors
2. Verify all environment variables are set
3. Ensure database is accessible from Vercel's network
4. Check Prisma version compatibility with Next.js 16
