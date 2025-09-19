import express from "express";
import { Qcupload, verifiedQc } from "../../Controllers/Qcupload/Qcupload.js"


const router = express.Router();

router.post("/" , Qcupload);
router.post("/verifiedQc" , verifiedQc);





export default router;
 

