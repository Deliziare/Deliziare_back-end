import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { createPayment, verifyPayment } from '../Controller/chatPaymentController.js';



const router = express.Router();
router.post('/create-order',verifyToken,createPayment)
router.post('/verify',verifyToken,verifyPayment)
export default router;
