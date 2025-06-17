import express from 'express';

import { getAllChefsForAdmin, handleTogleBlock,getUsersByAdmin,toggleUserBlockStatus, getDeliveryBoyAdmin, toggleDeliveryBlockStatus, countUsersController, getPopularChefs } from '../Controller/adminController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();
router.get('/getchefs',verifyToken,verifyAdmin, getAllChefsForAdmin);
router.patch('/chefs/:id/toggle-block',verifyToken,verifyAdmin,handleTogleBlock)
router.get('/users', verifyToken,verifyAdmin, getUsersByAdmin);
router.patch("/users/:userId/block", verifyToken,verifyAdmin, toggleUserBlockStatus);
router.get('/deliveryBoy', verifyToken,verifyAdmin, getDeliveryBoyAdmin);
router.patch("/deliveryBoy/:userId/block", verifyToken,verifyAdmin, toggleDeliveryBlockStatus);
router.get('/getCount',verifyToken,verifyAdmin,countUsersController)
router.get('/popularChef',verifyToken,verifyAdmin,getPopularChefs)
export default router;
