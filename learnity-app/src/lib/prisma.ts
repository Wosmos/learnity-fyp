import { PrismaClient } from '@prisma/client';
import { env } from './env-validation';

/**
 * Prisma Client Singleton
 * Optimized for Neon DB serverless with connection pooling
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Optimized for Neon DB serverless
    // @ts-ignore - Neon DB specific optimizations
    connection: {
      pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
    },
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown handler for Prisma
 * Ensures database connections are properly closed
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectPrisma();
  });

  process.on('SIGINT', async () => {
    await disconnectPrisma();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}
