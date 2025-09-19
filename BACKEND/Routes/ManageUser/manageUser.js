import express from "express"
import { manageUser, getManageDropdowns } from "../../Controllers/ManageUser/manageUser.js"


const router = express.Router()

router.post("/", manageUser)
router.post("/getDpdwns", getManageDropdowns)




export default router