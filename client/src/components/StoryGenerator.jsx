import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Download, Share2 } from 'lucide-react';
import { GENRES, STORY_LENGTHS } from '../utils/constants';

const StoryGenerator = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [storyLength, setStoryLength] = useState('medium');
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file,
          preview: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
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
    if (!selectedImage || selectedGenres.length === 0) {
      return;
    }

    setIsGenerating(true);
    
    // Simulation de génération d'histoire (remplacer par l'API réelle)
    setTimeout(() => {
      setGeneratedStory({
        title: "L'Aventure Mystérieuse",
        story: "Cette histoire sera générée par l'IA Gemini Pro Vision basée sur votre image et les genres sélectionnés. Pour l'instant, c'est une démonstration du fonctionnement de l'interface utilisateur.",
        themes: selectedGenres,
        wordCount: 150,
        generatedAt: new Date().toISOString()
      });
      setIsGenerating(false);
    }, 3000);
  };

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

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <button
          onClick={handleGenerateStory}
          disabled={!selectedImage || selectedGenres.length === 0 || isGenerating}
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
            <div className="flex space-x-2">
              <button className="btn btn-outline">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </button>
              <button className="btn btn-outline">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <h3 className="text-2xl font-display font-semibold text-slate-900 mb-4">
              {generatedStory.title}
            </h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {generatedStory.story}
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-2 text-sm text-slate-600">
            <span>Genres: {generatedStory.themes.join(', ')}</span>
            <span>•</span>
            <span>{generatedStory.wordCount} mots</span>
            <span>•</span>
            <span>Généré le {new Date(generatedStory.generatedAt).toLocaleDateString()}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StoryGenerator;