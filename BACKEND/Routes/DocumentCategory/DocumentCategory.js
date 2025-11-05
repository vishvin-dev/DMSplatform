import express from "express";
import { documentCategory } from "../../Controllers/DocumentCategory/DocumentCategory.js"
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

router.post("/", authenticateToken, documentCategory);

export default router;
