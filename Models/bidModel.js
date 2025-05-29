import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
    postId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    chefId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bidAmount:{type:Number,required:true},
      status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected','completed'],
    default: 'pending'
  },
  description:{type:String}
    }, { timestamps: true });
  
  const Bid = mongoose.model('Bid', bidSchema);
  export default Bid;
  