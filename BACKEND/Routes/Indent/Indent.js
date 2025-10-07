import express from "express";
import { Indent } from "../../Controllers/Indent/Indent.js"
import { IndentProjectHead } from "../../Controllers/Indent/Indentprjecthead.js"
import { uploadSingle } from "../../Config/multerConfig.js"
const router = express.Router();

//THIS IS THE CREATED_INDENT SCREEN ROUTE AND THE OFFICRES SCREEN ROUTE 
router.post("/", Indent);

//THIS IS THE PROJECT_HEAD SCREEN ROUTE AND THE VIEW_INDENT SCREEN ROUTE
router.post("/IndentProjectHead", uploadSingle.single("files"), IndentProjectHead);

export default router;


