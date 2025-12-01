# Certificate PDF Generation Troubleshooting

## Error: "PDF_GENERATION_FAILED"

If you're seeing this error when trying to download a certificate, follow these steps:

### Step 1: Test PDF Generation

Run the PDF generation test:

```bash
npm run test:pdf
```

This will:
- Test if PDFKit is working correctly
- Generate a simple test PDF
- Save it as `test-certificate.pdf` in the project root

**Expected output:**
```
🧪 Testing PDF generation...
✅ PDF generation successful!
📄 Test PDF saved to: /path/to/test-certificate.pdf
📊 PDF size: XXXX bytes
```

### Step 2: Check Server Logs

When you try to download a certificate, check your server console for detailed error messages. The error logs will show:
- The specific error that occurred
- Certificate data being processed
- Stack trace for debugging

### Step 3: Verify Certificate Data

Make sure the certificate exists in the database:

```bash
npm run db:seed:certificates
```

This will create test certificates and display their IDs.

### Step 4: Test with Demo Page

1. Visit `/certificates/demo`
2. Check "Use real certificate ID for download"
3. Enter a certificate ID from the seed output
4. Try downloading

### Common Issues and Solutions

#### Issue 1: PDFKit Not Installed

**Symptoms:** Module not found error

**Solution:**
```bash
npm install pdfkit @types/pdfkit
```

#### Issue 2: Missing Certificate Data

**Symptoms:** "Invalid certificate data" error

**Solution:**
- Ensure the certificate exists in the database
- Run the seed script to create test data
- Verify the certificate ID is correct

#### Issue 3: Memory Issues

**Symptoms:** Out of memory errors

**Solution:**
- Increase Node.js memory limit:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

#### Issue 4: Font Issues

**Symptoms:** Font-related errors in PDF generation

**Solution:**
PDFKit uses built-in fonts. If you see font errors:
- Make sure you're using standard fonts (Helvetica, Times, Courier)
- Don't try to load custom fonts without proper setup

### Debugging Steps

1. **Check the API response:**
```bash
curl -v http://localhost:3000/api/certificates/CERT-XXXXXXXX-XXXX/download
```

2. **Check certificate exists:**
```bash
curl http://localhost:3000/api/certificates/CERT-XXXXXXXX-XXXX
```

3. **View server logs:**
Look for detailed error messages in your terminal where the dev server is running.

### Manual Testing

You can test the certificate service directly:

```typescript
// In a test file or API route
import { certificateService } from '@/lib/services/certificate.service';

const certificate = await certificateService.getCertificate('CERT-XXXXXXXX-XXXX');
if (certificate) {
  const pdfBuffer = await certificateService.downloadCertificatePDF('CERT-XXXXXXXX-XXXX');
  console.log('PDF generated successfully, size:', pdfBuffer.length);
}
```

### Environment-Specific Issues

#### Development
- Make sure `npm run dev` is running
- Check for TypeScript compilation errors
- Verify all dependencies are installed

#### Production
- Ensure PDFKit is included in production dependencies
- Check serverless function timeout limits
- Verify memory limits are sufficient

### Getting Help

If none of these solutions work:

1. Check the full error stack trace in server logs
2. Verify your Node.js version (should be 18+)
3. Try deleting `node_modules` and reinstalling:
```bash
rm -rf node_modules package-lock.json
npm install
```

4. Check if there are any TypeScript errors:
```bash
npx tsc --noEmit
```

### Success Checklist

- [ ] `npm run test:pdf` passes
- [ ] Certificate exists in database
- [ ] No TypeScript errors
- [ ] Server is running without errors
- [ ] PDFKit is installed
- [ ] Certificate ID is valid
- [ ] API route returns 200 status
