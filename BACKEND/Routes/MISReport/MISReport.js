import express from "express";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
import { MISReport } from "../../Controllers/MISReport/MISReport.js"

const router = express.Router();

router.post("/", authenticateToken, MISReport);




export default router;


