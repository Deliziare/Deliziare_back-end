import express from 'express';


import {  getCurrentUser, loginUser, logoutUser, sendOtpController ,verifyOtpController,forgotPasswordController,resetPasswordController, verifyPasswordOtpController, resendOtpController, refreshToken} from '../Controller/userController.js';

const router = express.Router();
import upload from '../middleware/multer.js';
import { checkEmailExists } from '../Controller/userController.js';


router.post('/send-otp',upload.any(), sendOtpController);

router.post('/verify-otp', upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'IDProof', maxCount: 1 },
]), verifyOtpController);

router.post('/login',loginUser)
router.post('/refreshtoken',refreshToken)
router.post('/logout',logoutUser)

router.get('/me',getCurrentUser)
router.post('/logout', logoutUser);

router.post('/check-email',checkEmailExists)
router.post('/forgot-password',forgotPasswordController)
router.post('/reset-password',resetPasswordController)
router.post('/verify-password-otp',verifyPasswordOtpController)
router.post('/resend-otp',resendOtpController)





export default router