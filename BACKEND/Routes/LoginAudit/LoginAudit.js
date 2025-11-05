import express from "express";
import { LoginAudit } from "../../Controllers/LoginAudit/LoginAudit.js"
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

router.post("/", authenticateToken, LoginAudit);

export default router;
