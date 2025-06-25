import express from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { AcceptBid, createBidController, getAllBid, getBidById,  getChefBidsController, getUserBidReplays, markBidsAsRead, updateBidStatus } from "../Controller/bidController.js"
const router=express.Router()

router.post('/createBid',verifyToken,createBidController)
router.get('/getBid',verifyToken,getChefBidsController)
router.get('/get-post-replay',verifyToken,getUserBidReplays)
router.get('/gettingBid',verifyToken,getAllBid)
router.patch('/accept-bid',verifyToken,AcceptBid)
router.patch('/:id/status',verifyToken, updateBidStatus);
router.get('/:bidId', getBidById);

router.patch('/mark-read', verifyToken, markBidsAsRead);

export default router