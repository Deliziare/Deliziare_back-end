import express from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { createBidController, getChefBidsController } from "../Controller/bidController.js"
const router=express.Router()

router.post('/createBid',verifyToken,createBidController)
router.get('/getBid',verifyToken,getChefBidsController)

export default router