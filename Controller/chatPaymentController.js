import razorpayInstance from "../config/razorpay.js";
import crypto from 'crypto';
import chatRequestModel from "../Models/chatRequestModel.js";
import Chef from "../Models/chefModel.js";
import Payment from '../Models/paymentModel.js';
import Message from "../Models/messageModel.js";
import { getIO } from "../socket.js";
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
export const createPayment=async (req,res)=>{
     const {  currency = 'INR', receipt,bidId } = req.body;
      
  try {
    const bid = await chatRequestModel.findById(bidId).populate('chefId');
    if (!bid) throw new Error('Bid not found');
    
    const chef = await Chef.findOne({ userId: bid.chefId._id });
    if (!chef) throw new Error('Chef data not found');
    const chefLocation = chef.location;
    const eventLocation = bid.location;
    console.log('chefId contains',chef)
    console.log('chefLocation',chefLocation)
    console.log('event location',eventLocation)
    if (!chefLocation.lat||!chefLocation.lng || !eventLocation.lng||!eventLocation.lat) throw new Error('Coordinates not available');
    const baseAmount = Number(bid.amount);
    const gst = 10;
    const distance = calculateDistanceKm(
    chefLocation.lat,
    chefLocation.lng,
    eventLocation.lat,
    eventLocation.lng
  );
  const deliveryCharge = Math.ceil(distance * 27);
  const total = baseAmount + gst + deliveryCharge;
    const options = {
      amount: total * 100, 
      currency,
      receipt,
    };

    const order = await razorpayInstance.orders.create(options);
   await Payment.create({
        user: bid.userId,
        bid: {
          bidId: bid._id,
          amount: baseAmount ,
        },
        paymentMethod:"razorpay",
        gst,
        deliveryCharge,
        total,
        razorpayOrderId: order.id,
        status: 'pending',
        razorpayPaymentStatus: 'pending',
      });
    res.json(order);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Order creation failed', error });
  }
}

export const verifyPayment=async(req,res)=>{
      const { order_id, payment_id, signature,bidId } = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(order_id + '|' + payment_id)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ message: 'Invalid signature' });
  } 
   const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId:order_id },
      {
        $set: {
          status: 'success',
          razorpayPaymentStatus: 'paid',
          razorpayPaymentId:payment_id,
        },
      },
      { new: true }
    );
    if (!payment) throw new Error('Payment record not found');
    const updated =await chatRequestModel.findOneAndUpdate(
       { _id: bidId }, 
       { status: 'accepted' }, 
       { new: true }
    )
    if(!updated) throw new Error('error in bid');
    const io = getIO();
    const message = await Message.findOne({ requstId: bidId })
         .populate([
        { path: 'postId', select: 'title images' },
        { path: 'requstId' }
      ]).lean()
      if (!message) {
      console.warn(`⚠️ No message found for requstId: ${bidId}`);
      return res.status(404).json({ message: "No associated message found" });
      }
       const { senderId, receiverId } = message;
      console.log(`📤 Emitting request_rejected to senderId: ${senderId}, receiverId: ${receiverId}`);
      io.to(senderId.toString()).emit("request_rejected", {
        messageId: message._id,
        requstId: updated,
      });
      io.to(receiverId.toString()).emit("request_rejected", {
        messageId: message._id,
        requstId: updated,
      });
    res.status(200).json({ message: 'success' });
}