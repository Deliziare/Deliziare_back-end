import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getAllChefs, updateUserProfile } from '../Controller/userClientController.js';

const router = express.Router();


router.put('/update-profile', verifyToken, updateUserProfile);
router.get('/getChefs',getAllChefs)




export default router