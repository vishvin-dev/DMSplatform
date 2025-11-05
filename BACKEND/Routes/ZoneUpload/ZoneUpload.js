import express from "express";
import { zoneUpload, singleZoneUpload } from "../../Controllers/ZoneUpload/zoneUpload.js";
import { uploadSingle } from "../../Config/multerConfig.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

// Setup multer to store in "uploads/" folder
// const upload = multer({ dest: "uploads/" });

router.post("/", uploadSingle.single("csvFile"), authenticateToken,  zoneUpload);
router.post("/singleZoneUpload", authenticateToken, singleZoneUpload);

export default router;
