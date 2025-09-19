import express from "express";
import { DocumentUpload, DocumentView } from "../../Controllers/DocumentUpload/DocumentUpload.js"
import { uploadMultiple} from "../../Config/multerConfig.js"

const router = express.Router();

router.post("/", uploadMultiple , DocumentUpload);
router.post("/documentView", DocumentView);

export default router;
 

