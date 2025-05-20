import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { createPost, viewPost } from '../Controller/postController.js';


const router = express.Router();

// POST /api/posts
router.post('/create', verifyToken, createPost);
router.get('/view',verifyToken,viewPost)
export default router;
