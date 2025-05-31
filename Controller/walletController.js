
import { getWalletByChefId } from "../Service/walletService.js";

export const getWalletByChefIdController = async (req, res) => {
  try {
    const chefId = req.user.id; 
    const wallet = await getWalletByChefId(chefId);
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Error getting wallet", error: error.message });
  }
};
