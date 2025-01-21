import express from "express";
const router = express.Router();
import {
  createRowController,
  readRowsController,
  updateRowController,
  deleteRowController,
  syncSheetController,
} from "../controllers/googleSheetController.js";

router.post("/", createRowController);
router.post("/sheet-trigger", syncSheetController);
router.get("/", readRowsController);
router.put("/", updateRowController);
router.delete("/", deleteRowController);

export default router;
