// routes/scannerRoutes.js
import express from "express";
import { scanDocument, listScanners } from "../controllers/scannerController.js";

const router = express.Router();

// List scanners
router.get("/scanners", listScanners);

// Scan
router.post("/scan", scanDocument);

export default router;
