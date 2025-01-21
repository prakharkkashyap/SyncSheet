import dotenv from "dotenv";
import Redis from "ioredis";
import Queue from "bull";

dotenv.config();

// Initialize Redis client
export const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("error", (error) => {
  console.error("Redis connection error:", error);
});

const queueOptions = {
  redis: process.env.REDIS_URL,
  settings: {
    stalledInterval: 30000,
    maxStalledCount: 1,
    lockDuration: 30000,
  },
};

// Create queues
export const sheetSyncQueue = new Queue("sheetSync", queueOptions);
export const postgresSyncQueue = new Queue("postgresSync", queueOptions);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing queues and Redis connection");
  await sheetSyncQueue.close();
  await postgresSyncQueue.close();
  await redisClient.quit();
  process.exit(0);
});