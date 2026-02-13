# 🚀 Vercel Blob Setup Guide for Learnity

## Step 1: Create Vercel Blob Store

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project or create a new one
3. Go to **Storage** tab
4. Click **Create Database** → **Blob**
5. Choose a name: `learnity-files`
6. Click **Create**
7. Copy the **BLOB_READ_WRITE_TOKEN**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Create blob store
vercel blob create learnity-files
```

## Step 2: Add Environment Variables

Add to your `.env.local`:

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_BLOB_STORE_ID="learnity-files"
```

Add to your `.env.example`:

```env
# Vercel Blob Storage (for file uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_token_here
NEXT_PUBLIC_BLOB_STORE_ID=your_blob_store_id
```

## Step 3: Vercel Production Setup

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add the same variables:
   - `BLOB_READ_WRITE_TOKEN` = your token
   - `NEXT_PUBLIC_BLOB_STORE_ID` = learnity-files

## Step 4: Test the Setup

Create a test file to verify:

```typescript
// test-blob.ts
import { put, list } from '@vercel/blob';

async function testBlob() {
  try {
    // Test upload
    const blob = await put('test.txt', 'Hello Vercel Blob!', {
      access: 'public',
    });
    console.log('✅ Upload successful:', blob.url);

    // Test list
    const { blobs } = await list();
    console.log('✅ Files:', blobs.length);

    return true;
  } catch (error) {
    console.error('❌ Blob test failed:', error);
    return false;
  }
}
```

## Step 5: File Organization Structure

```
Blob Storage Structure:
├── profile-pictures/
│   └── {userId}/
│       └── {timestamp}-{filename}
├── documents/
│   └── {userId}/
│       ├── certificates/
│       ├── diplomas/
│       └── other/
├── banners/
│   └── {userId}/
└── temp/
    └── {sessionId}/
```

## Step 6: Security Best Practices

1. **File Size Limits**: Max 10MB per file
2. **File Type Validation**: Only allow specific types
3. **Virus Scanning**: Consider adding virus scanning
4. **Access Control**: Use signed URLs for private files
5. **Rate Limiting**: Limit uploads per user/hour

## Pricing Information

**Vercel Blob Pricing (as of 2024):**

- **Free Tier**: 5GB storage + 100GB bandwidth/month
- **Pro Tier**: $20/month for 100GB storage + 1TB bandwidth
- **Enterprise**: Custom pricing

**Cost Estimation for Learnity:**

- 1000 teachers × 5MB avg files = 5GB (Free tier covers this!)
- Bandwidth: Mostly one-time uploads, minimal ongoing costs

## Troubleshooting

### Common Issues:

1. **"Unauthorized" Error**: Check BLOB_READ_WRITE_TOKEN
2. **"File too large"**: Implement client-side size validation
3. **"Invalid file type"**: Add proper MIME type checking
4. **Slow uploads**: Use progress indicators and chunked uploads

### Debug Commands:

```bash
# Check environment variables
echo $BLOB_READ_WRITE_TOKEN

# Test CLI access
vercel blob list

# Check project linking
vercel whoami
```

## Next Steps

After setup:

1. ✅ Test file upload in development
2. ✅ Deploy to Vercel and test in production
3. ✅ Implement file management UI
4. ✅ Add file deletion functionality
5. ✅ Set up automated cleanup for temp files

---

**Ready to implement? The blob service is already configured in your app and will work once you add the token!**
