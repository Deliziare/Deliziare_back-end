import express from 'express';


import { deliveryBoyRegister, getCurrentUser, loginUser, logoutUser, sendOtp ,verifyOtp} from '../Controller/userController.js';

const router = express.Router();
import upload from '../middleware/multer.js';
import { checkEmailExists } from '../Controller/userController.js';



router.post('/register/deliveryboy', upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'IDProof', maxCount: 1 },
  ]), deliveryBoyRegister);

router.post('/send-otp',upload.any(), sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login',loginUser)
router.post('/logout',logoutUser)

router.get('/me',getCurrentUser)
router.post('/logout', logoutUser);

router.post('/check-email',checkEmailExists)



export default router