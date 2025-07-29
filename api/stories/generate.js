import { GoogleGenerativeAI } from '@google/generative-ai';

const GENRE_DESCRIPTIONS = {
  horror: 'atmosphère terrifiante, suspense, éléments surnaturels',
  fantasy: 'éléments magiques, créatures fantastiques, mondes imaginaires',
  'sci-fi': 'technologie avancée, futur, exploration spatiale',
  romance: 'relations amoureuses, émotions, connexions humaines',
  adventure: 'action, exploration, découvertes, voyages épiques',
  mystery: 'énigmes, secrets à résoudre, révélations progressives',
  comedy: 'situations amusantes, humour, légèreté',
  drama: 'émotions intenses, conflits humains, situations complexes',
  thriller: 'tension constante, suspense, rebondissements',
  historical: 'contexte historique précis, époque passée'
};

const LENGTH_SPECS = {
  short: { words: '100-200', description: 'concise et impactante' },
  medium: { words: '300-500', description: 'développée avec détails' },
  long: { words: '600-1000', description: 'riche et approfondie' }
};

const LANGUAGE_CONFIG = {
  fr: { name: 'Français', instructions: 'LANGUE: Français' },
  en: { name: 'English', instructions: 'LANGUAGE: English' },
  es: { name: 'Español', instructions: 'IDIOMA: Español' },
  de: { name: 'Deutsch', instructions: 'SPRACHE: Deutsch' },
  it: { name: 'Italiano', instructions: 'LINGUA: Italiano' },
  ru: { name: 'Русский', instructions: 'ЯЗЫК: Русский' }
};

const generateStoryPrompt = (genres, length, language = 'fr') => {
  const genreDescriptions = genres.map(genre => GENRE_DESCRIPTIONS[genre]).join(', ');
  const lengthSpec = LENGTH_SPECS[length];
  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.fr;
  
  return `Analyze this image and create a story of ${lengthSpec.words} words.

GENRES: ${genres.join(', ')} (${genreDescriptions})
LENGTH: ${lengthSpec.description} (${lengthSpec.words} words)
${langConfig.instructions}

Create a complete story with beginning, development, and conclusion.
Respond ONLY with JSON format:

{
  "title": "Story title in ${langConfig.name}",
  "story": "Complete story text in ${langConfig.name}",
  "themes": ["theme1", "theme2"],
  "inspiration": "Visual elements that inspired the story",
  "wordCount": word_count_number
}`;
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { genres, length, language = 'fr', imageData } = req.body;

    // Validation
    if (!imageData || !genres || !length) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Missing required fields', code: 'VALIDATION_ERROR' } 
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: { message: 'API key not configured', code: 'CONFIG_ERROR' }
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Process image
    let base64Data = imageData;
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    }

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg'
      }
    };

    // Generate story
    const prompt = generateStoryPrompt(genres, length, language);
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Parse response
    let storyData;
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      storyData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // Fallback
      storyData = {
        title: 'Histoire Générée',
        story: responseText.substring(0, 1000),
        themes: genres,
        inspiration: 'Inspiré par l\'image',
        wordCount: responseText.split(' ').length
      };
    }

    // Clean and validate
    const validatedStory = {
      title: storyData.title || 'Histoire Sans Titre',
      story: storyData.story || responseText,
      themes: storyData.themes || genres,
      inspiration: storyData.inspiration || 'Inspiré par l\'image',
      wordCount: storyData.wordCount || storyData.story?.split(' ').length || 0,
      generatedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: {
        story: validatedStory,
        metadata: {
          genres,
          length,
          language,
          generationTime: Date.now(),
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Story generation error:', error);
    
    return res.status(500).json({
      success: false,
      error: { 
        message: 'Story generation failed', 
        code: 'GENERATION_ERROR' 
      }
    });
  }
}