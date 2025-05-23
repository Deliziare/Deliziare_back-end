import express from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { AcceptBid, createBidController, getChefBidsController, getUserBidReplays } from "../Controller/bidController.js"
const router=express.Router()

router.post('/createBid',verifyToken,createBidController)
router.get('/getBid',verifyToken,getChefBidsController)
router.get('/get-post-replay',verifyToken,getUserBidReplays)
router.patch('/accept-bid',verifyToken,AcceptBid)
export default router