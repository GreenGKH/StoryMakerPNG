import { STORAGE_KEYS } from '../utils/constants';

/**
 * Local storage service for persisting user data
 */

// Story storage utilities
export const storyStorage = {
  /**
   * Save a story to local storage
   * @param {Object} story - Story object to save
   */
  saveStory(story) {
    try {
      const stories = this.getAllStories();
      const newStory = {
        ...story,
        id: Date.now().toString(),
        savedAt: new Date().toISOString()
      };
      
      stories.unshift(newStory); // Add to beginning
      
      // Limit to 50 stories max
      const limitedStories = stories.slice(0, 50);
      
      localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(limitedStories));
      
      console.log('Story saved to local storage:', newStory.id);
      return newStory;
    } catch (error) {
      console.error('Failed to save story:', error);
      throw new Error('Erreur lors de la sauvegarde');
    }
  },

  /**
   * Get all saved stories
   * @returns {Array} Array of saved stories
   */
  getAllStories() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.stories);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load stories:', error);
      return [];
    }
  },

  /**
   * Get a specific story by ID
   * @param {string} storyId - Story ID
   * @returns {Object|null} Story object or null
   */
  getStory(storyId) {
    try {
      const stories = this.getAllStories();
      return stories.find(story => story.id === storyId) || null;
    } catch (error) {
      console.error('Failed to get story:', error);
      return null;
    }
  },

  /**
   * Delete a story by ID
   * @param {string} storyId - Story ID to delete
   */
  deleteStory(storyId) {
    try {
      const stories = this.getAllStories();
      const filtered = stories.filter(story => story.id !== storyId);
      
      localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(filtered));
      
      console.log('Story deleted from local storage:', storyId);
      return true;
    } catch (error) {
      console.error('Failed to delete story:', error);
      throw new Error('Erreur lors de la suppression');
    }
  },

  /**
   * Clear all stories
   */
  clearAllStories() {
    try {
      localStorage.removeItem(STORAGE_KEYS.stories);
      console.log('All stories cleared from local storage');
    } catch (error) {
      console.error('Failed to clear stories:', error);
      throw new Error('Erreur lors de la suppression');
    }
  },

  /**
   * Get storage statistics
   * @returns {Object} Storage stats
   */
  getStats() {
    try {
      const stories = this.getAllStories();
      const totalWords = stories.reduce((sum, story) => sum + (story.wordCount || 0), 0);
      const genres = [...new Set(stories.flatMap(story => story.themes || []))];
      
      return {
        totalStories: stories.length,
        totalWords,
        uniqueGenres: genres.length,
        genres,
        oldestStory: stories[stories.length - 1]?.savedAt,
        newestStory: stories[0]?.savedAt
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalStories: 0,
        totalWords: 0,
        uniqueGenres: 0,
        genres: []
      };
    }
  }
};

// Settings storage utilities
export const settingsStorage = {
  /**
   * Save user settings
   * @param {Object} settings - Settings object
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  /**
   * Get user settings
   * @returns {Object} Settings object
   */
  getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.settings);
      return stored ? JSON.parse(stored) : this.getDefaultSettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  },

  /**
   * Get default settings
   * @returns {Object} Default settings
   */
  getDefaultSettings() {
    return {
      defaultLength: 'medium',
      defaultGenres: [],
      autoSave: true,
      theme: 'light',
      language: 'fr'
    };
  },

  /**
   * Update specific setting
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  updateSetting(key, value) {
    try {
      const settings = this.getSettings();
      settings[key] = value;
      this.saveSettings(settings);
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  }
};

// Preferences storage utilities  
export const preferencesStorage = {
  /**
   * Save user preferences
   * @param {Object} preferences - Preferences object
   */
  savePreferences(preferences) {
    try {
      localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  },

  /**
   * Get user preferences
   * @returns {Object} Preferences object
   */
  getPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.preferences);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return {};
    }
  }
};

// Storage utilities
export const storageUtils = {
  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getStorageUsage() {
    try {
      let totalSize = 0;
      const breakdown = {};
      
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const size = localStorage[key].length;
          totalSize += size;
          
          if (key.startsWith('storymaker_')) {
            breakdown[key] = size;
          }
        }
      }
      
      return {
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024),
        breakdown,
        available: 5 * 1024 * 1024 - totalSize, // Assume 5MB limit
        percentUsed: (totalSize / (5 * 1024 * 1024)) * 100
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { totalSize: 0, totalSizeKB: 0, breakdown: {}, available: 0, percentUsed: 0 };
    }
  },

  /**
   * Clear all app data
   */
  clearAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('All app data cleared');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('Erreur lors de la suppression des données');
    }
  },

  /**
   * Export all data
   * @returns {Object} Exported data
   */
  exportData() {
    try {
      return {
        stories: storyStorage.getAllStories(),
        settings: settingsStorage.getSettings(),
        preferences: preferencesStorage.getPreferences(),
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Erreur lors de l\'export des données');
    }
  },

  /**
   * Import data
   * @param {Object} data - Data to import
   */
  importData(data) {
    try {
      if (data.stories) {
        localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(data.stories));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings));
      }
      if (data.preferences) {
        localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(data.preferences));
      }
      
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Erreur lors de l\'import des données');
    }
  }
};