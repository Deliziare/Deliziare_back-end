import express from 'express';

import { getAllChefsForAdmin, handleTogleBlock,getUsersByAdmin,toggleUserBlockStatus } from '../Controller/adminController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();
router.get('/getchefs',verifyToken,verifyAdmin, getAllChefsForAdmin);
router.patch('/chefs/:id/toggle-block',verifyToken,verifyAdmin,handleTogleBlock)
router.get('/users', verifyToken,verifyAdmin, getUsersByAdmin);
router.patch("/users/:userId/block", verifyToken,verifyAdmin, toggleUserBlockStatus);


export default router;