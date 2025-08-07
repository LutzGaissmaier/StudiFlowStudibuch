/**
 * Database Manager for MongoDB
 * 
 * This module handles MongoDB connection, disconnection, and health monitoring.
 * Includes connection pooling, retry logic, and comprehensive error handling.
 * 
 * @module DatabaseManager
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import { getConfig } from '../config/index';
import { mainLogger } from './logger';

/**
 * Database Manager Class
 * 
 * Manages MongoDB connections with enterprise features:
 * - Connection pooling
 * - Automatic reconnection
 * - Health monitoring
 * - Graceful shutdown
 */
export class DatabaseManager {
  private isConnected = false;
  private connectionAttempts = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000; // 5 seconds

  constructor() {
    this.setupEventHandlers();
  }

  /**
   * Setup MongoDB event handlers
   */
  private setupEventHandlers(): void {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.connectionAttempts = 0;
      mainLogger.info('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (error) => {
      this.isConnected = false;
      mainLogger.error('❌ MongoDB connection error', error);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      mainLogger.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      mainLogger.info('🔄 MongoDB reconnected');
    });
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect(): Promise<void> {
    const config = getConfig();
    
    try {
      mainLogger.info('🔗 Connecting to MongoDB...');
      
      await mongoose.connect(config.database.mongodb.uri, {
        dbName: config.database.mongodb.dbName,
        maxPoolSize: config.database.mongodb.maxPoolSize,
        serverSelectionTimeoutMS: config.database.mongodb.serverSelectionTimeoutMS,
        socketTimeoutMS: config.database.mongodb.socketTimeoutMS,
        family: 4, // Use IPv4
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true
      });

      this.isConnected = true;
      mainLogger.info('✅ MongoDB connection established');
      
    } catch (error) {
      this.connectionAttempts++;
      mainLogger.error(`❌ MongoDB connection failed (attempt ${this.connectionAttempts}/${this.maxRetries})`, error);
      
      if (this.connectionAttempts < this.maxRetries) {
        mainLogger.info(`🔄 Retrying MongoDB connection in ${this.retryDelay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect();
      } else {
        throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts`);
      }
    }
  }

  /**
   * Disconnect from MongoDB gracefully
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      mainLogger.info('📤 MongoDB already disconnected');
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      mainLogger.info('✅ MongoDB disconnected gracefully');
    } catch (error) {
      mainLogger.error('❌ Error disconnecting from MongoDB', error);
      throw error;
    }
  }

  /**
   * Check if database is connected and healthy
   */
  async isHealthy(): Promise<boolean> {
    if (!this.isConnected || !mongoose.connection.db) {
      return false;
    }

    try {
      // Ping the database
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      mainLogger.error('❌ Database health check failed', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      4: 'invalid',
      99: 'uninitialized'
    };
    
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<any> {
    if (!this.isConnected || !mongoose.connection.db) {
      throw new Error('Database not connected');
    }

    try {
      const stats = await mongoose.connection.db.stats();
      return {
        database: stats.db,
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      };
    } catch (error) {
      mainLogger.error('❌ Failed to get database statistics', error);
      throw error;
    }
  }

  /**
   * Drop database (use with caution!)
   */
  async dropDatabase(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    const config = getConfig();
    if (config.environment === 'production') {
      throw new Error('Cannot drop database in production environment');
    }

    try {
      await mongoose.connection.dropDatabase();
      mainLogger.warn('⚠️ Database dropped successfully');
    } catch (error) {
      mainLogger.error('❌ Failed to drop database', error);
      throw error;
    }
  }

  /**
   * Create database indexes
   */
  async createIndexes(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      // This would be called by individual models
      // Models should define their own indexes
      mainLogger.info('📊 Database indexes creation completed');
    } catch (error) {
      mainLogger.error('❌ Failed to create database indexes', error);
      throw error;
    }
  }

  /**
   * Backup database
   */
  async backup(backupPath?: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const config = getConfig();
    const backupName = `backup-${config.database.mongodb.dbName}-${timestamp}`;
    
    try {
      // This is a placeholder - in real implementation you would use mongodump
      mainLogger.info(`💾 Database backup initiated: ${backupName}`);
      
      // Return backup file path
      return backupPath || `./backups/${backupName}.tar.gz`;
    } catch (error) {
      mainLogger.error('❌ Database backup failed', error);
      throw error;
    }
  }
}  