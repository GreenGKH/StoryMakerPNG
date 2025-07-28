import axios from 'axios';
import { API_ENDPOINTS, PERFORMANCE_THRESHOLDS } from '../utils/constants';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_ENDPOINTS.base,
  timeout: PERFORMANCE_THRESHOLDS.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error types
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new APIError('Données invalides', 'VALIDATION_ERROR', data);
        case 429:
          throw new APIError('Trop de requêtes, veuillez patienter', 'RATE_LIMITED', data);
        case 503:
          throw new APIError('Service temporairement indisponible', 'SERVICE_UNAVAILABLE', data);
        default:
          throw new APIError(data?.error?.message || 'Erreur serveur', 'SERVER_ERROR', data);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new APIError('Délai de connexion dépassé', 'TIMEOUT');
    } else {
      throw new APIError('Erreur de connexion', 'NETWORK_ERROR');
    }
  }
);

// Custom API Error class
export class APIError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
  }
}

// Utility function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Utility function to compress image if needed
const compressImage = async (file, maxSizeMB = 1) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const maxWidth = 1024;
      const maxHeight = 1024;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.85 // 85% quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// API Services
export const storyAPI = {
  /**
   * Generate story from image
   * @param {File} imageFile - The image file
   * @param {string[]} genres - Selected genres
   * @param {string} length - Story length (short, medium, long)
   * @param {string} language - Story language (fr, en, es, de, it, pt)
   * @returns {Promise<Object>} Generated story data
   */
  async generateStory(imageFile, genres, length, language = 'fr') {
    try {
      // Validate inputs
      if (!imageFile) {
        throw new APIError('Image requise', 'MISSING_IMAGE');
      }
      
      if (!genres || genres.length === 0) {
        throw new APIError('Au moins un genre requis', 'MISSING_GENRES');
      }
      
      if (genres.length > 3) {
        throw new APIError('Maximum 3 genres autorisés', 'TOO_MANY_GENRES');
      }
      
      // Compress image if too large
      let processedFile = imageFile;
      if (imageFile.size > 1024 * 1024) { // 1MB
        console.log('Compressing image...');
        processedFile = await compressImage(imageFile);
      }
      
      // Convert to base64
      const base64Data = await fileToBase64(processedFile);
      
      // Prepare request data
      const requestData = {
        imageData: base64Data,
        genres,
        length,
        language,
        fileName: imageFile.name
      };
      
      console.log('Generating story...', { genres, length, language, fileSize: processedFile.size });
      
      // Make API call
      const response = await api.post(API_ENDPOINTS.stories.generate, requestData);
      
      if (!response.data.success) {
        throw new APIError(
          response.data.error?.message || 'Erreur lors de la génération',
          response.data.error?.code || 'GENERATION_ERROR'
        );
      }
      
      return response.data.data;
      
    } catch (error) {
      console.error('Story generation error:', error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError('Erreur lors de la génération d\'histoire', 'UNKNOWN_ERROR');
    }
  },
  
  /**
   * Get story history (for future implementation)
   * @returns {Promise<Array>} Array of stories
   */
  async getHistory() {
    try {
      const response = await api.get(API_ENDPOINTS.stories.history);
      return response.data.data.stories || [];
    } catch (error) {
      console.error('Failed to fetch history:', error);
      return [];
    }
  }
};

export const uploadAPI = {
  /**
   * Upload image file
   * @param {File} file - Image file to upload
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post(API_ENDPOINTS.upload.image, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
  
  /**
   * Delete uploaded image
   * @param {string} filename - Filename to delete
   * @returns {Promise<void>}
   */
  async deleteImage(filename) {
    try {
      await api.delete(API_ENDPOINTS.upload.delete(filename));
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
};

// Health check
export const healthAPI = {
  async check() {
    try {
      const response = await axios.get('/health', { timeout: 5000 });
      return response.data;
    } catch (error) {
      throw new APIError('Service indisponible', 'SERVICE_DOWN');
    }
  }
};

export default api;