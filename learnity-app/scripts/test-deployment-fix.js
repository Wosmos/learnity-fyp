#!/usr/bin/env node

/**
 * Test script to verify deployment fixes
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing deployment fixes...\n');

// Test 1: Check Prisma schema has correct binary targets
console.log('1. Checking Prisma schema configuration...');
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

if (
  schemaContent.includes('binaryTargets = ["native", "rhel-openssl-3.0.x"]')
) {
  console.log('   ✅ Binary targets correctly configured');
} else {
  console.log('   ❌ Binary targets missing or incorrect');
}

// Test 2: Check Next.js config has Prisma externalization
console.log('2. Checking Next.js configuration...');
const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

if (
  nextConfigContent.includes('serverComponentsExternalPackages') &&
  nextConfigContent.includes('@prisma/client')
) {
  console.log('   ✅ Next.js Prisma externalization configured');
} else {
  console.log('   ❌ Next.js Prisma externalization missing');
}

// Test 3: Check Vercel config
console.log('3. Checking Vercel configuration...');
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
const vercelConfigContent = fs.readFileSync(vercelConfigPath, 'utf8');

if (
  vercelConfigContent.includes('libquery_engine-') &&
  vercelConfigContent.includes('deploy-setup.js')
) {
  console.log('   ✅ Vercel configuration updated');
} else {
  console.log('   ❌ Vercel configuration incomplete');
}

// Test 4: Check if Prisma client binary exists
console.log('4. Checking Prisma client binaries...');
const prismaClientPath = path.join(
  process.cwd(),
  'node_modules',
  '.prisma',
  'client'
);

if (fs.existsSync(prismaClientPath)) {
  const files = fs.readdirSync(prismaClientPath);
  const queryEngineFiles = files.filter(file =>
    file.includes('libquery_engine')
  );

  if (queryEngineFiles.length > 0) {
    console.log(
      '   ✅ Prisma query engine binaries found:',
      queryEngineFiles.join(', ')
    );
  } else {
    console.log(
      '   ⚠️  No query engine binaries found (run npm run db:generate)'
    );
  }
} else {
  console.log('   ⚠️  Prisma client not generated (run npm run db:generate)');
}

// Test 5: Check deployment scripts
console.log('5. Checking deployment scripts...');
const deployScriptPath = path.join(process.cwd(), 'scripts', 'deploy-setup.js');

if (fs.existsSync(deployScriptPath)) {
  console.log('   ✅ Deployment setup script exists');
} else {
  console.log('   ❌ Deployment setup script missing');
}

console.log('\n🎉 Deployment fix verification completed!');
console.log('\nNext steps:');
console.log('1. Ensure all environment variables are set in Vercel');
console.log('2. Deploy with: vercel --prod');
console.log('3. Monitor deployment logs for any issues');
console.log('4. Test API endpoints after deployment');
