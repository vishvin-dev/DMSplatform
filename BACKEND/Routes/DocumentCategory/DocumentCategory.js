import express from "express";
import { documentCategory } from "../../Controllers/DocumentCategory/DocumentCategory.js"

const router = express.Router();

router.post("/", documentCategory);

export default router;
