import express from 'express';
import { getAllChefsForAdmin, getUsersByAdmin, handleTogleBlock, toggleUserBlockStatus } from '../Controller/adminController.js';

const router = express.Router();
router.get('/getchefs', getAllChefsForAdmin);
router.patch('/chefs/:id/toggle-block',handleTogleBlock)

router.get('/users', /* verifyAdmin, */ getUsersByAdmin);
router.patch("/users/:userId/block",  toggleUserBlockStatus);

export default router;