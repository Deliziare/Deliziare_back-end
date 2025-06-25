import { getChefById, getChefPostId } from "../Service/profileService.js";

export const getChefProfileById = async (req, res) => {
  const { chefId } = req.params; 
  try {
    const result = await getChefById(chefId);
    if (!result) {
      return res.status(404).json({ message: 'Chef or user not found' });
    }
    console.log(result)

    res.status(200).json(result); 
  } catch (error) {
    console.error('Error fetching chef:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChefPostById = async (req, res) => {
  const { chefId } = req.params; 
  try {
    const result = await getChefPostId(chefId);
    if (!result) {
      return res.status(404).json({ message: 'Chef or user not found' });
    }
    console.log(result)

    res.status(200).json(result); 
  } catch (error) {
    console.error('Error fetching chef:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
