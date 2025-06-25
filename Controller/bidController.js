import Bid from "../Models/bidModel.js";
import Post from "../Models/postModel.js";
import Chef from '../Models/chefModel.js'
import { createBid, getBidsForPost, getChefBids } from "../Service/bidService.js";
import { creditWallet } from "../Service/walletService.js";
import { createNotificationService } from "../Service/notificationService.js";
import { getIO, getOnlineUsers, sendNotification } from "../socket.js";
import DeliveryBoy from "../Models/deliveryboyModel.js";
import {calculateDistanceKm} from '../Controller/chefController.js'
import sendOTPEmail from "../utils/sendMail.js";
import Payment from "../Models/paymentModel.js";



export const createBidController = async (req, res) => {
  try {
    const { postId, bidAmount, description } = req.body;
    const chefId = req.user.id;

    const bid = await createBid({ postId, chefId, bidAmount, description });

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const io = getIO();

    // 🔔 Notify the post creator about the new bid (via socket broadcast)
    io.to(post.userId.toString()).emit('new_bid', postId, bid._id.toString(), `New bid of $${bidAmount} received`);

    // 🔁 Broadcast updated bid count
    const bidCount = await Bid.countDocuments({ postId });
    io.emit('bid_updated', postId, bidCount.toString(), `Bid count updated`);

    // 📩 Send real-time notification using sendNotification()
    const notificationData = {
      type: "bid",
      from: chefId,
      to: post.userId,
      postId,
      bidId: bid._id,
      message: `You received a new bid of $${bidAmount}`,
      timestamp: new Date(),
    };
    sendNotification(post.userId, notificationData);

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

    if (acceptedBid?.chefId?.email) {
      await sendOTPEmail({
        to: acceptedBid.chefId.email,
        subject: "Your Bid Has Been Accepted!",
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; background-color: #fff8f0; padding: 20px; border-radius: 10px; color: #333;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #f0e6dd; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-radius: 10px; overflow: hidden;">
              <div style="background-color: #f27c38; padding: 20px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 28px;">Bid Accepted!</h1>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${acceptedBid.chefId.name || 'Chef'}</strong>,</p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Congratulations! Your bid for the event <strong style="color: #f27c38;">${acceptedBid.postId?.eventName}</strong> has been <strong style="color: green;">accepted</strong>.
                </p>
    
                <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px; border: 1px solid #f0e6dd; background-color: #fff1e6;"><strong>Event Date:</strong></td>
                    <td style="padding: 10px; border: 1px solid #f0e6dd;">${acceptedBid.postId?.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #f0e6dd; background-color: #fff1e6;"><strong>Bid Amount:</strong></td>
                    <td style="padding: 10px; border: 1px solid #f0e6dd;">$${acceptedBid.bidAmount}</td>
                  </tr>
                </table>
    
                <p style="margin-top: 20px; font-size: 16px;">
                  Please be ready to prepare and deliver the items on the scheduled date. Further details will follow closer to the event.
                </p>
    
                <p style="font-size: 16px;">Cheers,<br><strong>— Team Deliziare</strong></p>
              </div>
              <div style="background-color: #f9f1eb; padding: 15px; text-align: center; font-size: 14px; color: #777;">
                © ${new Date().getFullYear()} Deliziare. All rights reserved.
              </div>
            </div>
          </div>
        `
      });
    }
    


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
      console.log(`Processing completed bid: ${bid._id}`);
      await creditWallet(
        bid.chefId,
        'chef',
        bid.bidAmount,
        `Earnings from the ${bid.postId?.eventName} order on ${bid.postId?.date}`
      );

      const deliveryBoys = await DeliveryBoy.find();
      const postLocation = bid.postId.location;
      console.log(`Found ${deliveryBoys.length} delivery boys`);
      const chef = await Chef.findOne({ userId: bid.chefId });
        if (!chef || !chef.location?.lat || !chef.location?.lng) {
          console.warn('Chef location is missing or invalid');
          return res.status(200).json(bid); // You may decide to continue or stop based on this
        }


      if (!postLocation?.lat || !postLocation?.lng) {
        console.warn('Post location is missing or invalid:', postLocation);
        return res.status(200).json(bid); // Proceed without notifications if location is invalid
      }

      const io = getIO();
      const onlineUsers = getOnlineUsers();

      for (const boy of deliveryBoys) {
        if (boy.location?.lat && boy.location?.lng ) {
          console.log(`Processing delivery boy ${boy.userId}:`, boy.location);
          const distance = calculateDistanceKm(
            boy.location.lat,
            boy.location.lng,
            chef.location.lat,
            chef.location.lng
          );
          console.log(`Distance to delivery boy ${boy.userId}: ${distance} km`);

          if (distance <= 5) {
            try {
              console.log(`Creating notification for delivery boy: ${boy.userId}`);
              const notification = await createNotificationService({
                recipientId: boy.userId,
                senderId: req.user._id,
                postId: bid.postId._id,
                message: `New order available nearby! Event: ${bid.postId.eventName}, Date: ${bid.postId.date}`,
              });
              if (notification) {
                console.log(`Notification created: ${notification._id}`);
              } else {
                console.warn(`Notification creation returned undefined or null for delivery boy: ${boy.userId}`);
              }

              const sockets = onlineUsers.get(boy.userId.toString());
              console.log(`Sockets for user ${boy.userId}:`, sockets);
              if (sockets && io) {
                for (const socketId of sockets) {
                  console.log(`Emitting to socket: ${socketId}`);
                  io.to(socketId).emit('new_notification', {
                    message: `New order available nearby! Event: ${bid.postId.eventName}, Date: ${bid.postId.date}`,
                    postId: bid.postId._id,
                    isRead: false,
                    recipient: boy.userId,
                    sender: req.user._id,
                  });
                }
              }
            } catch (notificationError) {
              console.error(`Failed to create notification for delivery boy ${boy.userId}:`, notificationError);
            }
          }
        } else {
          console.log(`Skipping delivery boy ${boy.userId}: Invalid location data`);
        }
      }
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

    // Get Chef profile
    const chefProfile = await Chef.findOne({ userId: bid.chefId._id });
    if (chefProfile) {
      bid._doc.chefProfile = chefProfile;
    }

    // Fetch payment for this bid to get deliveryCharge
    const payment = await Payment.findOne({ "bid.bidId": bid._id });

    if (payment) {
      bid._doc.deliveryCharge = payment.deliveryCharge;
    } else {
      bid._doc.deliveryCharge = 27; 
    }

    res.json(bid);
  } catch (err) {
    console.error('Error fetching bid:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// export const markBidsAsRead = async (req, res) => {
//   try {
//     const { postId } = req.body;
//     if (!postId) return res.status(400).json({ message: "postId is required" });

//     await Bid.updateMany({ postId }, { $set: { readByPostOwner: true } });

//     res.status(200).json({ message: "Bids marked as read" });
//   } catch (error) {
//     console.error("Error marking bids as read:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };




export const markBidsAsRead = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    if (!postId) return res.status(400).json({ message: "postId is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: Only post owner can mark bids as read" });
    }

    // Update and return the updated bids
    await Bid.updateMany({ postId }, { $set: { readByPostOwner: true } });
    
    // Get the updated bids to return
    const updatedBids = await Bid.find({ postId }).lean();
    
    res.status(200).json({ 
      message: "Bids marked as read",
      bids: updatedBids
    });
  } catch (error) {
    console.error("Error marking bids as read:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


//order around 5 km : delivery boy
export const getAllBid = async (req, res) => {
  try {
    const userId = req.user.id;
    const deliveryBoy = await DeliveryBoy.findOne({ userId });

    if (!deliveryBoy || !deliveryBoy.location) {
      return res.status(404).json({ message: "Delivery boy location not found" });
    }

    const bids = await Bid.find({
  status: 'completed',
  deliveryBoyId: null,
  rejectedByDeliveryBoys: { $ne: userId }, 
}).populate('chefId').populate('postId');

    const userIds = bids.map(bid => bid.chefId?._id?.toString()).filter(Boolean);
    const uniqueUserIds = [...new Set(userIds)];
    const chefs = await Chef.find({ userId: { $in: uniqueUserIds } });
    const chefMap = new Map(chefs.map(chef => [chef.userId.toString(), chef]));

    // 1. Get all related payments in a single DB query
    const bidIds = bids.map(bid => bid._id);
    const payments = await Payment.find({ "bid.bidId": { $in: bidIds } });

    // 2. Map bidId => deliveryCharge
    const deliveryChargeMap = new Map();
    payments.forEach(payment => {
      deliveryChargeMap.set(payment.bid.bidId.toString(), payment.deliveryCharge);
    });

    // 3. Construct nearbyPosts with deliveryCharge included
    const nearbyPosts = bids
      .map(bid => {
        const chef = chefMap.get(bid.chefId._id.toString());
        if (!chef?.location?.lat || !chef?.location?.lng) return null;

        const distance = calculateDistanceKm(
          deliveryBoy.location.lat,
          deliveryBoy.location.lng,
          chef.location.lat,
          chef.location.lng
        );

        if (distance <= 30) {
          return {
            ...bid._doc,
            chefLocation: chef.location,
            deliveryCharge: deliveryChargeMap.get(bid._id.toString()) || 0
          };
        }
        return null;
      })
      .filter(Boolean);
     console.log(nearbyPosts)
    res.status(200).json({ message: 'All bids are fetched', nearbyPosts });
  } catch (error) {
    console.error('bid fetch error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

