// Genre options with emojis and descriptions
export const GENRES = [
  {
    id: 'horror',
    name: 'Horreur',
    emoji: '🧛',
    description: 'Suspense, terreur et mystère',
    color: 'red'
  },
  {
    id: 'fantasy',
    name: 'Fantaisie',
    emoji: '🏰',
    description: 'Magie, créatures mythiques et mondes imaginaires',
    color: 'purple'
  },
  {
    id: 'sci-fi',
    name: 'Science-Fiction',
    emoji: '🚀',
    description: 'Futur, technologie et exploration spatiale',
    color: 'blue'
  },
  {
    id: 'romance',
    name: 'Romance',
    emoji: '💕',
    description: 'Amour, relations et émotions',
    color: 'pink'
  },
  {
    id: 'adventure',
    name: 'Aventure',
    emoji: '⚔️',
    description: 'Action, exploration et découvertes',
    color: 'green'
  },
  {
    id: 'mystery',
    name: 'Mystère',
    emoji: '🔍',
    description: 'Enquêtes, secrets et révélations',
    color: 'indigo'
  },
  {
    id: 'comedy',
    name: 'Comédie',
    emoji: '😄',
    description: 'Humour, situations drôles et légèreté',
    color: 'yellow'
  },
  {
    id: 'drama',
    name: 'Drame',
    emoji: '🎭',
    description: 'Émotions profondes et situations complexes',
    color: 'gray'
  },
  {
    id: 'thriller',
    name: 'Thriller',
    emoji: '⚡',
    description: 'Tension, suspense et rebondissements',
    color: 'orange'
  },
  {
    id: 'historical',
    name: 'Historique',
    emoji: '🏛️',
    description: 'Époques passées et contextes historiques',
    color: 'amber'
  }
];

// Language options for story generation
export const LANGUAGES = [
  {
    id: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    nativeName: 'Français'
  },
  {
    id: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  },
  {
    id: 'es',
    name: 'Español',
    flag: '🇪🇸',
    nativeName: 'Español'
  },
  {
    id: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    nativeName: 'Deutsch'
  },
  {
    id: 'it',
    name: 'Italiano',
    flag: '🇮🇹',
    nativeName: 'Italiano'
  },
  {
    id: 'ru',
    name: 'Русский',
    flag: '🇷🇺',
    nativeName: 'Русский'
  }
];

// Story length options
export const STORY_LENGTHS = [
  {
    id: 'short',
    name: 'Court',
    description: '100-200 mots',
    words: '100-200',
    duration: '~1 min de lecture',
    color: 'green'
  },
  {
    id: 'medium',
    name: 'Moyen',
    description: '300-500 mots',
    words: '300-500',
    duration: '~2-3 min de lecture',
    color: 'blue'
  },
  {
    id: 'long',
    name: 'Long',
    description: '600-1000 mots',
    words: '600-1000',
    duration: '~4-6 min de lecture',
    color: 'purple'
  }
];

// File upload constraints
export const UPLOAD_CONSTRAINTS = {
  maxSize: 2 * 1024 * 1024, // 2MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  minDimensions: { width: 50, height: 50 },
  maxDimensions: { width: 4096, height: 4096 }
};

// API endpoints
export const API_ENDPOINTS = {
  base: '/api',
  stories: {
    generate: '/stories/generate',
    history: '/stories/history'
  },
  upload: {
    image: '/upload/image',
    delete: (filename) => `/upload/${filename}`
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  stories: 'storymaker_stories',
  settings: 'storymaker_settings',
  preferences: 'storymaker_preferences'
};

// UI Configuration
export const UI_CONFIG = {
  maxGenreSelection: 3,
  defaultLength: 'medium',
  defaultLanguage: 'fr',
  defaultGenres: [],
  animationDuration: 300,
  toastDuration: 4000
};

// Error messages
export const ERROR_MESSAGES = {
  upload: {
    fileSize: 'Le fichier est trop volumineux (max 2MB)',
    fileType: 'Format de fichier non supporté (JPG, PNG, WebP uniquement)',
    fileDimensions: 'Dimensions de l\'image invalides',
    uploadFailed: 'Échec de l\'upload du fichier'
  },
  generation: {
    noImage: 'Veuillez sélectionner une image',
    noGenres: 'Veuillez sélectionner au moins un genre',
    tooManyGenres: 'Maximum 3 genres autorisés',
    apiFailed: 'Erreur lors de la génération de l\'histoire',
    timeout: 'Timeout: la génération prend trop de temps'
  },
  network: {
    offline: 'Connexion Internet requise',
    serverError: 'Erreur serveur, veuillez réessayer',
    rateLimited: 'Trop de requêtes, veuillez patienter'
  }
};

// Success messages
export const SUCCESS_MESSAGES = {
  upload: 'Image uploadée avec succès',
  generation: 'Histoire générée avec succès',
  save: 'Histoire sauvegardée',
  copy: 'Histoire copiée dans le presse-papiers',
  delete: 'Histoire supprimée'
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  imageCompressionQuality: 0.85,
  maxConcurrentRequests: 3,
  requestTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};