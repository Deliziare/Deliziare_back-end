import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { createPost, updatePost, viewPost } from '../Controller/postController.js';


const router = express.Router();

// POST /api/posts
router.post('/create', verifyToken, createPost);
router.get('/view',verifyToken,viewPost)
router.put('/edit-post/:id', verifyToken, updatePost);
export default router;
