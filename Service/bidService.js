import Bid from "../Models/bidModel.js";

export const createBid = async ({ postId, chefId, bidAmount }) => {
  const existingBid = await Bid.findOne({ postId, chefId });
  if (existingBid) {
    throw new Error('You have already placed a bid for this post.');
  }

  const newBid = new Bid({ postId, chefId, bidAmount });
  const savedBid = await newBid.save();

 
  await Post.findByIdAndUpdate(postId, {
    $push: { bids: { chefId, amount: bidAmount } }
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
  return await Bid.find({ chefId }).populate('postId').sort({ createdAt: -1 });
};

