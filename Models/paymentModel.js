import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bid: {
    bidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid", required: true },
    amount: { type: Number, required: true },
  },
  gst: { type: Number, default: 10 },
  deliveryCharge: { type: Number, default: 27 },

  paymentMethod: { type: String, required: true },
  total: { type: Number, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  status: {
    type: String,
    enum: ["placed", "pending", "cancelled", "completed"],
    default: "pending"
  },
  razorpayPaymentStatus: {
    type: String,
    enum: ["paid", "failed", "pending", "captured", "refunded"],
    default: "pending"
  },

}, { timestamps: true });


export default mongoose.model("Payment",paymentSchema)