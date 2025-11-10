#!/usr/bin/env node

/**
 * Deployment setup script for Prisma on Vercel
 * This ensures the Prisma client is properly generated with the correct binary targets
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment setup...');

try {
  // Ensure we're in the right directory
  const prismaSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(prismaSchemaPath)) {
    throw new Error('Prisma schema not found. Make sure you\'re in the project root.');
  }

  console.log('📦 Generating Prisma client with correct binary targets...');
  
  // Generate Prisma client with explicit binary targets
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true'
    }
  });

  console.log('✅ Prisma client generated successfully');

  // Verify the binary exists
  const binaryPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  
  if (fs.existsSync(binaryPath)) {
    const files = fs.readdirSync(binaryPath);
    const queryEngineFiles = files.filter(file => file.includes('libquery_engine'));
    
    console.log('🔍 Found query engine binaries:', queryEngineFiles);
    
    if (queryEngineFiles.length === 0) {
      console.warn('⚠️  No query engine binaries found. This might cause deployment issues.');
    }
  }

  console.log('✅ Deployment setup completed successfully');

} catch (error) {
  console.error('❌ Deployment setup failed:', error.message);
  process.exit(1);
}