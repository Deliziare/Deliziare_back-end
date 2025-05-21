import express from 'express'
import {  getLoggedInChef, updateChefProfile } from '../Controller/chefController.js'
import { verifyToken } from '../middleware/verifyToken.js'
const router=express.Router()

router.get('/chefData',verifyToken,getLoggedInChef)
router.put('/update-profile',verifyToken,updateChefProfile)

export default router