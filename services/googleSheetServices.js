import createSheetsClient from "../config/googleSheetConfig.js";
import { syncSheetData, syncPostgresData } from '../sync/queueProducers.js';

import dotenv from "dotenv";
dotenv.config();

const SPREADSHEET_ID = process.env.SHEET_ID; // Your Google Sheet ID
const RANGE = process.env.SHEET_RANGE;

let sheets;
const initializeSheetsClient = async () => {
  if (!sheets) {
    sheets = await createSheetsClient();
  }
};

// Create (Append Row)
export const createRow = async (data) => {
  const { id, name, age, city } = data;
  await initializeSheetsClient();

  // Check if the row with the same ID already exists
  const existingRows = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = existingRows.data.values;
  if (rows.some(row => row[0] == id)) {
    throw new Error(`Row with ID ${id} already exists`);
  }

  // Append the new row
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A2:D", // Append to the data range (starting from row 2)
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[id, name, age, city]], // Add the new row
    },
  });
};

// Read (Get All Rows with Structured Data)
export const readRows = async () => {
  await initializeSheetsClient();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE, // Get the full range including headers
  });

  const rows = result.data.values;
  if (rows.length) {
    const headers = rows[0]; // The first row will be headers (id, name, age, city)
    const data = rows.slice(1); // The remaining rows will be the actual data

    return data.map((row) => {
      return headers.reduce((obj, header, index) => {
        obj[header] = row[index] || ""; // Map each column to its header
        return obj;
      }, {});
    });
  } else {
    throw new Error("No data found");
  }
};

// Update Row
export const updateRow = async (data) => {
  const { id, name, age, city } = data; // rowNumber is the row index you want to update
  const rowNumber = id + 1;

  await initializeSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!A${rowNumber}:D${rowNumber}`, // Update specific row
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[id, name, age, city]],
    },
  });
};

// Delete Row (Clear Row)
export const deleteRow = async (id) => {
  const rowNumber = id + 1;
  await initializeSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!A${rowNumber}:D${rowNumber}`,
  });
};

// Export the worker functions
export { syncSheetData, syncPostgresData };