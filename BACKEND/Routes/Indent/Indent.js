import express from "express";
import { Indent } from "../../Controllers/Indent/Indent.js"
import { uploadSingle } from "../../Config/multerConfig.js"
const router = express.Router();


router.post("/", uploadSingle.single("files"), Indent);

export default router;


