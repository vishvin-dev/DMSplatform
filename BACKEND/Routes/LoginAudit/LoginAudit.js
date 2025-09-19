import express from "express";
import { LoginAudit } from "../../Controllers/LoginAudit/LoginAudit.js"

const router = express.Router();

router.post("/", LoginAudit);

export default router;
