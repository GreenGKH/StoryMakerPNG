import { useState, useCallback } from 'react';
import { storyAPI, APIError } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Custom hook for story generation functionality
 */
export const useStoryGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedStory, setGeneratedStory] = useState(null);

  /**
   * Generate a story from image and parameters
   */
  const generateStory = useCallback(async (imageFile, genres, length) => {
    setIsGenerating(true);
    setError(null);
    
    const loadingToast = toast.loading('Génération de l\'histoire en cours...');
    
    try {
      console.log('Starting story generation...', { 
        fileName: imageFile?.name, 
        fileSize: imageFile?.size,
        genres, 
        length 
      });
      
      const result = await storyAPI.generateStory(imageFile, genres, length);
      
      console.log('Story generated successfully:', result);
      
      setGeneratedStory(result);
      toast.success('Histoire générée avec succès !', { id: loadingToast });
      
      return result;
      
    } catch (err) {
      console.error('Story generation failed:', err);
      
      let errorMessage = 'Erreur lors de la génération de l\'histoire';
      
      if (err instanceof APIError) {
        switch (err.code) {
          case 'MISSING_IMAGE':
            errorMessage = 'Veuillez sélectionner une image';
            break;
          case 'MISSING_GENRES':
            errorMessage = 'Veuillez sélectionner au moins un genre';
            break;
          case 'TOO_MANY_GENRES':
            errorMessage = 'Maximum 3 genres autorisés';
            break;
          case 'RATE_LIMITED':
            errorMessage = 'Trop de requêtes. Veuillez patienter quelques minutes.';
            break;
          case 'SERVICE_UNAVAILABLE':
            errorMessage = 'Service temporairement indisponible. Réessayez plus tard.';
            break;
          case 'TIMEOUT':
            errorMessage = 'La génération prend trop de temps. Réessayez avec une image plus petite.';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Erreur de connexion. Vérifiez votre connexion Internet.';
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      }
      
      setError({
        message: errorMessage,
        code: err.code || 'UNKNOWN_ERROR',
        details: err.details
      });
      
      toast.error(errorMessage, { id: loadingToast });
      throw err;
      
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear generated story
   */
  const clearStory = useCallback(() => {
    setGeneratedStory(null);
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setIsGenerating(false);
    setError(null);
    setGeneratedStory(null);
  }, []);

  return {
    // State
    isGenerating,
    error,
    generatedStory,
    
    // Actions
    generateStory,
    clearError,
    clearStory,
    reset
  };
};