import Delivery from "../Models/deliveriesModel.js";
import Post from '../Models/postModel.js';
import mongoose from 'mongoose';

export const updateLocation = async (req, res) => {
  const { lat, lng, deliveryId } = req.body;

  try {
    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      {
        currentLocation: { lat, lng },
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json({ message: 'Location updated successfully', delivery });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getDeliveryLocation = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const { currentLocation, lastUpdated } = delivery;
    res.status(200).json({ currentLocation, lastUpdated });
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getDeliveryIdByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log("➡️ PostId received:", postId);

    const post = await Post.findById(postId);
    if (!post) {
      console.log("❌ Post not found");
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log("✅ Post found:", post.eventName);

    const bidIds = post.bids
      .map(bid => bid.bidId)
      .filter(id => !!id); // Remove undefined/null

    console.log("🧾 Valid Bid IDs in post:", bidIds);

    if (!bidIds.length) {
      console.log("⚠️ No valid bidIds found in post.bids");
      return res.status(404).json({ message: 'No valid bids found' });
    }

    const delivery = await Delivery.findOne({
      bidId: { $in: bidIds.map(id => new mongoose.Types.ObjectId(id)) }
    });

    if (!delivery) {
      console.log("❌ No delivery found for these bidIds");
      return res.status(404).json({ message: 'Delivery not found' });
    }

    console.log("✅ Delivery found:", delivery._id);

    res.status(200).json({ deliveryId: delivery._id,status:delivery.status });
  } catch (error) {
    console.error('❌ Error fetching delivery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



