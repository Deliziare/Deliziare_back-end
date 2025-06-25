import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'event_available',
        'bid_accepted',
        'delivery_accepted',
        'delivered',
        'deliveryboy-order',
        'order-picked',
        'chef-delivered',
        'chef-withdrawal',
        'deliveryboy-withdrawal',
        'withdrawal-approved'
      ],
      required: true,
    },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    // meta: {
    //   type: mongoose.Schema.Types.Mixed,
    //   default: {},
    // },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const Notification = mongoose.model('Notification', notificationSchema);
export default Notification
