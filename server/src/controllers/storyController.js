import { generateStoryWithGemini } from '../services/geminiService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export const generateStory = async (req, res, next) => {
  try {
    const { genres, length, imageData, fileName } = req.body;
    
    logger.info(`Story generation request: genres=${genres.join(',')}, length=${length}, fileName=${fileName}`);
    
    // Convert base64 image data to buffer if needed
    let imageBuffer;
    if (typeof imageData === 'string') {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      imageBuffer = imageData;
    }
    
    // Validate image buffer
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new AppError('Données d\'image invalides', 400, 'INVALID_IMAGE_DATA');
    }
    
    // Check image size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024; // 2MB
    if (imageBuffer.length > maxSize) {
      throw new AppError('Image trop volumineuse', 400, 'IMAGE_TOO_LARGE');
    }
    
    // Generate story using Gemini
    const startTime = Date.now();
    const storyResult = await generateStoryWithGemini(imageBuffer, genres, length);
    const generationTime = Date.now() - startTime;
    
    logger.info(`Story generated successfully in ${generationTime}ms`);
    
    // Prepare response
    const response = {
      success: true,
      data: {
        story: storyResult,
        metadata: {
          genres,
          length,
          fileName: fileName || 'uploaded_image',
          generationTime,
          timestamp: new Date().toISOString()
        }
      }
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    logger.error('Story generation error:', {
      message: error.message,
      stack: error.stack,
      genres: req.body.genres,
      length: req.body.length
    });
    
    // Handle specific Gemini API errors
    if (error.message.includes('GEMINI') || error.message.includes('API')) {
      return next(new AppError(
        'Service de génération temporairement indisponible',
        503,
        'GEMINI_SERVICE_UNAVAILABLE'
      ));
    }
    
    // Handle rate limiting from Gemini
    if (error.message.includes('quota') || error.message.includes('rate')) {
      return next(new AppError(
        'Limite de génération atteinte, veuillez réessayer plus tard',
        429,
        'GEMINI_RATE_LIMITED'
      ));
    }
    
    // Handle timeout errors
    if (error.message.includes('timeout') || error.code === 'TIMEOUT') {
      return next(new AppError(
        'La génération prend trop de temps, veuillez réessayer',
        408,
        'GENERATION_TIMEOUT'
      ));
    }
    
    next(error);
  }
};