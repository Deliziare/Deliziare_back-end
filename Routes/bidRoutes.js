import express from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { AcceptBid, createBidController, getBidById, getChefBidsController, getUserBidReplays, updateBidStatus } from "../Controller/bidController.js"
const router=express.Router()

router.post('/createBid',verifyToken,createBidController)
router.get('/getBid',verifyToken,getChefBidsController)
router.get('/get-post-replay',verifyToken,getUserBidReplays)
router.patch('/accept-bid',verifyToken,AcceptBid)
router.patch('/:id/status', updateBidStatus);
router.get('/:bidId', getBidById);
export default router