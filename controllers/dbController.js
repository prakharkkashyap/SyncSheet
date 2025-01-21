import { createData, readData, updateData, deleteData, startTransaction, commitTransaction, rollbackTransaction } from '../services/dbServices.js';
import { createRow, readRows, updateRow, deleteRow } from '../services/googleSheetServices.js';

// Create
export const createDataController = async (req, res) => {
  const transaction = await startTransaction();
  try {
    const result = await createData(req.body, transaction);
    // await createRow(result);
    await commitTransaction(transaction);
    res.status(201).json(result);
  } catch (error) {
    await rollbackTransaction(transaction);
    res.status(500).json({ error: error.message });
  }
};

// Read
export const readDataController = async (req, res) => {
  try {
    const result = await readData();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
export const updateDataController = async (req, res) => {
  const transaction = await startTransaction();
  try {
    const result = await updateData(req.body, transaction);
    // await updateRow(result);
    await commitTransaction(transaction);
    res.status(200).json(result);
  } catch (error) {
    await rollbackTransaction(transaction);
    res.status(500).json({ error: error.message });
  }
};

// Delete
export const deleteDataController = async (req, res) => {
  const transaction = await startTransaction();
  try {
    const result = await deleteData(req.body.id, transaction);
    // await deleteRow(req.body.id);
    await commitTransaction(transaction);
    res.status(200).json(result);
  } catch (error) {
    await rollbackTransaction(transaction);
    res.status(500).json({ error: error.message });
  }
};
