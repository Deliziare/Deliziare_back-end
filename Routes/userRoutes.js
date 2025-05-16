import express from 'express';
import { chefRegister, deliveryBoyRegister, hostRegister, loginUser, logoutUser, sendOtp ,verifyOtp} from '../Controller/userController.js';
const router = express.Router();
import upload from '../middleware/multer.js';

router.post('/register/host',hostRegister)
router.post('/register/chef',upload.single('certificate'),chefRegister)
router.post('/register/deliveryboy', upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'IDProof', maxCount: 1 },
  ]), deliveryBoyRegister);

router.post('/send-otp',upload.any(), sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login',loginUser)
router.post('/logout',logoutUser)

export default router