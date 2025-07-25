import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Download, Share2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { storyStorage } from '../services/storage';
import { GENRES } from '../utils/constants';

const StoryHistory = () => {
  const [stories, setStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Load stories from local storage
  useEffect(() => {
    const loadStories = () => {
      try {
        const savedStories = storyStorage.getAllStories();
        setStories(savedStories);
        console.log('Loaded stories from storage:', savedStories.length);
      } catch (error) {
        console.error('Failed to load stories:', error);
        toast.error('Erreur lors du chargement des histoires');
      }
    };
    
    loadStories();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadStories();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.story.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || story.themes.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const handleDeleteStory = (storyId) => {
    try {
      storyStorage.deleteStory(storyId);
      setStories(prev => prev.filter(story => story.id !== storyId));
      toast.success('Histoire supprimée');
    } catch (error) {
      console.error('Failed to delete story:', error);
      toast.error('Erreur lors de la suppression');
    }
  };
  
  const handleDownloadStory = (story) => {
    const content = `${story.title}\n\n${story.story}\n\nGenres: ${story.themes?.join(', ')}\nMots: ${story.wordCount}\nGénéré le: ${new Date(story.generatedAt).toLocaleDateString()}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Histoire téléchargée !');
  };
  
  const handleShareStory = async (story) => {
    const shareData = {
      title: story.title,
      text: `${story.story.substring(0, 100)}...`,
      url: window.location.href
    };
    
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Histoire partagée !');
      } else {
        await navigator.clipboard.writeText(`${story.title}\n\n${story.story}`);
        toast.success('Histoire copiée dans le presse-papiers !');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Erreur lors du partage');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays === 2) return 'Il y a 2 jours';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getGenreColor = (genre) => {
    const colors = {
      horror: 'bg-red-100 text-red-800',
      fantasy: 'bg-purple-100 text-purple-800',
      'sci-fi': 'bg-blue-100 text-blue-800',
      romance: 'bg-pink-100 text-pink-800',
      adventure: 'bg-green-100 text-green-800',
      mystery: 'bg-indigo-100 text-indigo-800',
      comedy: 'bg-yellow-100 text-yellow-800',
      drama: 'bg-gray-100 text-gray-800',
      thriller: 'bg-orange-100 text-orange-800',
      historical: 'bg-amber-100 text-amber-800'
    };
    return colors[genre] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-display font-bold text-slate-900 flex items-center justify-center">
          <History className="h-10 w-10 mr-3 text-primary-600" />
          Historique des Histoires
        </h1>
        <p className="text-lg text-slate-600">
          Retrouvez toutes vos histoires générées précédemment
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher dans vos histoires..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          {/* Genre Filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="input w-full md:w-auto"
          >
            <option value="all">Tous les genres</option>
            <option value="horror">Horreur</option>
            <option value="fantasy">Fantaisie</option>
            <option value="sci-fi">Science-Fiction</option>
            <option value="romance">Romance</option>
            <option value="adventure">Aventure</option>
            <option value="mystery">Mystère</option>
            <option value="comedy">Comédie</option>
            <option value="drama">Drame</option>
            <option value="thriller">Thriller</option>
            <option value="historical">Historique</option>
          </select>
        </div>
      </motion.div>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <History className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchTerm || selectedGenre !== 'all' ? 'Aucune histoire trouvée' : 'Aucune histoire générée'}
          </h3>
          <p className="text-slate-600">
            {searchTerm || selectedGenre !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par générer votre première histoire !'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-medium transition-shadow"
            >
              {/* Story Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {story.themes.map((theme) => (
                      <span
                        key={theme}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(theme)}`}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteStory(story.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Story Preview */}
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                {story.story}
              </p>

              {/* Story Meta */}
              <div className="text-xs text-slate-500 mb-4 space-y-1">
                <div>{story.wordCount} mots • {formatDate(story.generatedAt || story.savedAt)}</div>
                {story.metadata?.imageName && (
                  <div>Image: {story.metadata.imageName}</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleDownloadStory(story)}
                  className="btn btn-outline text-sm flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Télécharger
                </button>
                <button 
                  onClick={() => handleShareStory(story)}
                  className="btn btn-outline text-sm flex-1"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Partager
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats */}
      {stories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-gradient-to-r from-primary-50 to-secondary-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {stories.length}
              </div>
              <div className="text-sm text-slate-600">Histoires générées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-600">
                {stories.reduce((total, story) => total + story.wordCount, 0)}
              </div>
              <div className="text-sm text-slate-600">Mots au total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-600">
                {[...new Set(stories.flatMap(story => story.themes))].length}
              </div>
              <div className="text-sm text-slate-600">Genres explorés</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StoryHistory;