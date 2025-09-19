import express from "express";
import { DocumentsAuditLogs } from "../../Controllers/DocumentsAuditLogs/DocumentsAuditLogs.js"
const router = express.Router();


router.post("/", DocumentsAuditLogs);

export default router;


