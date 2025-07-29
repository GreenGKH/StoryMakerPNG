import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Download, Share2, AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { GENRES, STORY_LENGTHS, LANGUAGES, UI_CONFIG, UPLOAD_CONSTRAINTS } from '../utils/constants';
import { useStoryGenerator } from '../hooks/useStoryGenerator';
import { storyStorage } from '../services/storage';

const StoryGenerator = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [storyLength, setStoryLength] = useState('medium');
  const [selectedLanguage, setSelectedLanguage] = useState(UI_CONFIG.defaultLanguage);
  const [imageError, setImageError] = useState(null);
  
  // Use the story generation hook
  const { 
    isGenerating, 
    error, 
    generatedStory, 
    generateStory, 
    clearError, 
    clearStory 
  } = useStoryGenerator();

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Clear previous errors
    setImageError(null);
    clearError();
    
    // Validate file type
    if (!UPLOAD_CONSTRAINTS.acceptedTypes.includes(file.type)) {
      setImageError('Format de fichier non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }
    
    // Validate file size
    if (file.size > UPLOAD_CONSTRAINTS.maxSize) {
      setImageError(`Fichier trop volumineux. Taille maximum: ${Math.round(UPLOAD_CONSTRAINTS.maxSize / 1024 / 1024)}MB`);
      return;
    }
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      // Validate image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width < UPLOAD_CONSTRAINTS.minDimensions.width || 
            img.height < UPLOAD_CONSTRAINTS.minDimensions.height) {
          setImageError(`Image trop petite. Dimensions minimum: ${UPLOAD_CONSTRAINTS.minDimensions.width}x${UPLOAD_CONSTRAINTS.minDimensions.height}px`);
          return;
        }
        
        if (img.width > UPLOAD_CONSTRAINTS.maxDimensions.width || 
            img.height > UPLOAD_CONSTRAINTS.maxDimensions.height) {
          setImageError(`Image trop grande. Dimensions maximum: ${UPLOAD_CONSTRAINTS.maxDimensions.width}x${UPLOAD_CONSTRAINTS.maxDimensions.height}px`);
          return;
        }
        
        // Image is valid
        setSelectedImage({
          file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
          dimensions: { width: img.width, height: img.height }
        });
        
        toast.success('Image sélectionnée avec succès');
      };
      
      img.onerror = () => {
        setImageError('Impossible de charger l\'image. Vérifiez que le fichier n\'est pas corrompu.');
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      setImageError('Erreur lors de la lecture du fichier.');
    };
    
    reader.readAsDataURL(file);
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else if (prev.length < 3) {
        return [...prev, genreId];
      }
      return prev;
    });
  };

  const handleGenerateStory = async () => {
    // Validation
    if (!selectedImage) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    
    if (selectedGenres.length === 0) {
      toast.error('Veuillez sélectionner au moins un genre');
      return;
    }
    
    if (imageError) {
      toast.error('Veuillez corriger l\'erreur d\'image avant de continuer');
      return;
    }
    
    try {
      // Clear previous story and errors
      clearStory();
      clearError();
      
      // Generate story using the API
      await generateStory(selectedImage.file, selectedGenres, storyLength, selectedLanguage);
      
    } catch (error) {
      console.error('Story generation failed:', error);
      // Error is handled by the hook and displayed via toast
    }
  };
  
  const handleSaveStory = () => {
    if (!generatedStory) return;
    
    try {
      const savedStory = storyStorage.saveStory({
        ...generatedStory,
        metadata: {
          ...generatedStory.metadata,
          imageName: selectedImage?.name,
          imageSize: selectedImage?.size,
          imageDimensions: selectedImage?.dimensions
        }
      });
      
      toast.success('Histoire sauvegardée avec succès !');
      console.log('Story saved:', savedStory);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error('Save error:', error);
    }
  };
  
  const handleDownloadStory = () => {
    if (!generatedStory) return;
    
    const themes = Array.isArray(generatedStory.themes) ? generatedStory.themes.join(', ') : (generatedStory.themes || 'N/A');
    const content = `${generatedStory.title || 'Histoire Sans Titre'}\n\n${generatedStory.story || ''}\n\nGenres: ${themes}\nMots: ${generatedStory.wordCount || 0}\nGénéré le: ${generatedStory.generatedAt ? new Date(generatedStory.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(generatedStory.title || 'Histoire').replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Histoire téléchargée !');
  };
  
  const handleShareStory = async () => {
    if (!generatedStory) return;
    
    const storyText = generatedStory.story || '';
    const shareData = {
      title: generatedStory.title || 'Histoire Générée',
      text: `${storyText.substring(0, 100)}...`,
      url: window.location.href
    };
    
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Histoire partagée !');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${generatedStory.title || 'Histoire Générée'}\n\n${storyText}`);
        toast.success('Histoire copiée dans le presse-papiers !');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Erreur lors du partage');
    }
  };
  
  // Clear errors when dependencies change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [selectedImage, selectedGenres, storyLength, selectedLanguage]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-display font-bold text-slate-900">
          Générateur d'Histoires IA
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Transformez vos images en histoires captivantes grâce à l'intelligence artificielle
        </p>
      </motion.div>

      {/* Image Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2 text-primary-600" />
          Choisir une image
        </h2>
        
        {!selectedImage ? (
          <label className="block">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 mb-2">Cliquez pour sélectionner une image</p>
              <p className="text-sm text-slate-500">JPG, PNG ou WebP (max 2MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={selectedImage.preview}
                alt="Selected"
                className="w-full max-w-md mx-auto rounded-lg shadow-medium"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-center text-slate-600">{selectedImage.name}</p>
          </div>
        )}
        
        {/* Image Error Display */}
        {imageError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700 text-sm">{imageError}</p>
          </div>
        )}
        
        {/* Image Info */}
        {selectedImage && !imageError && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <span className="font-medium">Taille:</span> {Math.round(selectedImage.size / 1024)} KB
              </div>
              <div>
                <span className="font-medium">Dimensions:</span> {selectedImage.dimensions?.width}×{selectedImage.dimensions?.height}px
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Genre Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Sélectionner les genres (max 3)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreToggle(genre.id)}
              disabled={!selectedGenres.includes(genre.id) && selectedGenres.length >= 3}
              className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                selectedGenres.includes(genre.id)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              } ${
                !selectedGenres.includes(genre.id) && selectedGenres.length >= 3
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <div className="text-lg mb-1">{genre.emoji}</div>
              <div>{genre.name}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Story Length */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Longueur de l'histoire
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORY_LENGTHS.map((length) => (
            <button
              key={length.id}
              onClick={() => setStoryLength(length.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                storyLength === length.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-medium text-slate-900">{length.name}</div>
              <div className="text-sm text-slate-600">{length.description}</div>
              <div className="text-xs text-slate-500 mt-1">{length.duration}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Language Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Langue de l'histoire
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LANGUAGES.map((language) => (
            <button
              key={language.id}
              onClick={() => setSelectedLanguage(language.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedLanguage === language.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <div className="font-medium text-slate-900">{language.nativeName}</div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-red-50 border-red-200"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error.message}</p>
              {error.details && (
                <p className="text-red-600 text-sm mt-1">Code: {error.code}</p>
              )}
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 ml-3"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <button
          onClick={handleGenerateStory}
          disabled={!selectedImage || selectedGenres.length === 0 || isGenerating || imageError}
          className="btn btn-primary px-8 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="spinner h-5 w-5 mr-2" />
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Générer l'histoire
            </>
          )}
        </button>
        
        {(!selectedImage || selectedGenres.length === 0) && (
          <p className="text-sm text-slate-500 mt-2">
            {!selectedImage ? 'Sélectionnez une image' : 'Choisissez au moins un genre'}
          </p>
        )}
      </motion.div>

      {/* Generated Story */}
      {generatedStory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Histoire générée</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleSaveStory} className="btn btn-outline">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </button>
              <button onClick={handleDownloadStory} className="btn btn-outline">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </button>
              <button onClick={handleShareStory} className="btn btn-outline">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <h3 className="text-2xl font-display font-semibold text-slate-900 mb-4">
              {generatedStory?.title || 'Histoire Sans Titre'}
            </h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {(() => {
                const storyContent = generatedStory?.story || 'Histoire non disponible';
                // Clean up any potential formatting issues
                const cleanedContent = storyContent
                  .replace(/^\s*["']|["']\s*$/g, '') // Remove surrounding quotes
                  .replace(/\\n/g, '\n') // Convert escaped newlines
                  .replace(/\\"/g, '"') // Convert escaped quotes
                  .trim();
                
                // Log for debugging
                if (storyLength === 'medium' && storyContent !== cleanedContent) {
                  console.log('Medium story content cleaned:', { original: storyContent.substring(0, 100), cleaned: cleanedContent.substring(0, 100) });
                }
                
                return cleanedContent;
              })()}
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-2 text-sm text-slate-600">
            <span>Genres: {Array.isArray(generatedStory?.themes) ? generatedStory.themes.join(', ') : (generatedStory?.themes || 'N/A')}</span>
            <span>•</span>
            <span>{generatedStory?.wordCount || 0} mots</span>
            <span>•</span>
            <span>Généré le {generatedStory?.generatedAt ? new Date(generatedStory.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
            {generatedStory?.metadata?.generationTime && (
              <>
                <span>•</span>
                <span>{Math.round(generatedStory.metadata.generationTime / 1000)}s</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StoryGenerator;