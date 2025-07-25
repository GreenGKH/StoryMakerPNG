import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

/**
 * Upload and process image
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400, 'NO_FILE_PROVIDED');
    }
    
    const { buffer, originalname, detectedType } = req.file;
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = detectedType.ext === 'jpeg' ? 'jpg' : detectedType.ext;
    const filename = `${timestamp}_${randomString}.${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    
    // Process image with Sharp
    let processedBuffer;
    try {
      const imageProcessor = sharp(buffer);
      
      // Get image metadata
      const metadata = await imageProcessor.metadata();
      
      logger.info(`Processing image: ${originalname}, ${metadata.width}x${metadata.height}, ${metadata.format}`);
      
      // Validate dimensions
      if (metadata.width < 50 || metadata.height < 50) {
        throw new AppError('Image trop petite (minimum 50x50)', 400, 'IMAGE_TOO_SMALL');
      }
      
      if (metadata.width > 4096 || metadata.height > 4096) {
        throw new AppError('Image trop grande (maximum 4096x4096)', 400, 'IMAGE_TOO_LARGE');
      }
      
      // Process image: resize if needed, optimize quality
      let processor = imageProcessor;
      
      // Resize if too large
      if (metadata.width > 2048 || metadata.height > 2048) {
        processor = processor.resize(2048, 2048, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Convert to appropriate format and optimize
      switch (extension) {
        case 'jpg':
          processor = processor.jpeg({ quality: 85, progressive: true });
          break;
        case 'png':
          processor = processor.png({ compressionLevel: 8 });
          break;
        case 'webp':
          processor = processor.webp({ quality: 85 });
          break;
      }
      
      processedBuffer = await processor.toBuffer();
      
    } catch (sharpError) {
      logger.error('Image processing error:', sharpError);
      throw new AppError('Erreur lors du traitement de l\'image', 500, 'IMAGE_PROCESSING_ERROR');
    }
    
    // Save processed image
    await fs.writeFile(filepath, processedBuffer);
    
    // Get final file stats
    const stats = await fs.stat(filepath);
    
    logger.info(`Image saved: ${filename}, ${stats.size} bytes`);
    
    // Return file information
    const response = {
      success: true,
      data: {
        filename,
        originalName: originalname,
        size: stats.size,
        mimeType: `image/${extension}`,
        url: `/uploads/${filename}`,
        uploadedAt: new Date().toISOString()
      }
    };
    
    res.status(201).json(response);
    
  } catch (error) {
    logger.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      filename: req.file?.originalname
    });
    
    throw error;
  }
};

/**
 * Delete uploaded image
 */
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename (security check)
    if (!filename || filename.includes('..') || filename.includes('/')) {
      throw new AppError('Nom de fichier invalide', 400, 'INVALID_FILENAME');
    }
    
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      throw new AppError('Fichier non trouvé', 404, 'FILE_NOT_FOUND');
    }
    
    // Delete file
    await fs.unlink(filepath);
    
    logger.info(`File deleted: ${filename}`);
    
    res.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });
    
  } catch (error) {
    logger.error('Delete error:', {
      message: error.message,
      filename: req.params.filename
    });
    
    throw error;
  }
};