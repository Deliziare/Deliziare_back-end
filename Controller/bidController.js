import Bid from "../Models/bidModel.js";
import { createBid, getBidsForPost, getChefBids } from "../Service/bidService.js";

export const createBidController = async (req, res) => {
  try {
    const { postId, bidAmount } = req.body;
    const chefId = req.user.id;
    const bid = await createBid({ postId, chefId, bidAmount });
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

    res.status(200).json({
      message: 'Bid accepted and other bids rejected',
      bid: acceptedBid
    });
  } catch (error) {
    console.error('Error processing bid:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}