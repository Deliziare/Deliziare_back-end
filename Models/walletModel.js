import mongoose from 'mongoose'
const walletSchema = new mongoose.Schema({
  chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef', required: true },
  balance: { type: Number, default: 0 },
  transactions: [
    {
      type: { type: String, enum: ['credit', 'debit'] },
      amount: Number,
      reason: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

const Wallet=mongoose.model('Wallet',walletSchema)
export default Wallet