import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import { AppError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

// Storage configuration
const storage = multer.memoryStorage();

// File filter
const fileFilter = async (req, file, cb) => {
  try {
    // Check MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new AppError('Type de fichier non autorisé', 400, 'INVALID_FILE_TYPE'));
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new AppError('Extension de fichier non autorisée', 400, 'INVALID_FILE_EXTENSION'));
    }
    
    cb(null, true);
  } catch (error) {
    logger.error('File filter error:', error);
    cb(new AppError('Erreur lors de la validation du fichier', 500, 'FILE_VALIDATION_ERROR'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024, // 2MB default
    files: 1 // Only one file at a time
  }
});

// Enhanced upload middleware with additional validation
export const uploadMiddleware = async (req, res, next) => {
  // Use multer middleware
  upload.single('image')(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err) {
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return next(new AppError('Fichier trop volumineux (max 2MB)', 400, 'FILE_TOO_LARGE'));
            case 'LIMIT_UNEXPECTED_FILE':
              return next(new AppError('Champ de fichier inattendu', 400, 'UNEXPECTED_FILE_FIELD'));
            case 'LIMIT_FILE_COUNT':
              return next(new AppError('Trop de fichiers', 400, 'TOO_MANY_FILES'));
            default:
              return next(new AppError('Erreur d\'upload', 400, 'UPLOAD_ERROR'));
          }
        }
        return next(err);
      }
      
      // Check if file exists
      if (!req.file) {
        return next(new AppError('Aucun fichier fourni', 400, 'NO_FILE_PROVIDED'));
      }
      
      // Additional file validation using file-type
      const detectedType = await fileTypeFromBuffer(req.file.buffer);
      
      if (!detectedType) {
        return next(new AppError('Type de fichier non détectable', 400, 'UNDETECTABLE_FILE_TYPE'));
      }
      
      const allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
      if (!allowedTypes.includes(detectedType.ext)) {
        return next(new AppError('Type de fichier non autorisé détecté', 400, 'INVALID_DETECTED_FILE_TYPE'));
      }
      
      // Add file metadata to request
      req.file.detectedType = detectedType;
      req.file.uploadTimestamp = Date.now();
      
      logger.info(`File uploaded: ${req.file.originalname}, size: ${req.file.size}, type: ${detectedType.ext}`);
      
      next();
    } catch (error) {
      logger.error('Upload middleware error:', error);
      next(new AppError('Erreur lors du traitement du fichier', 500, 'FILE_PROCESSING_ERROR'));
    }
  });
};