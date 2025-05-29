

import { createPayment, verifyPayment } from '../Service/paymentService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const handleCreatePayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { bidId, paymentMethod } = req.body;

  if (!bidId || !paymentMethod) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  const result = await createPayment(userId, bidId, paymentMethod);

  res.status(201).json({
    message: 'Payment initiated',
    payment: result.payment,
    razorpayOrder: result.razorpayOrder,
  });
});



export const verifyPaymentController = async (req, res) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    const payment = await verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    res.status(200).json({
      message: 'Payment verified successfully',
      payment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
