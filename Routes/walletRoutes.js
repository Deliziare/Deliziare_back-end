import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {  getWalletByChefIdController } from "../Controller/walletController.js";
const router=express.Router()

router.get('/getWallet',verifyToken,getWalletByChefIdController)

export default router