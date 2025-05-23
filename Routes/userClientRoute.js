import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { updateUserProfile, uploadProfileImage } from '../Controller/userClientController.js';
import upload from '../middleware/multer.js';

const router = express.Router();


router.put('/update-profile', verifyToken, updateUserProfile);

router.post('/upload-profile-image',upload.single('profileImage'),verifyToken,uploadProfileImage)

export default router