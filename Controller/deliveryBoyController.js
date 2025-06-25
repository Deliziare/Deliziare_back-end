import Chef from "../Models/chefModel.js"
import Delivery from "../Models/deliveriesModel.js"
import { deliveryBoyOrderService, deliveryService, getDeliveryBoyByUserId, markAsPickedUpService, markDeliverdService, rejectDeliveryService, updatedDeliveryBoyProfile } from "../Service/deliveryBoyService.js"


export const getLoggedInDeliveryBoy = async (req, res) => {
  const userId = req.user.id || req.user.userId; 
  const deliveryBoy = await getDeliveryBoyByUserId(userId);
   //console.log(chef)
  if (!deliveryBoy) {
    return res.status(404).json({ message: 'Delivery Boy profile not found' });
  }

  res.status(200).json(deliveryBoy);
};

export const updateboyProfile = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id;

    const updatedBoy = await updatedDeliveryBoyProfile(deliveryBoyId, req.body);

    res.status(200).json({
      success: true,
      message: 'Delivery boy profile updated successfully',
      data: updatedBoy,
    });
  } catch (error) {
    console.error('Error updating delivery boy profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery boy profile',
      error: error.message,
    });
  }
};


export const deliveryAcceptController=async(req,res)=>{
 try {
   const userId=req.user.id
   const {bidId}=req.body
   const result=await deliveryService(userId,bidId)
   res.status(200).json(result)
 } catch (error) {
    console.log(error);
    
    res.status(500).json({message:'server error'})
 }
}

export const deliveryRejectController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bidId } = req.body;

    const result = await rejectDeliveryService(userId, bidId);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getDeliveryBoyOrderController=async(req,res)=>{
    try {
        const deliveryBoyId=req.user.id;
        const order=await deliveryBoyOrderService(deliveryBoyId)
        res.status(200).json(order)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'server error'})
    }
}


export const getOrderById = async (req, res) => {
  try {
    const order = await Delivery.findById(req.params.id).populate({
  path: 'bidId',
  populate: [
    {
      path: 'postId',
      model: 'Post',
      populate: {
        path: 'userId',
        model: 'User', 
        select: 'name email phone',
      },
    },
    {
      path: 'chefId',
      model: 'User',
    },
  ],
});


    if (!order) return res.status(404).json({ message: 'Order not found' });

    const chefUserId = order?.bidId?.chefId?._id;
    let chefLocation = null;

    if (chefUserId) {
      const chef = await Chef.findOne({ userId: chefUserId }).select('location');
      chefLocation = chef?.location || null;
    }

    const fullOrder = {
      ...order.toObject(),
      chefLocation,
       postOwner: order?.bidId?.postId?.userId || null,
    };

    res.json(fullOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};



export const markAsPickedUp = async (req, res) => {
  try {
    const { deliveryId } = req.params
    const io = req.io

    const result = await markAsPickedUpService(deliveryId, io)
    res.status(200).json(result)
  } catch (err) {
    console.error('Pickup Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}


export const markAsDelivered = async (req, res) => {
  try {
    const { deliveryId } = req.params
   
    const result = await markDeliverdService(deliveryId)
    
    res.status(200).json(result)
  } catch (err) {
    console.error('deliver Error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
