import express from "express"
import login from "../../Controllers/userController/login.js"


const router = express.Router()

router.post("/",login)

export default router
