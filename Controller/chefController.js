import { getChefByUserId } from "../Service/chefService.js";

export const getLoggedInChef = async (req, res) => {
  const userId = req.user.id || req.user.userId; 
  const chef = await getChefByUserId(userId);

  if (!chef) {
    return res.status(404).json({ message: 'Chef profile not found' });
  }

  res.status(200).json(chef);
};

