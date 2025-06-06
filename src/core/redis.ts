/**
 * Redis Manager for Caching and Session Management
 * 
 * This module handles Redis connection, disconnection, and cache operations.
 * Includes connection pooling, retry logic, and comprehensive error handling.
 * 
 * @module RedisManager
 * @version 1.0.0
 */

import Redis from 'ioredis';
import { getConfig } from '../config';
import { mainLogger } from './logger';

/**
 * Redis Manager Class
 * 
 * Manages Redis connections and operations with enterprise features:
 * - Connection pooling
 * - Automatic reconnection
 * - Health monitoring
 * - Cache operations
 */
export class RedisManager {
  private client: Redis | null = null;
  private isConnected = false;
  private connectionAttempts = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 3000; // 3 seconds

  constructor() {
    // Client will be initialized in connect()
  }

  /**
   * Connect to Redis with retry logic
   */
  async connect(): Promise<void> {
    const config = getConfig();
    
    try {
      mainLogger.info('🔗 Connecting to Redis...');
      
      const redisConfig: any = {
        host: config.database.redis.host,
        port: config.database.redis.port,
        db: config.database.redis.db,
        maxRetriesPerRequest: config.database.redis.maxRetriesPerRequest,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxLoadingTimeout: 3000,
        showFriendlyErrorStack: true,
        lazyConnect: true
      };

      // Add password if provided
      if (config.database.redis.password) {
        redisConfig.password = config.database.redis.password;
      }

      this.client = new Redis(redisConfig);

      // Setup event handlers
      this.setupEventHandlers();

      // Connect
      await this.client.connect();
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      mainLogger.info('✅ Redis connection established');
      
    } catch (error) {
      this.connectionAttempts++;
      mainLogger.error(`❌ Redis connection failed (attempt ${this.connectionAttempts}/${this.maxRetries})`, error);
      
      if (this.connectionAttempts < this.maxRetries) {
        mainLogger.info(`🔄 Retrying Redis connection in ${this.retryDelay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect();
      } else {
        throw new Error(`Failed to connect to Redis after ${this.maxRetries} attempts`);
      }
    }
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      this.isConnected = true;
      mainLogger.info('✅ Redis connected successfully');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      mainLogger.info('🎯 Redis ready for operations');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      mainLogger.error('❌ Redis connection error', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      mainLogger.warn('⚠️ Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      mainLogger.info('🔄 Redis reconnecting...');
    });
  }

  /**
   * Disconnect from Redis gracefully
   */
  async disconnect(): Promise<void> {
    if (!this.client || !this.isConnected) {
      mainLogger.info('📤 Redis already disconnected');
      return;
    }

    try {
      await this.client.quit();
      this.isConnected = false;
      mainLogger.info('✅ Redis disconnected gracefully');
    } catch (error) {
      mainLogger.error('❌ Error disconnecting from Redis', error);
      throw error;
    }
  }

  /**
   * Check if Redis is connected and healthy
   */
  async isHealthy(): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch (error) {
      mainLogger.error('❌ Redis health check failed', error);
      return false;
    }
  }

  /**
   * Set a key-value pair with optional TTL
   */
  async set(key: string, value: string | object, ttlSeconds?: number): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      mainLogger.error(`❌ Redis SET operation failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      mainLogger.error(`❌ Redis GET operation failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get and parse JSON value by key
   */
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      mainLogger.error(`❌ Failed to parse JSON for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Delete a key
   */
  async delete(key: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      const result = await this.client.del(key);
      return result === 1;
    } catch (error) {
      mainLogger.error(`❌ Redis DELETE operation failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      mainLogger.error(`❌ Redis EXISTS operation failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Set TTL for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      mainLogger.error(`❌ Redis EXPIRE operation failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      mainLogger.error(`❌ Redis KEYS operation failed for pattern: ${pattern}`, error);
      throw error;
    }
  }

  /**
   * Flush all data (use with caution!)
   */
  async flushAll(): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const config = getConfig();
    if (config.environment === 'production') {
      throw new Error('Cannot flush Redis in production environment');
    }

    try {
      await this.client.flushall();
      mainLogger.warn('⚠️ Redis database flushed');
    } catch (error) {
      mainLogger.error('❌ Redis FLUSHALL operation failed', error);
      throw error;
    }
  }

  /**
   * Get Redis info
   */
  async getInfo(): Promise<string> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      return await this.client.info();
    } catch (error) {
      mainLogger.error('❌ Redis INFO operation failed', error);
      throw error;
    }
  }

  /**
   * Get Redis memory usage
   */
  async getMemoryUsage(): Promise<any> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      const info = await this.client.info('memory');
      const lines = info.split('\r\n');
      const memory: any = {};
      
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          memory[key] = value;
        }
      }
      
      return memory;
    } catch (error) {
      mainLogger.error('❌ Failed to get Redis memory usage', error);
      throw error;
    }
  }

  /**
   * Get the Redis client instance (use with caution)
   */
  getClient(): Redis | null {
    return this.client;
  }
} 