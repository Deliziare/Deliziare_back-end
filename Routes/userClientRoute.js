import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { updateUserProfile } from '../Controller/userClientController.js';

const router = express.Router();


router.put('/update-profile', verifyToken, updateUserProfile);



export default router