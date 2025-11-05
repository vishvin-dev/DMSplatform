import express from "express";
import { Qcupload, verifiedQc } from "../../Controllers/Qcupload/Qcupload.js"
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.post("/" , authenticateToken, Qcupload);
router.post("/verifiedQc" , authenticateToken, verifiedQc);





export default router;
 

