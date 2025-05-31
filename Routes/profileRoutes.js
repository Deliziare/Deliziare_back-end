import express from "express";
import { getChefPostById, getChefProfileById } from "../Controller/profileController.js";

const router=express.Router()

router.get('/:chefId', getChefProfileById)
router.get('/post/:chefId',getChefPostById)

export default router
