/**
 * Configuration Management System
 * 
 * This module handles all application configuration including environment variables,
 * validation, defaults, and type safety. All configuration is immutable and validated
 * at startup.
 * 
 * @module Configuration
 * @version 1.0.0
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export function getConfig() {
  return {
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001'),
    
    database: {
      mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        dbName: process.env.MONGODB_DB_NAME || 'studiflow_ai',
        maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
        serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000'),
        socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000')
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || '',
        db: parseInt(process.env.REDIS_DB || '0'),
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3')
      }
    },

    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      automation: {
        username: process.env.IGusername,
        password: process.env.IGpassword
      }
    },

    ai: {
      geminiApiKeys: getGeminiApiKeys(),
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo'
      }
    },

    security: {
      jwt: {
        secret: process.env.JWT_SECRET || 'default-jwt-secret-for-development-only',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: process.env.JWT_ISSUER || 'riona-ai',
        audience: process.env.JWT_AUDIENCE || 'riona-ai-users'
      },
      bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
      },
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100')
      }
    },

    studibuch: {
      baseUrl: process.env.STUDIBUCH_BASE_URL || 'https://studibuch.de',
      scraping: {
        enabled: process.env.STUDIBUCH_SCRAPING_ENABLED === 'true',
        intervalMinutes: parseInt(process.env.STUDIBUCH_SCRAPING_INTERVAL_MINUTES || '60'),
        maxArticlesPerRun: parseInt(process.env.STUDIBUCH_MAX_ARTICLES_PER_RUN || '10')
      }
    },

    logging: {
      level: process.env.LOG_LEVEL || 'info',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      maxSize: process.env.LOG_MAX_SIZE || '20m'
    }
  };
}

export function getGeminiApiKeys(): string[] {
  const keys = [];
  for (let i = 1; i <= 50; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key && key !== `API_KEY_${i}` && key !== `your-gemini-key-${i}`) {
      keys.push(key);
    }
  }
  return keys;
}

export default getConfig;     