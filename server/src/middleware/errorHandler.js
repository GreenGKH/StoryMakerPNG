import { logger } from '../utils/logger.js';

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found middleware
export const notFound = (req, res, next) => {
  const error = new AppError(`Route non trouvée - ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    error = new AppError(message, 404, 'INVALID_ID');
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Ressource déjà existante';
    error = new AppError(message, 400, 'DUPLICATE_RESOURCE');
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = new AppError(message, 401, 'EXPIRED_TOKEN');
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Fichier trop volumineux (max 2MB)';
    error = new AppError(message, 400, 'FILE_TOO_LARGE');
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Champ de fichier inattendu';
    error = new AppError(message, 400, 'UNEXPECTED_FILE_FIELD');
  }
  
  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Trop de requêtes, veuillez réessayer plus tard';
    error = new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
  
  // Google API errors
  if (err.message && err.message.includes('GEMINI')) {
    const message = 'Erreur du service de génération d\'histoires';
    error = new AppError(message, 503, 'GEMINI_API_ERROR');
  }
  
  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  
  // Response format
  const response = {
    success: false,
    error: {
      message: error.message || 'Erreur interne du serveur',
      code: code
    }
  };
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }
  
  // Include request info for debugging
  if (process.env.NODE_ENV === 'development') {
    response.error.request = {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body
    };
  }
  
  res.status(statusCode).json(response);
};

// Async handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};