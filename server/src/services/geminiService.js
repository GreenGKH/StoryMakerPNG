import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import env from '../config/env.js';

// Initialize Gemini AI
if (!env.GEMINI_API_KEY) {
  logger.error('GEMINI_API_KEY not found in environment variables');
  throw new Error('GEMINI_API_KEY is required');
}

logger.info('Initializing Gemini AI with API key:', env.GEMINI_API_KEY ? 'Present' : 'Missing');
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Use the newer Gemini 2.5 Flash model which supports vision
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Genre descriptions for better prompting
const GENRE_DESCRIPTIONS = {
  horror: 'atmosphère terrifiante, suspense, éléments surnaturels ou psychologiques effrayants',
  fantasy: 'éléments magiques, créatures fantastiques, mondes imaginaires',
  'sci-fi': 'technologie avancée, futur, exploration spatiale, concepts scientifiques',
  romance: 'relations amoureuses, émotions, connexions humaines profondes',
  adventure: 'action, exploration, découvertes, voyages épiques',
  mystery: 'énigmes, secrets à résoudre, révélations progressives',
  comedy: 'situations amusantes, humour, légèreté, moments drôles',
  drama: 'émotions intenses, conflits humains, situations complexes',
  thriller: 'tension constante, suspense, rebondissements, rythme soutenu',
  historical: 'contexte historique précis, époque passée, authenticité culturelle'
};

// Length specifications
const LENGTH_SPECS = {
  short: { words: '100-200', description: 'concise et impactante' },
  medium: { words: '300-500', description: 'développée avec détails' },
  long: { words: '600-1000', description: 'riche et approfondie' }
};

// Language configurations for prompts
const LANGUAGE_CONFIG = {
  fr: {
    name: 'Français',
    instructions: 'LANGUE: Français'
  },
  en: {
    name: 'English', 
    instructions: 'LANGUAGE: English'
  },
  es: {
    name: 'Español',
    instructions: 'IDIOMA: Español'
  },
  de: {
    name: 'Deutsch',
    instructions: 'SPRACHE: Deutsch'
  },
  it: {
    name: 'Italiano',
    instructions: 'LINGUA: Italiano'
  },
  ru: {
    name: 'Русский',
    instructions: 'ЯЗЫК: Русский'
  }
};

/**
 * Generate story prompt based on genres, length and language
 */
const generateStoryPrompt = (genres, length, language = 'fr') => {
  const genreDescriptions = genres.map(genre => GENRE_DESCRIPTIONS[genre]).join(', ');
  const lengthSpec = LENGTH_SPECS[length];
  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.fr;
  
  return `Analyze this image carefully and create a captivating story of ${lengthSpec.words} words.

REQUIRED GENRES: ${genres.join(', ')} (${genreDescriptions})
LENGTH: ${lengthSpec.description} (${lengthSpec.words} words)
${langConfig.instructions}

INSTRUCTIONS:
1. Observe all visual details of the image (characters, objects, setting, atmosphere, colors, composition)
2. Create a story that naturally integrates the requested genres
3. The story must be directly inspired by the visual elements observed
4. Complete narrative structure: initial situation, development, resolution
5. Engaging and fluid writing style
6. Strictly respect the requested word count
7. Write the ENTIRE story in ${langConfig.name}

JSON RESPONSE FORMAT (JSON only):
{
  "title": "Catchy story title in ${langConfig.name}",
  "story": "Complete story here in ${langConfig.name}...",
  "themes": ["theme1", "theme2", "theme3"],
  "inspiration": "Description of visual elements that inspired the story",
  "wordCount": approximate_word_count
}

IMPORTANT: Respond ONLY with JSON, no additional text. The entire story content must be written in ${langConfig.name}.`;
};

/**
 * Generate story with Gemini 2.5 Flash
 */
export const generateStoryWithGemini = async (imageBuffer, genres, length, language = 'fr') => {
  try {
    // Validate inputs
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new AppError('Image buffer vide', 400, 'EMPTY_IMAGE_BUFFER');
    }
    
    if (!genres || genres.length === 0 || genres.length > 3) {
      throw new AppError('Nombre de genres invalide (1-3)', 400, 'INVALID_GENRES_COUNT');
    }
    
    if (!['short', 'medium', 'long'].includes(length)) {
      throw new AppError('Longueur invalide', 400, 'INVALID_LENGTH');
    }
    
    // Prepare image data for Gemini
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg' // Gemini handles multiple formats
      }
    };
    
    // Generate prompt
    const prompt = generateStoryPrompt(genres, length, language);
    
    logger.info(`Generating story with Gemini: genres=${genres.join(',')}, length=${length}, language=${language}`);
    logger.info(`Image size: ${imageBuffer.length} bytes`);
    logger.info(`Prompt length: ${prompt.length} characters`);
    logger.info(`Expected word count for ${length}: ${LENGTH_SPECS[length].words}`);
    
    // Call Gemini API with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 30000); // 30 second timeout
    });
    
    logger.info('Calling Gemini API...');
    const generationPromise = model.generateContent([prompt, imagePart]);
    
    const result = await Promise.race([generationPromise, timeoutPromise]);
    logger.info('Gemini API call completed');
    
    if (!result || !result.response) {
      throw new AppError('Réponse vide de Gemini', 500, 'GEMINI_EMPTY_RESPONSE');
    }
    
    const responseText = result.response.text();
    
    if (!responseText) {
      throw new AppError('Texte de réponse vide', 500, 'GEMINI_EMPTY_TEXT');
    }
    
    logger.info('Raw Gemini response received, parsing JSON...');
    logger.info(`Response length: ${responseText.length} characters`);
    logger.info(`Response preview: ${responseText.substring(0, 200)}...`);
    
    // Parse JSON response
    let storyData;
    try {
      // Clean response text (remove potential markdown formatting)
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      storyData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      logger.error('JSON parsing error:', { 
        error: parseError.message, 
        responseText: responseText.substring(0, 500) 
      });
      
      // Enhanced fallback: try to extract JSON from mixed content
      let fallbackStory = null;
      
      try {
        // Try to find JSON within the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0]
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          storyData = JSON.parse(extractedJson);
          logger.info('Successfully extracted JSON from mixed response');
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (secondParseError) {
        logger.error('Second JSON parsing attempt failed:', secondParseError.message);
        
        // Final fallback: create clean story structure
        const cleanText = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/^\s*\{[\s\S]*?"story":\s*"/m, '')
          .replace(/",?\s*"[^"]*":[\s\S]*\}\s*$/m, '')
          .trim();
        
        fallbackStory = {
          title: 'Histoire Générée',
          story: cleanText || responseText.substring(0, 1000) + '...',
          themes: genres,
          inspiration: 'Basé sur l\'analyse de l\'image fournie',
          wordCount: (cleanText || responseText).split(' ').length
        };
        
        logger.warn('Using enhanced fallback story structure');
        return fallbackStory;
      }
    }
    
    // Validate story data structure
    if (!storyData.title || !storyData.story) {
      logger.error('Invalid story structure:', { 
        hasTitle: !!storyData.title, 
        hasStory: !!storyData.story,
        storyData: JSON.stringify(storyData).substring(0, 200)
      });
      throw new AppError('Structure de réponse invalide', 500, 'INVALID_STORY_STRUCTURE');
    }
    
    // Clean and validate story content
    const cleanedStory = storyData.story
      .replace(/^\s*["']|["']\s*$/g, '') // Remove surrounding quotes
      .replace(/\\n/g, '\n') // Convert escaped newlines
      .replace(/\\"/g, '"') // Convert escaped quotes
      .trim();
    
    // Ensure all required fields
    const validatedStory = {
      title: (storyData.title || 'Histoire Sans Titre').replace(/^\s*["']|["']\s*$/g, '').trim(),
      story: cleanedStory,
      themes: storyData.themes || genres,
      inspiration: storyData.inspiration || 'Inspiré par l\'image fournie',
      wordCount: storyData.wordCount || cleanedStory.split(' ').filter(word => word.length > 0).length,
      generatedAt: new Date().toISOString()
    };
    
    // Validate word count for medium stories specifically
    if (length === 'medium' && validatedStory.wordCount < 100) {
      logger.warn(`Medium story appears too short: ${validatedStory.wordCount} words`);
    }
    
    logger.info(`Story generated successfully: ${validatedStory.wordCount} words`);
    
    return validatedStory;
    
  } catch (error) {
    logger.error('Gemini service error:', {
      message: error.message,
      stack: error.stack,
      genres,
      length,
      language,
      errorType: error.constructor.name,
      errorCode: error.code
    });
    
    // Log the full error object for debugging
    logger.error('Full error object:', error);
    
    // Handle specific Gemini API errors
    if (error.message.includes('API_KEY') || error.message.includes('Invalid API key')) {
      throw new AppError('Clé API Gemini invalide', 500, 'GEMINI_API_KEY_ERROR');
    }
    
    if (error.message.includes('SAFETY')) {
      throw new AppError('Contenu non autorisé détecté', 400, 'GEMINI_SAFETY_ERROR');
    }
    
    if (error.message.includes('TIMEOUT')) {
      throw new AppError('Délai de génération dépassé', 408, 'GEMINI_TIMEOUT');
    }
    
    if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('QUOTA_EXCEEDED')) {
      throw new AppError('Limite API atteinte', 429, 'GEMINI_QUOTA_EXCEEDED');
    }
    
    if (error.message.includes('PERMISSION_DENIED')) {
      throw new AppError('Accès refusé à l\'API Gemini', 403, 'GEMINI_PERMISSION_DENIED');
    }
    
    if (error.message.includes('UNAVAILABLE') || error.message.includes('SERVICE_UNAVAILABLE')) {
      throw new AppError('Service Gemini temporairement indisponible', 503, 'GEMINI_SERVICE_UNAVAILABLE');
    }
    
    // Re-throw AppErrors
    if (error instanceof AppError) {
      throw error;
    }
    
    // Default error with more context
    throw new AppError(`Erreur lors de la génération d'histoire: ${error.message}`, 500, 'GEMINI_GENERATION_ERROR');
  }
};