import { PrismaClient } from '@prisma/client';
import { env } from './env-validation';

/**
 * Prisma Client Singleton
 * Prevents multiple instances of PrismaClient in development
 * and ensures proper connection handling in production
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
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
