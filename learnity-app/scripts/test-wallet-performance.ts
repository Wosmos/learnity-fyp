/**
 * Wallet Performance Test Script
 * Tests the optimized wallet query performance
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

async function testWalletPerformance() {
  console.log('🚀 Testing Wallet Performance...\n');

  try {
    // Get a sample user (adjust the firebaseUid as needed)
    const sampleUser = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: { id: true, firebaseUid: true, email: true },
    });

    if (!sampleUser) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`📊 Testing with user: ${sampleUser.email}\n`);

    // Test 1: Optimized query (new approach)
    console.log('Test 1: Optimized Query (with nested select)');
    const start1 = Date.now();
    
    const result = await prisma.user.findUnique({
      where: { firebaseUid: sampleUser.firebaseUid },
      select: {
        id: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            currency: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: sampleUser.id },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        description: true,
        referenceId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const end1 = Date.now();
    console.log(`✅ Completed in: ${end1 - start1}ms`);
    console.log(`   - Wallet: ${result?.wallet ? 'Found' : 'Not found'}`);
    console.log(`   - Transactions: ${transactions.length} records\n`);

    // Test 2: Check index usage
    console.log('Test 2: Verify Index Usage');
    const start2 = Date.now();
    
    const indexTest = await prisma.$queryRaw`
      EXPLAIN ANALYZE 
      SELECT id, amount, type, status, description, "referenceId", "createdAt"
      FROM wallet_transactions
      WHERE "userId" = ${sampleUser.id}
      ORDER BY "createdAt" DESC
      LIMIT 20;
    `;

    const end2 = Date.now();
    console.log(`✅ Query plan retrieved in: ${end2 - start2}ms`);
    console.log('Query Plan:', indexTest);
    console.log();

    // Test 3: Multiple concurrent requests
    console.log('Test 3: Concurrent Requests (simulating 5 users)');
    const start3 = Date.now();
    
    await Promise.all([
      prisma.walletTransaction.findMany({
        where: { userId: sampleUser.id },
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          description: true,
          referenceId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.walletTransaction.findMany({
        where: { userId: sampleUser.id },
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          description: true,
          referenceId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.walletTransaction.findMany({
        where: { userId: sampleUser.id },
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          description: true,
          referenceId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.walletTransaction.findMany({
        where: { userId: sampleUser.id },
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          description: true,
          referenceId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.walletTransaction.findMany({
        where: { userId: sampleUser.id },
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          description: true,
          referenceId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const end3 = Date.now();
    console.log(`✅ 5 concurrent requests completed in: ${end3 - start3}ms`);
    console.log(`   - Average per request: ${(end3 - start3) / 5}ms\n`);

    // Summary
    console.log('📈 Performance Summary:');
    console.log('━'.repeat(50));
    console.log(`Single Request: ${end1 - start1}ms`);
    console.log(`Concurrent Avg: ${(end3 - start3) / 5}ms`);
    console.log('━'.repeat(50));
    
    if (end1 - start1 < 500) {
      console.log('✅ EXCELLENT: Response time under 500ms target!');
    } else if (end1 - start1 < 1000) {
      console.log('⚠️  GOOD: Response time under 1s, but could be better');
    } else {
      console.log('❌ SLOW: Response time over 1s, needs optimization');
    }

  } catch (error) {
    console.error('❌ Error during performance test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testWalletPerformance();
