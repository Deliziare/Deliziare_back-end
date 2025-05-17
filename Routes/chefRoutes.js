import express from 'express'
import {  getLoggedInChef } from '../Controller/chefController.js'
import { verifyToken } from '../middleware/verifyToken.js'
const router=express.Router()

router.get('/chefData',verifyToken,getLoggedInChef)

export default router