import Bid from "../Models/bidModel.js";
import Posts from "../Models/postModel.js";
import Chef from '../Models/chefModel.js'
import { createBid, getBidsForPost, getChefBids } from "../Service/bidService.js";
import { creditWallet } from "../Service/walletService.js";

export const createBidController = async (req, res) => {
  try {
    const { postId, bidAmount,description } = req.body;
    const chefId = req.user.id;
    const bid = await createBid({ postId, chefId, bidAmount ,description});
    res.status(201).json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getChefBidsController = async (req, res) => {
  try {
    const chefId = req.user.id;
    const bids = await getChefBids(chefId);
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chef bids' });
  }
};

export const getUserBidReplays=async (req,res)=>{
    try {
   
      const {postId}=req.query;
     
      if(!postId){
        res.status(400).json({ message: 'post id is required ' });
      }
    const bids= await getBidsForPost(postId)
      res.json(bids);
    } catch (error) {
       res.status(500).json({ message: 'Failed to fetch ' ,error});
    }
}

export const AcceptBid=async (req,res)=>{
 const { bidId ,postId } = req.body;

  try {
    if(!bidId||!postId){
      return res.status(400).json({message:"bid id and post id is requird"})
    }
    const acceptedBid = await Bid.findByIdAndUpdate(
      bidId,
      { status: 'accepted' },
      { new: true }
    );

    await Bid.updateMany(
      {
        postId,
        _id: { $ne: bidId }
      },
      { $set: { status: 'rejected' } }
    );

     await Posts.updateOne(
      { _id: postId },
      { $set: { status: 'accepted' } }
    );

    res.status(200).json({
      message: 'Bid accepted and other bids rejected',
      bid: acceptedBid
    });
  } catch (error) {
    console.error('Error processing bid:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



export const updateBidStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const bid = await Bid.findById(id).populate('postId');
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    const wasAlreadyCompleted = bid.status === 'completed';
    bid.status = status;
    await bid.save();

    if (status === 'completed' && !wasAlreadyCompleted) {
      await creditWallet(
        bid.chefId,
        bid.bidAmount,
        `Earnings from the  ${bid.postId?.eventName} order on ${bid.postId?.date}`
      );
    }

    res.status(200).json(bid);
  } catch (err) {
    console.error('Error updating bid status:', err); 
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getBidById = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId)
      .populate('chefId')
      .populate('postId');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    
    const chefProfile = await Chef.findOne({ userId: bid.chefId._id });
     if(chefProfile){
      bid._doc.chefProfile=chefProfile
     }

    res.json(bid);
  } catch (err) {
    console.error('Error fetching bid:', err);
    res.status(500).json({ message: 'Server error' });
  }
};