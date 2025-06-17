import Bid from "../Models/bidModel.js"
import Chef from "../Models/chefModel.js"
import Delivery from "../Models/deliveriesModel.js"
import Post from "../Models/postModel.js" 
import { getIO } from "../socket.js"
import Payment from '../Models/paymentModel.js'
import { creditWallet } from "./walletService.js"

export const deliveryService = async (userId, bidId) => {
  
  const existingDelivery = await Delivery.findOne({ deliveryBoyId: userId, bidId })

  if (existingDelivery) {
    throw new Error("You have already accepted this delivery")
  }

  
  const newDelivery = new Delivery({
    deliveryBoyId: userId,
    bidId,
    status: "pending",
  })

  await newDelivery.save()

  await Bid.findByIdAndUpdate(bidId, {
    deliveryBoyId: userId,
  });

 const bid=await Bid.findById(bidId)
  const post = await Post.findById(bid.postId)

  if (!post) {
    throw new Error("Related post not found for this bid")
  }

 
  post.deliveryStatus = "accepted"
  await post.save()

  return newDelivery
}

export const deliveryBoyOrderService = async (deliveryBoyId) => {
  const orders = await Delivery.find({ deliveryBoyId }).populate({
    path: 'bidId',
    populate: [
      {
        path: 'postId',
        model: 'Post',
      },
      {
        path: 'chefId',
        model: 'User',
      },
    ],
  });

  const fullOrders = await Promise.all(
    orders.map(async (order) => {
      const chefUserId = order?.bidId?.chefId?._id; // This is the User._id
      let chefLocation = null;

      if (chefUserId) {
        const chef = await Chef.findOne({ userId: chefUserId }).select('location');
        chefLocation = chef?.location || null;
      }

      return {
        ...order.toObject(),
        chefLocation,
      };
    })
  );

  return fullOrders;
};



export const markAsPickedUpService = async (deliveryId) => {
  const delivery = await Delivery.findById(deliveryId).populate('bidId')

  if (!delivery) {
    throw new Error('Delivery not found')
  }

  delivery.status = 'picked up'
  await delivery.save()

  const bid = await Bid.findById(delivery.bidId._id)
  const post = await Post.findById(bid?.postId)

  if (post) {
    post.deliveryStatus = 'picked up'
    await post.save()
  }

  const io=getIO()
  const customerId = post?.userId.toString()
  if (customerId && io && global.userSocketMap?.has(customerId)) {
    const socketId = global.userSocketMap.get(customerId)
    io.to(socketId).emit('deliveryPickedUp', { deliveryId })
  }

  return { message: 'Delivery marked as picked up' }
}


export const markDeliverdService = async (deliveryId) => {
  const delivery = await Delivery.findById(deliveryId).populate('bidId').populate('deliveryBoyId')

  if (!delivery) {
    throw new Error('Delivery not found')
  }

  delivery.status = 'delivered'
  await delivery.save()

  const bid = await Bid.findById(delivery.bidId._id)
  const post = await Post.findById(bid?.postId)
  const payment=await Payment.findOne({'bid.bidId': bid._id })

  if (post) {
    post.deliveryStatus = 'delivered'
    await post.save()
  }

  const deliveryFee = payment.deliveryCharge || 27; 
  await creditWallet(
    delivery.deliveryBoyId._id,
    'deliveryBoy',
    deliveryFee,
    `Delivery earnings for ${post?.eventName || 'an event'} on ${post?.date || ''}`
  );

  return { message: 'Delivery marked as delivered and wallet credited' };

}