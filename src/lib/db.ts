import { PrismaClient } from "../generated/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}


// Why this pattern and not just new PrismaClient()?
// In development, Next.js uses hot reloading — every time you save a file, the server restarts.
//  If you just did new PrismaClient() directly, every restart would create a new database connection. 
//  After a few saves you'd have hundreds of open connections and Neon would start throwing errors.
// The globalThis trick stores the client on the global object so hot reloads reuse the same instance instead of creating a new one. 
// In production this doesn't matter because the server starts once and stays running.