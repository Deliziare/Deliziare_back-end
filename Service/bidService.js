import Bid from '../Models/bidModel.js'
import Post from '../Models/postModel.js';

export const createBid = async ({ postId, chefId, bidAmount ,description}) => {
  const existingBid = await Bid.findOne({ postId, chefId });

  const newBid = new Bid({ postId, chefId, bidAmount, description, readByPostOwner: false });


  const savedBid = await newBid.save();

 
  await Post.findByIdAndUpdate(postId, {
    $push: { bids: {bidId:savedBid._id, chefId, amount: bidAmount ,description } }
  });

  return savedBid;
};

export const getBidsForPost = async (postId) => {
try {
  let Bids = await Bid.find({ postId }).populate('chefId') 
  return Bids
} catch (error) {
  console.log(error)
}

};

export const getChefBids = async (chefId) => {
  return await Bid.find({ chefId }).populate('postId').populate('deliveryBoyId').sort({ createdAt: -1 });
};

 