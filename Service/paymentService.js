import Payment from '../Models/paymentModel.js';
import Bid from '../Models/bidModel.js';
import razorpayInstance from '../config/razorpay.js'; 
import Chef from '../Models/chefModel.js';
import crypto from 'crypto';

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

export const createPayment = async (
  userId,
  bidId,
  paymentMethod,
) => {

const bid = await Bid.findById(bidId).populate('postId').populate('chefId');
if (!bid) throw new Error('Bid not found');

const chef = await Chef.findOne({ userId: bid.chefId._id });
if (!chef) throw new Error('Chef data not found');

const chefLocation = chef.location;
const eventLocation = bid.postId?.location;
console.log('chefId contains',chef)
console.log('chefLocation',chefLocation)
console.log('event location',eventLocation)


if (!chefLocation || !eventLocation) throw new Error('Coordinates not available');

  const baseAmount = Number(bid.bidAmount);
  const gst = 10;

  const distance = calculateDistanceKm(
    chefLocation.lat,
    chefLocation.lng,
    eventLocation.lat,
    eventLocation.lng
  );
  const deliveryCharge = Math.ceil(distance * 27);
  const total = baseAmount + gst + deliveryCharge;

  
  const order = await razorpayInstance.orders.create({
    amount: total *100, 
    currency: 'INR',
    receipt: `receipt_bid_${bidId}`,
  });

  
  const payment = await Payment.create({
    user: userId,
    bid: {
      bidId: bid._id,
      amount: baseAmount ,
    },
    paymentMethod,
    gst,
    deliveryCharge,
    total,
    razorpayOrderId: order.id,
    status: 'pending',
    razorpayPaymentStatus: 'pending',
  });

  return {
    payment,
    razorpayOrder: order,
  };
};




export const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const isValid = generatedSignature === razorpaySignature;

  if (!isValid) throw new Error('Invalid Razorpay signature');

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      $set: {
        status: 'success',
        razorpayPaymentStatus: 'paid',
        razorpayPaymentId,
      },
    },
    { new: true }
  );

  if (!payment) throw new Error('Payment record not found');

  return payment;
};

