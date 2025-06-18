import express from 'express';

import { addAddressToChatRequest, findUserForChat, getChatUsers, getMessage, markMessagesAsRead, rejectRequstMessage, sendMessage } from '../Controller/messageController.js';
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();


router.get('/get-message/:userId/:otherUserId',verifyToken, getMessage);
router.post('/sendMessage',verifyToken,sendMessage);
router.get('/find-user/:id',verifyToken,findUserForChat)
router.get('/get-chat-users',verifyToken,getChatUsers)
router.post('/markAsRead/:userId/:senderId',verifyToken,markMessagesAsRead)
router.post('/rejectreqmessage',verifyToken,rejectRequstMessage)
router.put('/add-address/:requestId', verifyToken, addAddressToChatRequest);

export default router;
