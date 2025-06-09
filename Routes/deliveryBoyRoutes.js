import express from 'express'
import { deliveryAcceptController, getDeliveryBoyOrderController, getOrderById } from '../Controller/deliveryBoyController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router=express.Router()

router.post('/orderAccept',verifyToken,deliveryAcceptController)
router.get('/orders',verifyToken,getDeliveryBoyOrderController)
router.get('/orders/:id',verifyToken,getOrderById)

export default router