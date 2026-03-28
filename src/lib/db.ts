/**
 * Prisma Client with Enhanced Connection Management
 * عميل Prisma مع إدارة اتصال محسنة
 * 
 * This fixes the "timer has gone away" panic by:
 * 1. Limiting connection pool
 * 2. Adding proper timeouts
 * 3. Better error handling
 * 4. Connection health checks
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Connection pool settings for production
const isProduction = process.env.NODE_ENV === 'production'

function createPrismaClient(): PrismaClient {
  // Parse DATABASE_URL and add connection pool parameters for MySQL
  let databaseUrl = process.env.DATABASE_URL
  
  // For MySQL connections, add pool settings
  if (databaseUrl && databaseUrl.startsWith('mysql://')) {
    const separator = databaseUrl.includes('?') ? '&' : '?'
    // Add connection pool limits and timeouts
    databaseUrl = `${databaseUrl}${separator}connection_limit=5&pool_timeout=30&connect_timeout=10`
  }
  
  return new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    // Error format for better debugging
    errorFormat: 'pretty',
  })
}

// Singleton pattern to prevent multiple instances
let prisma: PrismaClient

if (isProduction) {
  // In production, always create a new client
  // This helps with serverless environments
  prisma = createPrismaClient()
} else {
  // In development, use global to prevent hot-reload issues
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prisma = globalForPrisma.prisma
}

export const db = prisma

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
      
      // Check if it's a connection error that might be resolved by retry
      const isConnectionError = 
        error?.code === 'P1001' || // Can't reach database server
        error?.code === 'P1002' || // Database server timed out
        error?.code === 'P1008' || // Operations timed out
        error?.code === 'P1011' || // Error opening a TLS connection
        error?.message?.includes('timed out') ||
        error?.message?.includes('ECONNREFUSED')
      
      if (!isConnectionError || attempt === maxRetries) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      console.log(`Retrying database operation (attempt ${attempt + 1}/${maxRetries})...`)
    }
  }
  
  throw lastError
}

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  const gracefulShutdown = async () => {
    try {
      await db.$disconnect()
      console.log('Database connection closed')
    } catch (error) {
      // Ignore errors during shutdown
    }
    process.exit(0)
  }

  // Handle termination signals
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
  
  // Handle beforeExit for cleanup
  process.on('beforeExit', async () => {
    try {
      await db.$disconnect()
    } catch (e) {
      // Ignore disconnect errors
    }
  })
}

export default db
