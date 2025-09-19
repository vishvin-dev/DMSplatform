import express from "express";
import { getRole, addRoles, updateRole } from "../../Controllers/RolesCreation/RolesCreation.js";
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router();

router.get("/getRole", authenticateToken, getRole);
router.post("/addRole", authenticateToken, addRoles);
router.put("/updateRole", authenticateToken, updateRole);

export default router;
