import express from "express";
import { Indent } from "../../Controllers/Indent/Indent.js"
const router = express.Router();


router.post("/", Indent);

export default router;


