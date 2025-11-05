import express from "express";
import { DocumentUpload, DocumentView, MannualUpload, ScanUpload } from "../../Controllers/DocumentUpload/DocumentUpload.js"
import { uploadMultiple} from "../../Config/multerConfig.js"
import { upload } from "../../Config/multerConfigg.js"
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

router.post("/", uploadMultiple , authenticateToken, DocumentUpload);

//===================THIS IS THE VIEW OF THE DOCUMENT============================================
router.post("/documentView", DocumentView);
//====================THIS IS THE MANNUAL UPLOAD OK ============================================= 
router.post("/mannualUpload", upload.single("mannualFile") , authenticateToken, MannualUpload);
//====================THIS IS THE SCANN UPLOAD OK ===============================================
router.post("/scanUpload", authenticateToken, ScanUpload);
export default router;
 

