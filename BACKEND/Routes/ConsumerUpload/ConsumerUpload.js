import express from "express";
import multer from "multer";
import { consumerUpload, singleConsumerUpload } from "../../Controllers/ConsumerUpload/consumerUpload.js";
import { uploadSingle } from "../../Config/multerConfig.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
const router = express.Router();

// Setup multer to store in "uploads/" folder
// const upload = multer({ dest: "uploads/" });

router.post("/", uploadSingle.single("csvFile"), authenticateToken, consumerUpload);
router.post("/singleConsumerUpload", authenticateToken, singleConsumerUpload);

export default router;
