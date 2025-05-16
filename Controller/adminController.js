import Chef from "../Models/chefModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAllChefsForAdmin = asyncHandler(async (req, res) => {
  const chefs = await Chef.find().populate('userId');

  const formattedChefs = chefs.map((chef) => ({
    id: chef._id,
    name: chef.userId.name,
    email: chef.userId.email,
    experience: chef.experience || "",
    location: chef.location,
    state: chef.state || "",
    district: chef.district || "",
    isBlocked: chef.userId.isBlock,
    specialisations: chef.specialize || [],
    certificate: chef.certificate || "",
  }));

  res.status(200).json(formattedChefs);
});

export const handleTogleBlock=asyncHandler(async(req,res)=>{
 try {
   
    
    const chef = await Chef.findById(req.params.id);
    if (!chef) return res.status(404).json({ message: 'Chef not found' });

    chef.isBlocked = !chef.isBlocked;
    await chef.save();

    res.status(200).json({ isBlocked: chef.isBlocked });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
})