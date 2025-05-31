import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getAllChefs, savedPost } from '../Controller/userClientController.js';
import { updateUserProfile, uploadProfileImage } from '../Controller/userClientController.js';
import upload from '../middleware/multer.js';

const router = express.Router();


router.put('/update-profile', verifyToken, updateUserProfile);
router.get('/getChefs',getAllChefs)


router.post('/upload-profile-image',upload.single('profileImage'),verifyToken,uploadProfileImage)
router.post('/savedPost/:id',verifyToken,savedPost)

export default router