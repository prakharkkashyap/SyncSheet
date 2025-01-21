import express from "express";
const router = express.Router();
import {
  createDataController,
  readDataController,
  updateDataController,
  deleteDataController,
} from "../controllers/dbController.js";

router.post("/", createDataController);
router.get("/", readDataController);
router.put("/", updateDataController);
router.delete("/", deleteDataController);

export default router;
