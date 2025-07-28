// Environment configuration - loaded first
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple paths for .env file
const envPaths = [
  path.resolve(__dirname, '../../../.env'),  // Root of project
  path.resolve(__dirname, '../../.env'),     // Parent of server
  path.resolve(__dirname, '../.env'),        // Server directory
  '.env'                                     // Current directory
];

let envLoaded = false;

for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      console.log(`✅ Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    // Continue to next path
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found in any of the expected locations');
  console.log('Expected locations:', envPaths);
}

// Validate required environment variables
const requiredVars = ['GEMINI_API_KEY'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.log('Current env keys:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
} else {
  console.log('✅ All required environment variables are present');
}

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 2097152,
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};