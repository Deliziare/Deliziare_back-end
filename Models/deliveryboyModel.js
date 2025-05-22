import mongoose from 'mongoose';

const deliveryBoySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleType: String,
  IDProof:String,
  license:String,
  
}, { timestamps: true });

const DeliveryBoy = mongoose.model('DeliveryBoy', deliveryBoySchema);
export default DeliveryBoy