import express from "express";
import { Indent, IndentrResubmitted, RejetedIndent } from "../../Controllers/Indent/Indent.js"
import { IndentProjectHead, IndentProjectHeadFecth } from "../../Controllers/Indent/Indentprjecthead.js"
import { IndentView } from "../../Controllers/Indent/IndentView.js"
import {uploadSingle} from "../../Config/multerConfig.js"
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

//THIS IS THE CREATED_INDENT SCREEN ROUTE AND THE OFFICRES SCREEN ROUTE 
router.post("/", authenticateToken, Indent);

//THIS IS THE INDENTRESUBMITTED TO THE OFFICERS OK AND THIS IS THE RESUBMITTED INDENT SCREEN
router.post("/resubmittedIndent", authenticateToken, IndentrResubmitted);

router.post("/rejected", RejetedIndent);

//THIS IS THE PROJECT_HEAD SCREEN ROUTE AND THE VIEW_INDENT SCREEN ROUTE
router.post("/IndentProjectHead", uploadSingle.single("ApprovedFilePath"), authenticateToken, IndentProjectHead);

//THIS IS THE PROJECT_HEAD SCREEN ROUTE AND THE FETCHING THE OFFICER PENDING APPROVAL AND REJECTED THINGS  SCREEN ROUTE
router.post("/projectHeadFetch", authenticateToken, IndentProjectHeadFecth);

//THIS IS THE INDENTVIEW COMPLETE SCREEN OK 
router.post("/indentView", authenticateToken, IndentView);



export default router;


