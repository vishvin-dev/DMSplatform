import express from "express";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";
import { MISReportDropdown, getUsersDropdown, zonesCountsReport, sectionRoleUserWiseReport } from "../../Controllers/MISReport/MISReport.js"

const router = express.Router();

router.post("/dropdown", authenticateToken, MISReportDropdown);
router.post("/users", authenticateToken, getUsersDropdown);           
router.post("/getReportData", zonesCountsReport);
router.post("/sectionRoleUserWiseReport", sectionRoleUserWiseReport);




export default router;


