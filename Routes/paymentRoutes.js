import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { handleCreatePayment, verifyPaymentController } from '../Controller/paymentController.js';


const router = express.Router();
router.post('/create',verifyToken,handleCreatePayment)
router.post('/verify',verifyToken,verifyPaymentController)
export default router;
