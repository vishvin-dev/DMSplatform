import express from "express"
import { resetPassword } from "../../Controllers/ResetPassword/ResetPassword.js"
import { authenticateToken } from "../../MiddleWare/authMiddleware.js"


const router = express.Router()

router.post("/", authenticateToken, resetPassword)


export default router