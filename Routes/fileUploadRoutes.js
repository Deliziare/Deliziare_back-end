// routes/chefRoutes.js
import express from 'express';
import upload from '../middleware/multer.js'
import { uploadCertificateController } from '../Controller/fileUploadController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/upload-certificate', upload.single('certificate'),verifyToken, uploadCertificateController);

export default router;
