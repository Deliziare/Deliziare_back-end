// routes/chefRoutes.js
import express from 'express';
import upload from '../middleware/multer.js'
import { uploadCertificateController, uploadDeliveryFileController } from '../Controller/fileUploadController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/upload-certificate', upload.single('certificate'),verifyToken, uploadCertificateController);
router.post('/upload-dc', upload.single('certificate'),verifyToken, uploadDeliveryFileController);

export default router;
