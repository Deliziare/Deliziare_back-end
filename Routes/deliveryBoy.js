import express from 'express'

const router=express.Router()
router.post('/update-profile', verifyToken, updateUserProfile);
export default router