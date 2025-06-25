import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';
import { getDeliveryIdByPost, getDeliveryLocation, updateLocation } from '../Controller/locationController.js';

const router = express.Router();

router.post('/update-location', verifyToken,updateLocation);
router.get('/getLocation',getDeliveryLocation)
router.get('/get-delivery-id/:postId', getDeliveryIdByPost);

export default router;
