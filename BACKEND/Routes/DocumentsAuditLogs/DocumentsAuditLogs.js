import express from "express";
import { DocumentsAuditLogs } from "../../Controllers/DocumentsAuditLogs/DocumentsAuditLogs.js"
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();


router.post("/", authenticateToken, DocumentsAuditLogs);

export default router;


