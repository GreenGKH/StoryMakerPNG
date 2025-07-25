import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';
import { logger } from '../utils/logger.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_AGE = parseInt(process.env.MAX_FILE_AGE) || 7; // 7 days default
const CLEANUP_INTERVAL = process.env.CLEANUP_INTERVAL || '0 2 * * *'; // Daily at 2 AM

/**
 * Clean up old uploaded files
 */
export const cleanupOldFiles = async () => {
  try {
    logger.info('Starting cleanup of old uploaded files...');
    
    // Ensure upload directory exists
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      logger.info('Upload directory does not exist, skipping cleanup');
      return;
    }
    
    const files = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();
    const maxAge = MAX_FILE_AGE * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    let deletedCount = 0;
    let totalSize = 0;
    
    for (const file of files) {
      // Skip .gitkeep and other system files
      if (file.startsWith('.')) {
        continue;
      }
      
      const filePath = path.join(UPLOAD_DIR, file);
      
      try {
        const stats = await fs.stat(filePath);
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
          totalSize += stats.size;
          
          logger.info(`Deleted old file: ${file} (${Math.round(fileAge / (24 * 60 * 60 * 1000))} days old)`);
        }
      } catch (error) {
        logger.error(`Error processing file ${file}:`, error);
      }
    }
    
    if (deletedCount > 0) {
      logger.info(`Cleanup completed: ${deletedCount} files deleted, ${Math.round(totalSize / 1024)} KB freed`);
    } else {
      logger.info('Cleanup completed: no old files found');
    }
    
  } catch (error) {
    logger.error('Cleanup error:', error);
  }
};

/**
 * Start cleanup cron job
 */
export const startCleanupJob = () => {
  // Validate cron expression
  if (!cron.validate(CLEANUP_INTERVAL)) {
    logger.error(`Invalid cron expression: ${CLEANUP_INTERVAL}, using default`);
    return;
  }
  
  logger.info(`Starting file cleanup job with interval: ${CLEANUP_INTERVAL}`);
  
  cron.schedule(CLEANUP_INTERVAL, cleanupOldFiles, {
    scheduled: true,
    timezone: 'UTC'
  });
  
  // Run cleanup once on startup
  setTimeout(cleanupOldFiles, 5000); // Wait 5 seconds after startup
};

/**
 * Get upload directory statistics
 */
export const getUploadStats = async () => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    let totalSize = 0;
    let fileCount = 0;
    const fileTypes = {};
    
    for (const file of files) {
      if (file.startsWith('.')) {
        continue;
      }
      
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);
      const extension = path.extname(file).toLowerCase();
      
      totalSize += stats.size;
      fileCount++;
      
      fileTypes[extension] = (fileTypes[extension] || 0) + 1;
    }
    
    return {
      fileCount,
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      fileTypes,
      directory: UPLOAD_DIR
    };
    
  } catch (error) {
    logger.error('Error getting upload stats:', error);
    return {
      fileCount: 0,
      totalSize: 0,
      totalSizeMB: 0,
      fileTypes: {},
      directory: UPLOAD_DIR,
      error: error.message
    };
  }
};