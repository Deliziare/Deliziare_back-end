import express from 'express';
import { getAllChefsForAdmin, handleTogleBlock } from '../Controller/adminController.js';

const router = express.Router();
router.get('/getchefs', getAllChefsForAdmin);
router.patch('/chefs/:id/toggle-block',handleTogleBlock)
export default router;