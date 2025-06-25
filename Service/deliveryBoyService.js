import Bid from "../Models/bidModel.js"
import Chef from "../Models/chefModel.js"
import Delivery from "../Models/deliveriesModel.js"
import Post from "../Models/postModel.js" 
import { getIO } from "../socket.js"
import Payment from '../Models/paymentModel.js'
import { creditWallet } from "./walletService.js"

import Notification from "../Models/NotificationModel.js"
import User from '../Models/userModel.js';
import { sendNotification } from '../socket.js'; 
import sendOTPEmail from "../utils/sendMail.js"

export const deliveryService = async (userId, bidId) => {
  const existingDelivery = await Delivery.findOne({ deliveryBoyId: userId, bidId });

  if (existingDelivery) {
    throw new Error("You have already accepted this delivery");
  }

  const newDelivery = new Delivery({
    deliveryBoyId: userId,
    bidId,
    status: "pending",
  });

  await newDelivery.save();

  await Bid.findByIdAndUpdate(bidId, {
    deliveryBoyId: userId,
  });

  const bid = await Bid.findById(bidId).populate('chefId');
  const post = await Post.findById(bid.postId);

  if (!post) {
    throw new Error("Related post not found for this bid");
  }

  post.deliveryStatus = "accepted";
  await post.save();

  // ✅ Send notification to chef
  const chefUserId = bid?.chefId?._id?.toString();
  const deliveryBoy = await User.findById(userId);

  if (chefUserId) {
    const notification = new Notification({
      recipient: chefUserId,
      sender: deliveryBoy?._id,
      message: `${deliveryBoy?.name || 'Delivery Partner'} has accepted the order and is on the way to pick it up.`,
      postId: post._id,
      type:'delivery_accepted'
    });

    await notification.save();
    sendNotification(chefUserId, notification);
  }

  return newDelivery;
};


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
  const delivery = await Delivery.findById(deliveryId).populate('bidId');

  if (!delivery) {
    throw new Error('Delivery not found');
  }

  delivery.status = 'picked up';
  await delivery.save();

  const bid = await Bid.findById(delivery.bidId._id);
  const post = await Post.findById(bid?.postId).populate('userId');

  if (post) {
    post.deliveryStatus = 'picked up';
    await post.save();
    console.log('Fetched post:', post);

    // Create and save notification in DB
    const notification = await Notification.create({
      recipient: post.userId._id,
      sender: bid.chefId, // assuming the chef who picked it up is bid.chefId
      message: ` Your order for "${post.eventName}" has been picked up by the deliveryboy!`,
      postId: post._id,
      isRead: false,
      type:'order-picked'
    });

    // Send real-time notification
    sendNotification(post.userId._id.toString(), {
      _id: notification._id,
      recipient: post.userId._id,
      sender: bid.chefId,
      message: notification.message,
      postId: post._id,
      isRead: false,
      createdAt: notification.createdAt,
      type:notification.type
    });
  }

  return { message: 'Delivery marked as picked up' };
};


export const markDeliverdService = async (deliveryId) => {
  const delivery = await Delivery.findById(deliveryId)
    .populate('bidId')
    .populate('deliveryBoyId');

  if (!delivery) {
    throw new Error('Delivery not found');
  }

  delivery.status = 'delivered';
  await delivery.save();

  const bid = await Bid.findById(delivery.bidId._id);
  const post = await Post.findById(bid?.postId).populate('userId');
  const payment = await Payment.findOne({ 'bid.bidId': bid._id });

  if (post) {
    post.deliveryStatus = 'delivered';
    await post.save();
  }

  const deliveryFee = payment?.deliveryCharge || 27;

  await creditWallet(
    delivery.deliveryBoyId._id,
    'deliveryBoy',
    deliveryFee,
    `Delivery earnings for ${post?.eventName || 'an event'} on ${post?.date || ''}`
  );

  // ✅ Send notification to User
  const userNotification = await Notification.create({
    recipient: post.userId._id,
    sender: delivery.deliveryBoyId._id,
    message: `Your order for "${post.eventName}" has been delivered!`,
    postId: post._id,
    isRead: false,
    type:'delivered'
  });

  sendNotification(post.userId._id.toString(), {
    _id: userNotification._id,
    recipient: post.userId._id,
    sender: delivery.deliveryBoyId._id,
    message: userNotification.message,
    postId: post._id,
    isRead: false,
    createdAt: userNotification.createdAt,
    type:userNotification.type
  });

  if (post.userId.email) {
    await sendOTPEmail({
      to: post.userId.email,
      subject: `Your order for "${post.eventName}" has been delivered!`,
      html: `
  <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08); border: 1px solid #708A58;">
  <h2 style="color: #708A58; font-size: 24px; font-weight: 700; border-bottom: 2px solid #708A58; padding-bottom: 12px; margin-bottom: 20px; letter-spacing: 0.5px;">Order Delivered</h2>
  <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 16px;">
    Hi <strong style="color: #708A58;">${post.userId.name}</strong>,
  </p>
  
  <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 16px;">
    Your order for <strong style="color: #708A58;">${post.eventName}</strong> scheduled on 
    <strong style="color: #708A58;">${post.date}</strong> has been 
    <span style="color: #708A58; font-weight: 600; background-color: rgba(112, 138, 88, 0.1); padding: 2px 6px; border-radius: 4px;">successfully delivered</span> by our delivery partner.
  </p>

  <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 16px;">
    Thank you for choosing <strong style="color: #708A58;">Deliziare</strong>! We hope you enjoyed the experience.
  </p>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #708A58;">
    <p style="font-size: 16px; color: #333; line-height: 1.5;">Warm regards,</p>
    <p style="font-size: 16px; font-weight: 600; color: #708A58; letter-spacing: 0.5px;">Deliziare Team</p>
  </div>
</div>
`

    });
  }
  
  // ✅ Send notification to Chef
  const chefUserId = bid.chefId;
  const chefNotification = await Notification.create({
    recipient: chefUserId,
    sender: delivery.deliveryBoyId._id,
    message: `The order for "${post.eventName}" has been successfully delivered to ${post.userId.name}.`,
    postId: post._id,
    isRead: false,
    type:'chef-delivered'
  });

  sendNotification(chefUserId.toString(), {
    _id: chefNotification._id,
    recipient: chefUserId,
    sender: delivery.deliveryBoyId._id,
    message: chefNotification.message,
    postId: post._id,
    isRead: false,
    createdAt: chefNotification.createdAt,
    type:chefNotification.type
  });

  return { message: 'Delivery marked as delivered and notifications sent' };
};
