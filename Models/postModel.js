import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName: { type: String, required: true },
  location: { type: locationSchema, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  district: { type: String, required: true },
  quantity: { type: Number, required: true },
  menu: [{ type: String, required: true }],
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Post', postSchema);
