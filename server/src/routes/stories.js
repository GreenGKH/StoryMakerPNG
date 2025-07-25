import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateStory } from '../controllers/storyController.js';

const router = express.Router();

// Rate limiting for story generation
const storyGenerationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.STORY_RATE_LIMIT_MAX || 5, // 5 stories per 15 minutes
  message: {
    error: 'Trop de demandes de génération d\'histoires. Veuillez patienter.',
    code: 'STORY_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware for story generation
const validateStoryGeneration = [
  body('genres')
    .isArray({ min: 1, max: 3 })
    .withMessage('Entre 1 et 3 genres requis')
    .custom((genres) => {
      const validGenres = [
        'horror', 'fantasy', 'sci-fi', 'romance', 'adventure',
        'mystery', 'comedy', 'drama', 'thriller', 'historical'
      ];
      return genres.every(genre => validGenres.includes(genre));
    })
    .withMessage('Genres invalides'),
    
  body('length')
    .isIn(['short', 'medium', 'long'])
    .withMessage('Longueur invalide (short, medium, long)'),
    
  body('imageData')
    .notEmpty()
    .withMessage('Données d\'image requises'),
    
  body('fileName')
    .optional()
    .isString()
    .withMessage('Nom de fichier invalide')
];

// Routes
router.post('/generate', 
  storyGenerationLimit,
  validateStoryGeneration,
  asyncHandler(async (req, res, next) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Données de requête invalides',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }
    
    await generateStory(req, res, next);
  })
);

// Get story history (future implementation)
router.get('/history', asyncHandler(async (req, res) => {
  // This would typically fetch from a database
  // For now, return empty array
  res.json({
    success: true,
    data: {
      stories: [],
      total: 0,
      page: 1,
      limit: 10
    }
  });
}));

export default router;