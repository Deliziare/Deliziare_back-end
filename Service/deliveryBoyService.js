import Bid from "../Models/bidModel.js"
import Chef from "../Models/chefModel.js"
import Delivery from "../Models/deliveriesModel.js"
import Post from "../Models/postModel.js" 

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
