import express from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

// Rate limiting for file uploads
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.UPLOAD_RATE_LIMIT_MAX || 10, // 10 uploads per 15 minutes
  message: {
    error: 'Trop d\'uploads. Veuillez patienter.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
router.post('/image',
  uploadRateLimit,
  uploadMiddleware,
  asyncHandler(uploadImage)
);

router.delete('/:filename',
  asyncHandler(deleteImage)
);

export default router;