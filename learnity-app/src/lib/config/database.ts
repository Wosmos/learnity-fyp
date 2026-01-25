import { PrismaClient } from '@prisma/client';

// Extend the global object to include prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// In development, store the client on the global object to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
export default prisma;
