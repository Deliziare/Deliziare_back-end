import { createBid, getChefBids } from "../Service/bidService.js";

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

