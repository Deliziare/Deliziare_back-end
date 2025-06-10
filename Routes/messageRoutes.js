import express from 'express';

import { findUserForChat, getChatUsers, getMessage, getUnreadMessageCount, markMessagesAsRead, sendMessage } from '../Controller/messageController.js';
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();


router.get('/get-message/:userId/:otherUserId',verifyToken, getMessage);
router.post('/sendMessage',verifyToken,sendMessage);
router.get('/find-user/:id',verifyToken,findUserForChat)
router.get('/get-chat-users',verifyToken,getChatUsers)
router.patch('/mark-read',verifyToken,markMessagesAsRead)
router.get('/count',verifyToken,getUnreadMessageCount)

export default router;
