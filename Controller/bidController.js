import Bid from "../Models/bidModel.js";
import Post from "../Models/postModel.js";
import Chef from '../Models/chefModel.js'
import { createBid, getBidsForPost, getChefBids } from "../Service/bidService.js";
import { creditWallet } from "../Service/walletService.js";
import { createNotificationService } from "../Service/notificationService.js";
import { getIO, sendNotification } from "../socket.js";
import DeliveryBoy from "../Models/deliveryboyModel.js";
import {calculateDistanceKm} from '../Controller/chefController.js'

export const createBidController = async (req, res) => {
  try {
    console.log("req.user:", req.user); 
    console.log("req.body:", req.body); 
    const { postId, bidAmount,description } = req.body;
    const chefId = req.user.id;

    console.log(`Creating bid: postId=${postId}, chefId=${chefId}, amount=${bidAmount}`);
    const bid = await createBid({ postId, chefId, bidAmount ,description});

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const io = getIO();
    io.to(post.createdBy).emit("new_bid", {
      postId,
      bidId: bid._id,
      bidAmount,
      chefId,
      description
    });



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
        return res.status(400).json({ message: 'post id is required ' });
      }
    const bids= await getBidsForPost(postId)
      res.json(bids);
    } catch (error) {
       res.status(500).json({ message: 'Failed to fetch ' ,error});
    }
}


export const AcceptBid = async (req, res) => {
  const { bidId, postId } = req.body;

  try {
    if (!bidId || !postId) {
      return res.status(400).json({ message: "bid id and post id is required" });
    }

    const acceptedBid = await Bid.findByIdAndUpdate(
      bidId,
      { status: "accepted" },
      { new: true }
    ).populate('chefId').populate('postId');

    
    await Bid.updateMany(
      { postId, _id: { $ne: bidId } },
      { $set: { status: "rejected" } }
    );


    await Post.updateOne({ _id: postId }, { $set: { status: "accepted" } });

   
    const notification = await createNotificationService({
      recipientId: acceptedBid.chefId._id,
      senderId: req.user._id,
      message: `Your bid for post ${acceptedBid.postId?.eventName} has been accepted.`,
      postId,
    });

    sendNotification(acceptedBid.chefId._id, notification);

    res.status(200).json({
      message: "Bid accepted and other bids rejected. Notification sent.",
      bid: acceptedBid,
    });
  } catch (error) {
    console.error("Error processing bid:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



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

//for payment to get bid data
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


export const markBidsAsRead = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ message: "postId is required" });

    await Bid.updateMany({ postId }, { $set: { readByUser: true } });
    res.status(200).json({ message: "Bids marked as read" });
  } catch (error) {
    console.error("Error marking bids as read:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//order around 5 km : delivery boy
export const getAllBid=async(req,res)=>{
  try {
    const userId=req.user.id;
    const deliveryBoy=await DeliveryBoy.findOne({userId})
    if(!deliveryBoy||!deliveryBoy.location){
      return res.status(404).json({message:"Delivey boy location not found"})
    }

    // console.log('delivery location',deliveryBoy.location)
    const bids=await Bid.find().populate('postId')
    console.log(bids)

    const nearbyPosts = bids.filter(bid => {
          if (!bid.postId?.location?.lat || !bid.postId?.location?.lng) return false;
    
          const distance = calculateDistanceKm(
            deliveryBoy.location.lat,
            deliveryBoy.location.lng,
            bid.postId?.location.lat,
            bid.postId?.location.lng
          );
    
          return distance <= 5;
        });
    
  
    res.status(200).json({message:'All bids are fetched',nearbyPosts})
  } catch (error) {
    console.log('bid fetch error',error)
    res.status(500).json({message:'server error',error})
  }
}