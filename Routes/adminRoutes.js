import express from 'express';
import { getAllChefsForAdmin, handleTogleBlock } from '../Controller/adminController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();
router.get('/getchefs',verifyToken,verifyAdmin, getAllChefsForAdmin);
router.patch('/chefs/:id/toggle-block',verifyToken,verifyAdmin,handleTogleBlock)
export default router;