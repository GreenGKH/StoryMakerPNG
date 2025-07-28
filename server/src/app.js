import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import storyRoutes from './routes/stories.js';
import uploadRoutes from './routes/upload.js';
import { startCleanupJob } from './services/fileService.js';

// Load environment variables from the root directory
dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/stories', storyRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static files (uploaded images) in production
if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static('uploads'));
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Present' : 'Missing'}`);
    
    // Start cleanup job for old uploaded files
    startCleanupJob();
  });
}

export default app;