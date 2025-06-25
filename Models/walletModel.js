// walletModel.js
import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['chef', 'deliveryBoy'],
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  transactions: [
    {
      type: { type: String, enum: ['credit', 'debit'] },
      amount: Number,
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

export default mongoose.model("Wallet", walletSchema);
