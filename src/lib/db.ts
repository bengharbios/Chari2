/**
 * Prisma Client for Production
 * عميل Prisma للإنتاج
 * 
 * Optimized for Next.js serverless/edge deployment
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
  })
}

// Singleton pattern - essential for serverless
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Helper function to execute queries with retry
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      const isConnectionError = 
        error?.code === 'P1001' ||
        error?.code === 'P1002' ||
        error?.code === 'P1008' ||
        error?.code === 'P1011' ||
        error?.message?.includes('timed out') ||
        error?.message?.includes('ECONNREFUSED')
      
      if (!isConnectionError || attempt === maxRetries) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      console.log(`Retrying database operation (attempt ${attempt + 1}/${maxRetries})...`)
    }
  }
  
  throw lastError
}

export default db
