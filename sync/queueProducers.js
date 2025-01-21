import { sheetSyncQueue, postgresSyncQueue } from "../config/queueConfig.js";

let currentSyncSource = null;

export const syncSheetData = async (payload) => {
  currentSyncSource = 'sheet';
  await sheetSyncQueue.add({
    ...payload,
    syncSource: 'sheet'
  }, {
    removeOnComplete: false,
    removeOnFail: false,
  });
  return { message: "Sheet sync job added to queue" };
};

export const syncPostgresData = async (payload) => {
  if (currentSyncSource === 'sheet') {
    console.log("Change originated from sheet sync, skipping sync to sheet");
    return { message: "Sync skipped" };
  }
  await postgresSyncQueue.add({
    ...payload,
    syncSource: 'postgres'
  }, {
    removeOnComplete: false,
    removeOnFail: false,
  });
  return { message: "Postgres sync job added to queue" };
};

// Modify handleJobCompletion function
const handleJobCompletion = (job) => {
  const { syncSource } = job.returnvalue;
  console.log(`${syncSource === 'sheet' ? 'Sheet' : 'Postgres'} sync job ${job.id} completed`);
  
  // Reset the sync source immediately after job completion
  currentSyncSource = null;
  console.log(`Sync source reset after ${syncSource} sync`);
};

sheetSyncQueue.on("completed", handleJobCompletion);
postgresSyncQueue.on("completed", handleJobCompletion);