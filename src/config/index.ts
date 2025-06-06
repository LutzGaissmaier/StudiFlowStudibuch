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
import joi from 'joi';
import type { AppConfig, Environment } from '../types/core';

// Load environment variables
dotenv.config();

/**
 * Joi validation schema for the entire application configuration
 */
const configSchema = joi.object<AppConfig>({
  environment: joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development'),
    
  server: joi.object({
    port: joi.number()
      .port()
      .default(3000),
    host: joi.string()
      .hostname()
      .default('localhost'),
    cors: joi.object({
      origins: joi.array()
        .items(joi.string().uri())
        .default(['http://localhost:3000']),
      credentials: joi.boolean()
        .default(true)
    }).required()
  }).required(),

  database: joi.object({
    mongodb: joi.object({
      uri: joi.string()
        .uri()
        .required()
        .description('MongoDB connection URI'),
      dbName: joi.string()
        .min(1)
        .max(63)
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .required()
        .description('MongoDB database name'),
      maxPoolSize: joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),
      serverSelectionTimeoutMS: joi.number()
        .integer()
        .min(1000)
        .max(30000)
        .default(5000),
      socketTimeoutMS: joi.number()
        .integer()
        .min(1000)
        .max(60000)
        .default(45000)
    }).required(),
    
    redis: joi.object({
      host: joi.string()
        .hostname()
        .required()
        .description('Redis host'),
      port: joi.number()
        .port()
        .default(6379),
      password: joi.string()
        .optional()
        .description('Redis password'),
      db: joi.number()
        .integer()
        .min(0)
        .max(15)
        .default(0),
      maxRetriesPerRequest: joi.number()
        .integer()
        .min(0)
        .default(3)
    }).required()
  }).required(),

  security: joi.object({
    jwt: joi.object({
      secret: joi.string()
        .min(32)
        .required()
        .description('JWT secret key - must be at least 32 characters'),
      expiresIn: joi.string()
        .pattern(/^\d+[smhd]$/)
        .default('24h')
        .description('JWT expiration time'),
      issuer: joi.string()
        .default('riona-ai')
        .description('JWT issuer'),
      audience: joi.string()
        .default('riona-ai-users')
        .description('JWT audience')
    }).required(),
    
    bcrypt: joi.object({
      saltRounds: joi.number()
        .integer()
        .min(8)
        .max(16)
        .default(12)
        .description('Bcrypt salt rounds')
    }).required(),
    
    rateLimit: joi.object({
      windowMs: joi.number()
        .integer()
        .min(1000)
        .default(15 * 60 * 1000), // 15 minutes
      max: joi.number()
        .integer()
        .min(1)
        .default(100)
        .description('Maximum requests per window')
    }).required()
  }).required(),

  ai: joi.object({
    openai: joi.object({
      apiKey: joi.string()
        .pattern(/^sk-[a-zA-Z0-9]{32,}$/)
        .required()
        .description('OpenAI API key'),
      model: joi.string()
        .valid('gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo')
        .default('gpt-4-turbo')
        .description('OpenAI model to use'),
      maxTokens: joi.number()
        .integer()
        .min(1)
        .max(8192)
        .default(2048)
        .description('Maximum tokens for OpenAI responses')
    }).required(),
    
    gemini: joi.object({
      apiKey: joi.string()
        .required()
        .description('Google Gemini API key'),
      model: joi.string()
        .default('gemini-pro')
        .description('Gemini model to use')
    }).required()
  }).required(),

  instagram: joi.object({
    enabled: joi.boolean()
      .default(false)
      .description('Enable Instagram automation'),
    credentials: joi.object({
      username: joi.string()
        .min(1)
        .max(30)
        .pattern(/^[a-zA-Z0-9._]+$/)
        .required()
        .description('Instagram username'),
      password: joi.string()
        .min(6)
        .required()
        .description('Instagram password')
    }).required(),
    
    automation: joi.object({
      maxLikesPerHour: joi.number()
        .integer()
        .min(0)
        .max(60)
        .default(30)
        .description('Maximum likes per hour'),
      maxCommentsPerHour: joi.number()
        .integer()
        .min(0)
        .max(20)
        .default(10)
        .description('Maximum comments per hour'),
      maxFollowsPerHour: joi.number()
        .integer()
        .min(0)
        .max(20)
        .default(10)
        .description('Maximum follows per hour'),
      maxPostsPerDay: joi.number()
        .integer()
        .min(0)
        .max(10)
        .default(3)
        .description('Maximum posts per day')
    }).required(),
    
    proxy: joi.object({
      host: joi.string()
        .hostname()
        .required(),
      port: joi.number()
        .port()
        .required(),
      username: joi.string()
        .optional(),
      password: joi.string()
        .optional()
    }).optional()
  }).required(),

  studibuch: joi.object({
    baseUrl: joi.string()
      .uri()
      .default('https://studibuch.de')
      .description('Base URL for Studibuch website'),
    scraping: joi.object({
      enabled: joi.boolean()
        .default(false)
        .description('Enable article scraping'),
      intervalMinutes: joi.number()
        .integer()
        .min(5)
        .max(1440) // 24 hours
        .default(60)
        .description('Scraping interval in minutes'),
      maxArticlesPerRun: joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .description('Maximum articles to scrape per run')
    }).required()
  }).required(),

  logging: joi.object({
    level: joi.string()
      .valid('error', 'warn', 'info', 'debug')
      .default('info')
      .description('Logging level'),
    maxFiles: joi.string()
      .pattern(/^\d+d?$/)
      .default('14d')
      .description('Maximum log files to keep'),
    maxSize: joi.string()
      .pattern(/^\d+[kmg]?b?$/i)
      .default('20m')
      .description('Maximum size per log file')
  }).required()
});

/**
 * Raw configuration from environment variables
 */
const rawConfig = {
  environment: process.env.NODE_ENV as Environment,
  
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    host: process.env.HOST,
    cors: {
      origins: process.env.CORS_ORIGINS?.split(',') || undefined,
      credentials: process.env.CORS_CREDENTIALS === 'true'
    }
  },

  database: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      dbName: process.env.MONGODB_DB_NAME,
      maxPoolSize: process.env.MONGODB_MAX_POOL_SIZE ? parseInt(process.env.MONGODB_MAX_POOL_SIZE, 10) : undefined,
      serverSelectionTimeoutMS: process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ? parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 10) : undefined,
      socketTimeoutMS: process.env.MONGODB_SOCKET_TIMEOUT_MS ? parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS, 10) : undefined
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
      db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : undefined,
      maxRetriesPerRequest: process.env.REDIS_MAX_RETRIES ? parseInt(process.env.REDIS_MAX_RETRIES, 10) : undefined
    }
  },

  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    },
    bcrypt: {
      saltRounds: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : undefined
    },
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : undefined,
      max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : undefined
    }
  },

  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      maxTokens: process.env.OPENAI_MAX_TOKENS ? parseInt(process.env.OPENAI_MAX_TOKENS, 10) : undefined
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL
    }
  },

  instagram: {
    enabled: process.env.INSTAGRAM_ENABLED === 'true',
    credentials: {
      username: process.env.INSTAGRAM_USERNAME,
      password: process.env.INSTAGRAM_PASSWORD
    },
    automation: {
      maxLikesPerHour: process.env.INSTAGRAM_MAX_LIKES_PER_HOUR ? parseInt(process.env.INSTAGRAM_MAX_LIKES_PER_HOUR, 10) : undefined,
      maxCommentsPerHour: process.env.INSTAGRAM_MAX_COMMENTS_PER_HOUR ? parseInt(process.env.INSTAGRAM_MAX_COMMENTS_PER_HOUR, 10) : undefined,
      maxFollowsPerHour: process.env.INSTAGRAM_MAX_FOLLOWS_PER_HOUR ? parseInt(process.env.INSTAGRAM_MAX_FOLLOWS_PER_HOUR, 10) : undefined,
      maxPostsPerDay: process.env.INSTAGRAM_MAX_POSTS_PER_DAY ? parseInt(process.env.INSTAGRAM_MAX_POSTS_PER_DAY, 10) : undefined
    },
    proxy: process.env.INSTAGRAM_PROXY_HOST ? {
      host: process.env.INSTAGRAM_PROXY_HOST,
      port: parseInt(process.env.INSTAGRAM_PROXY_PORT || '8080', 10),
      ...(process.env.INSTAGRAM_PROXY_USERNAME && { username: process.env.INSTAGRAM_PROXY_USERNAME }),
      ...(process.env.INSTAGRAM_PROXY_PASSWORD && { password: process.env.INSTAGRAM_PROXY_PASSWORD })
    } : undefined
  },

  studibuch: {
    baseUrl: process.env.STUDIBUCH_BASE_URL,
    scraping: {
      enabled: process.env.STUDIBUCH_SCRAPING_ENABLED === 'true',
      intervalMinutes: process.env.STUDIBUCH_SCRAPING_INTERVAL_MINUTES ? parseInt(process.env.STUDIBUCH_SCRAPING_INTERVAL_MINUTES, 10) : undefined,
      maxArticlesPerRun: process.env.STUDIBUCH_MAX_ARTICLES_PER_RUN ? parseInt(process.env.STUDIBUCH_MAX_ARTICLES_PER_RUN, 10) : undefined
    }
  },

  logging: {
    level: process.env.LOG_LEVEL,
    maxFiles: process.env.LOG_MAX_FILES,
    maxSize: process.env.LOG_MAX_SIZE
  }
};

/**
 * Validates and returns the application configuration
 * 
 * @throws {Error} If configuration validation fails
 * @returns {AppConfig} Validated and typed configuration object
 */
function loadConfig(): AppConfig {
  const { error, value } = configSchema.validate(rawConfig, {
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false,
    convert: true
  });

  if (error) {
    const errorMessage = error.details
      .map((detail: joi.ValidationErrorItem) => `${detail.path.join('.')}: ${detail.message}`)
      .join('\n');
    
    throw new Error(`Configuration validation failed:\n${errorMessage}`);
  }

  return value as AppConfig;
}

/**
 * Cached validated configuration
 */
let cachedConfig: AppConfig | null = null;

/**
 * Gets the validated application configuration
 * Configuration is loaded once and cached for subsequent calls
 * 
 * @returns {AppConfig} The validated configuration object
 */
export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

/**
 * Validates that all required environment variables are set
 * This function should be called during application startup
 * 
 * @throws {Error} If required environment variables are missing
 */
export function validateEnvironment(): void {
  const requiredVars = [
    'MONGODB_URI',
    'MONGODB_DB_NAME',
    'REDIS_HOST',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'GEMINI_API_KEY'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate Instagram credentials if enabled
  if (process.env.INSTAGRAM_ENABLED === 'true') {
    const instagramRequired = ['INSTAGRAM_USERNAME', 'INSTAGRAM_PASSWORD'];
    const instagramMissing = instagramRequired.filter(varName => !process.env[varName]);
    
    if (instagramMissing.length > 0) {
      throw new Error(`Instagram is enabled but missing required variables: ${instagramMissing.join(', ')}`);
    }
  }
}

/**
 * Checks if the application is running in development mode
 * 
 * @returns {boolean} True if in development mode
 */
export function isDevelopment(): boolean {
  return getConfig().environment === 'development';
}

/**
 * Checks if the application is running in production mode
 * 
 * @returns {boolean} True if in production mode
 */
export function isProduction(): boolean {
  return getConfig().environment === 'production';
}

/**
 * Checks if the application is running in test mode
 * 
 * @returns {boolean} True if in test mode
 */
export function isTest(): boolean {
  return getConfig().environment === 'test';
}

/**
 * Gets a sanitized version of the configuration for logging
 * Removes sensitive information like passwords and API keys
 * 
 * @returns {Partial<AppConfig>} Sanitized configuration object
 */
export function getSanitizedConfig(): Partial<AppConfig> {
  const config = getConfig();
  
  return {
    environment: config.environment,
    server: config.server,
    database: {
      mongodb: {
        uri: config.database.mongodb.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
        dbName: config.database.mongodb.dbName,
        maxPoolSize: config.database.mongodb.maxPoolSize,
        serverSelectionTimeoutMS: config.database.mongodb.serverSelectionTimeoutMS,
        socketTimeoutMS: config.database.mongodb.socketTimeoutMS
      },
      redis: {
        host: config.database.redis.host,
        port: config.database.redis.port,
        password: config.database.redis.password ? '***' : undefined,
        db: config.database.redis.db,
        maxRetriesPerRequest: config.database.redis.maxRetriesPerRequest
      }
    },
    security: {
      jwt: {
        secret: '***',
        expiresIn: config.security.jwt.expiresIn,
        issuer: config.security.jwt.issuer,
        audience: config.security.jwt.audience
      },
      bcrypt: config.security.bcrypt,
      rateLimit: config.security.rateLimit
    },
    ai: {
      openai: {
        apiKey: '***',
        model: config.ai.openai.model,
        maxTokens: config.ai.openai.maxTokens
      },
      gemini: {
        apiKey: '***',
        model: config.ai.gemini.model
      }
    },
    instagram: {
      enabled: config.instagram.enabled,
      credentials: {
        username: config.instagram.credentials.username,
        password: '***'
      },
      automation: config.instagram.automation,
      proxy: config.instagram.proxy ? {
        host: config.instagram.proxy.host,
        port: config.instagram.proxy.port,
        username: config.instagram.proxy.username,
        password: config.instagram.proxy.password ? '***' : undefined
      } : undefined
    },
    studibuch: config.studibuch,
    logging: config.logging
  };
}

// Export the main configuration getter as default
export default getConfig; 