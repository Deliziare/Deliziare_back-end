import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getPaymentController, handleCreatePayment, verifyPaymentController } from '../Controller/paymentController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';


const router = express.Router();
router.post('/create',verifyToken,handleCreatePayment)
router.post('/verify',verifyToken,verifyPaymentController)
router.get('/getpayment',verifyToken,verifyAdmin,getPaymentController)
router.get('/fetchPayment',verifyToken,getPaymentController)
export default router;
