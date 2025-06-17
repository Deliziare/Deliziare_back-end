import express from 'express'
import { deliveryAcceptController, getDeliveryBoyOrderController, getOrderById, markAsDelivered, markAsPickedUp } from '../Controller/deliveryBoyController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router=express.Router()

router.post('/orderAccept',verifyToken,deliveryAcceptController)
router.get('/orders',verifyToken,getDeliveryBoyOrderController)
router.get('/orders/:id',verifyToken,getOrderById)
router.post('/:deliveryId/pickup',markAsPickedUp)
router.post('/:deliveryId/deliver',markAsDelivered)

export default router