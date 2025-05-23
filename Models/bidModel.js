import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
    postId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    chefId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Chef', required: true },
    bidAmount:{type:Number,required:true},
      status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
    }, { timestamps: true });
  
  const Bid = mongoose.model('Bid', bidSchema);
  export default Bid;
  