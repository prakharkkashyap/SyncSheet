import {
  startTransaction,
  commitTransaction,
  rollbackTransaction,
  readDataById,
  createData,
  updateData,
  deleteData,
} from "../services/dbServices.js";
import createSheetsClient from "../config/googleSheetConfig.js";
import dotenv from "dotenv";
import {
  createRow,
  updateRow,
  deleteRow,
} from "../services/googleSheetServices.js";
import { sheetSyncQueue, postgresSyncQueue } from "../config/queueConfig.js";

dotenv.config();

const SPREADSHEET_ID = process.env.SHEET_ID;
const RANGE = process.env.SHEET_RANGE;

let sheets;
const initializeSheetsClient = async () => {
  if (!sheets) {
    sheets = await createSheetsClient();
  }
};

// Process sheet sync queue
sheetSyncQueue.process(async (job, done) => {
  const { range, sheetData, syncSource } = job.data;

  if (syncSource === "postgres") {
    console.log("Change originated from PostgreSQL, skipping sync to PostgreSQL");
    done(null, { message: "Sync skipped", syncSource });
    return;
  }
  console.log("syncSource ---------------", syncSource);
  const client = await startTransaction();

  try {
    await initializeSheetsClient();
    const headersResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE + "1",
    });

    const headers = headersResult.data.values[0];

    // Iterate over all rows in the affected range
    for (let row = range.startRow - 1; row <= range.endRow - 1; row++) {
      const rowData = sheetData[row];

      if (!rowData) {
        console.log(`Row ${row + 1} deleted, deleting from database`);
        await deleteData(row, client);
      } else if (!rowData[0]) {
        console.log(`Row ${row + 1} cleared, deleting from database`);
        await deleteData(row, client);
      } else {
        const user = headers.reduce((obj, header, index) => {
          obj[header] = rowData[index] || "";
          return obj;
        }, {});

        user.id = user.id && !isNaN(user.id) ? user.id : null;
        user.age = user.age && !isNaN(user.age) ? user.age : null;

        const existingUser = await readDataById(user.id, client);

        if (existingUser) {
          const updatedUser = await updateData(user, client);
          console.log("User updated:", updatedUser);
        } else {
          const newUser = await createData(user, client);
          console.log("User created:", newUser);
        }
      }
    }

    await commitTransaction(client);
    console.log("Data synced from Google Sheet to PostgreSQL");
    
    done(null, { message: "Data synchronized successfully", syncSource });
  } catch (error) {
    await rollbackTransaction(client);
    done(new Error("Data synchronization failed: " + error.message));
  }
});

// Process postgres sync queue
postgresSyncQueue.process(async (job, done) => {
  const { syncSource, ...payload } = job.data;

  if (syncSource === "sheet") {
    console.log("Change originated from Google Sheet, skipping sync to sheet");
    done(null, { message: "Sync skipped", syncSource });
    return;
  }
  
  console.log("syncSource ---------------", syncSource);
  try {
    const operation = payload.operation || (payload.id ? "UPDATE" : "INSERT");

    switch (operation) {
      case "DELETE":
        await deleteRow(payload.id);
        console.log(`Row with ID ${payload.id} deleted from Google Sheet`);
        break;
      case "UPDATE":
        await updateRow(payload);
        console.log(`Row with ID ${payload.id} updated in Google Sheet`);
        break;
      case "INSERT":
        await createRow(payload);
        console.log(`New row inserted in Google Sheet`);
        break;
      default:
        console.log(`Unknown operation: ${operation}`);
    }

    console.log("Data synced from PostgreSQL to Google Sheet");
    done(null, { message: "Data synchronized successfully", syncSource });
  } catch (error) {
    console.error("Error syncing data to Google Sheet:", error);
    done(error);
  }
});

sheetSyncQueue.on("failed", (job, err) => {
  console.error(`Sheet sync job ${job.id} failed:`, err);
});

postgresSyncQueue.on("failed", (job, err) => {
  console.error(`Postgres sync job ${job.id} failed:`, err);
});

// Error handlers for queues
sheetSyncQueue.on("error", (error) => {
  console.error("Sheet sync queue error:", error);
});

postgresSyncQueue.on("error", (error) => {
  console.error("Postgres sync queue error:", error);
});

console.log("Sync worker is running and waiting for jobs...");