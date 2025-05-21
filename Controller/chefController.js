import { getChefByUserId, updateChefProfileService } from "../Service/chefService.js";

export const getLoggedInChef = async (req, res) => {
  const userId = req.user.id || req.user.userId; 
  const chef = await getChefByUserId(userId);

  if (!chef) {
    return res.status(404).json({ message: 'Chef profile not found' });
  }

  res.status(200).json(chef);
};


export const updateChefProfile = async (req, res) => {
  try {
    const chefId = req.user.id; 

    const updatedChef = await updateChefProfileService(chefId, req.body);

    res.status(200).json({
      success: true,
      message: 'Chef profile updated successfully',
      data: updatedChef,
    });
  } catch (error) {
    console.error('Error updating chef profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chef profile',
      error: error.message,
    });
  }
};

