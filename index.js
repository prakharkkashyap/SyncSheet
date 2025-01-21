import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import googleSheetRoutes from "./routes/googleSheetRoutes.js";
import dbRoutes from "./routes/dbRoutes.js";
import { listenToNotifications } from './sync/notificationListener.js';
import { sheetSyncQueue, postgresSyncQueue } from "./config/queueConfig.js";
import "./sync/syncWorker.js";  // This will start the queue processing

dotenv.config();

const app = express();
app.use(cors());  
app.use(express.json());

// Google Sheets API routes
app.use("/api/sheets", googleSheetRoutes);

// PostgreSQL API routes
app.use("/api/db", dbRoutes);

app.use("/", (req, res) => {
  res.status(200).json({ message: "we are live" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  listenToNotifications(); // Initialize the notification listener
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server and queues');
  server.close(async () => {
    await sheetSyncQueue.close();
    await postgresSyncQueue.close();
    process.exit(0);
  });
});