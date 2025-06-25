import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {  approveWithdrawalRequest, getAllWithdrawRequest, getWalletByChefIdController, getWalletByDeliveryIdController, requestChefWithdrawal, requestDeliveryWithdrawal } from "../Controller/walletController.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
const router=express.Router()

router.get('/getWallet',verifyToken,getWalletByChefIdController)
router.get('/getEarning',verifyToken,getWalletByDeliveryIdController)
router.post('/deliveryWithdraw',verifyToken,requestDeliveryWithdrawal)
router.post('/chefWithdraw',verifyToken,requestChefWithdrawal)
router.post('/acceptWithdraw/:requestId',verifyToken,verifyAdmin,approveWithdrawalRequest)
router.get('/getWithdraw',verifyToken,verifyAdmin,getAllWithdrawRequest)
export default router