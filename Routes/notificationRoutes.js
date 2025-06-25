import express from 'express'
const router = express.Router();


import { verifyToken } from '../middleware/verifyToken.js';
import { createNotification, getNotifications, markAsRead } from '../Controller/notificationController.js';


router.get('/',verifyToken,getNotifications)
router.post('/read',verifyToken,markAsRead)
router.post('/',verifyToken,createNotification)

export default router