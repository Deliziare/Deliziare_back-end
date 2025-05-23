import express from 'express'
import {  getLoggedInChef, getPostsForChefDistrict, updateChefProfile, viewPostDetail } from '../Controller/chefController.js'
import { verifyToken } from '../middleware/verifyToken.js'
import Post from '../Models/postModel.js'
import { createPost, getMyChefPosts } from '../Controller/chefPostController.js'
import upload from '../middleware/multer.js'

const router=express.Router()

router.get('/chefData',verifyToken,getLoggedInChef)
router.put('/update-profile',verifyToken,updateChefProfile)
router.get('/user-posts', verifyToken, getPostsForChefDistrict);
router.get('/user-posts/:id',verifyToken,viewPostDetail );
router.post('/chef-post',verifyToken,upload.array('images'),createPost)
router.get('/getPost',verifyToken,getMyChefPosts)
export default router