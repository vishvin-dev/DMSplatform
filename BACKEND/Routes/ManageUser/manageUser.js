import express from "express"
import { manageUser, getManageDropdowns } from "../../Controllers/ManageUser/manageUser.js"
import { authenticateToken } from "../../MiddleWare/authMiddleware.js";

const router = express.Router()

router.post("/", authenticateToken, manageUser)
router.post("/getDpdwns", authenticateToken , getManageDropdowns)




export default router