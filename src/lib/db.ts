import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  try {
    return new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    throw error
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Graceful shutdown
process.on('beforeExit', async () => {
  try {
    await db.$disconnect()
  } catch (e) {
    // Ignore disconnect errors
  }
})
