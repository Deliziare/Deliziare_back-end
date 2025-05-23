import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone:Number,
  profilePic: {
    type: String, 
    default: '',
  },
  role: {
    type: String,
    enum: ['host', 'chef', 'admin', 'deliveryBoy'],
    required: true
  },
  isBlock:{type: Boolean,default:false},
  isGoogleUser: { type: Boolean, default: false }
  

}, { timestamps: true });

const User =  mongoose.model('User', userSchema);
export default User