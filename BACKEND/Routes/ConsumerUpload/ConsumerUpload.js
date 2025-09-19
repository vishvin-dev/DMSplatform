import express from "express";
import multer from "multer";
import { consumerUpload, singleConsumerUpload } from "../../Controllers/ConsumerUpload/consumerUpload.js";
import { uploadSingle } from "../../Config/multerConfig.js";

const router = express.Router();

// Setup multer to store in "uploads/" folder
// const upload = multer({ dest: "uploads/" });

router.post("/", uploadSingle.single("csvFile"), consumerUpload);
router.post("/singleConsumerUpload", singleConsumerUpload);

export default router;
