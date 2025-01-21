import {
  createRow,
  readRows,
  updateRow,
  deleteRow,
  syncSheetData,
} from "../services/googleSheetServices.js";
import {
  createData,
  updateData,
  deleteData,
  startTransaction,
  commitTransaction,
  rollbackTransaction,
} from "../services/dbServices.js";

// Create (Append Row)
export const createRowController = async (req, res) => {
  const transaction = await startTransaction();
  try {
    await createRow(req.body);
    await createData(req.body, transaction);
    await commitTransaction(transaction);
    res.status(201).json({ message: "Row added successfully" });
  } catch (error) {
    await rollbackTransaction(transaction);
    res.status(500).json({ error: error.message });
  }
};

// Read (Get All Rows with Structured Data)
export const readRowsController = async (req, res) => {
  try {
    const structuredData = await readRows();
    res.status(200).json(structuredData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Row
export const updateRowController = async (req, res) => {
  const transaction = await startTransaction();
  try {
    await updateRow(req.body);
    await updateData(req.body, transaction);
    await commitTransaction(transaction);
    res.status(200).json({ message: "Row updated successfully" });
  } catch (error) {
    await rollbackTransaction(transaction);
    res.status(500).json({ error: error.message });
  }
};

// Delete Row (Clear Row)
export const deleteRowController = async (req, res) => {
  const transaction = await startTransaction();
  try {
    await deleteRow(req.body.id);
    await deleteData(req.body.id, transaction);
    await commitTransaction(transaction);
    res.status(200).json({ message: "Row deleted successfully" });
  } catch (error) {
    await rollbackTransaction(transaction);
    res.status(500).json({ error: error.message });
  }
};

// Function to sync Google Sheets data
export const syncSheetController = async (req, res) => {
  const payload = req.body;
  console.log("payload");
  console.log(payload);
  try {
    const result = await syncSheetData(payload);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in syncing data:", error.message);
    res
      .status(500)
      .json({ message: "Error in syncing data", error: error.message });
  }
};
