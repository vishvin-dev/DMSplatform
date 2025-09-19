import express from "express"
import { useCreations, getUserDropDowns } from "../../Controllers/useCreation/useCreation.js"


const router = express.Router()

router.post("/addUser", useCreations)
router.post("/getUserDropDowns", getUserDropDowns)

export default router