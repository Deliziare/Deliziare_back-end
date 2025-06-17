import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
 chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },

isAddressAdd:{ type: Boolean, default: false },
  district: { type: String, default: null },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  date: { type: String, default: null }, 
  time: { type: String, default: null },
});

export default mongoose.model('chatRequest', requestSchema);
