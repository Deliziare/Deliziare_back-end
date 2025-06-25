import express from 'express'
import { deliveryAcceptController, deliveryRejectController, getDeliveryBoyOrderController, getLoggedInDeliveryBoy, getOrderById, markAsDelivered, markAsPickedUp, updateboyProfile } from '../Controller/deliveryBoyController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router=express.Router()
router.post('/orderAccept',verifyToken,deliveryAcceptController)
router.post('/orderReject',verifyToken,deliveryRejectController)
router.get('/orders',verifyToken,getDeliveryBoyOrderController)
router.get('/orders/:id',verifyToken,getOrderById)
router.post('/:deliveryId/pickup',markAsPickedUp)
router.post('/:deliveryId/deliver',markAsDelivered)
router.get('/getData',verifyToken,getLoggedInDeliveryBoy)
router.post('/updateProfile',verifyToken,updateboyProfile)
export default router