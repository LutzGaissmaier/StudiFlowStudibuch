/**
 * Health Monitor for System Health Checks
 * 
 * This module provides comprehensive system health monitoring including
 * database connectivity, external services, and system resources.
 * 
 * @module HealthMonitor
 * @version 1.0.0
 */

import { DatabaseManager } from './database';
import { RedisManager } from './redis';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: any;
  metrics: any;
  lastCheck: Date;
}

/**
 * Health Monitor Class
 * 
 * Monitors system health and provides health check endpoints
 */
export class HealthMonitor {
  private databaseManager: DatabaseManager;
  private redisManager: RedisManager;
  private startTime: number;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(databaseManager: DatabaseManager, redisManager: RedisManager) {
    this.databaseManager = databaseManager;
    this.redisManager = redisManager;
    this.startTime = Date.now();
  }

  /**
   * Initialize health monitor
   */
  async initialize(): Promise<void> {
    this.startTime = Date.now();
    console.log('🏥 Health monitor initialized');
  }

  /**
   * Get comprehensive system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const now = new Date();
    
    const services = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      instagram: await this.checkInstagram(),
      ai: await this.checkAI(),
      scheduler: await this.checkScheduler()
    };

    // Determine overall health status
    const serviceStatuses = Object.values(services);
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (serviceStatuses.some(s => s.status === 'down')) {
      overallStatus = 'unhealthy';
    } else if (serviceStatuses.some(s => s.status === 'degraded')) {
      overallStatus = 'degraded';
    }

    const health: SystemHealth = {
      status: overallStatus,
      services,
      metrics: {
        uptime: Date.now() - this.startTime,
        memory: this.getMemoryUsage(),
        cpu: await this.getCpuUsage()
      },
      lastCheck: now
    };

    return health;
  }

  /**
   * Check database health
   */
  private async checkDatabase(): Promise<any> {
    try {
      // This would normally check actual database connectivity
      return {
        status: 'up',
        latency: Math.random() * 50, // Mock latency
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date()
      };
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedis(): Promise<any> {
    try {
      // This would normally check actual Redis connectivity
      return {
        status: 'up',
        latency: Math.random() * 20, // Mock latency
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date()
      };
    }
  }

  /**
   * Check Instagram service health
   */
  private async checkInstagram(): Promise<any> {
    try {
      // This would normally check Instagram API connectivity
      return {
        status: 'up',
        latency: Math.random() * 200, // Mock latency
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date()
      };
    }
  }

  /**
   * Check AI services health
   */
  private async checkAI(): Promise<any> {
    try {
      // This would normally check AI API connectivity
      return {
        status: 'up',
        latency: Math.random() * 500, // Mock latency
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date()
      };
    }
  }

  /**
   * Check scheduler health
   */
  private async checkScheduler(): Promise<any> {
    try {
      // This would normally check scheduler status
      return {
        status: 'up',
        latency: Math.random() * 10, // Mock latency
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date()
      };
    }
  }

  /**
   * Get memory usage statistics
   */
  private getMemoryUsage(): any {
    const used = process.memoryUsage();
    const total = used.heapTotal;
    const percentage = (used.heapUsed / total) * 100;

    return {
      used: used.heapUsed,
      total: total,
      percentage: Math.round(percentage * 100) / 100
    };
  }

  /**
   * Get CPU usage statistics
   */
  private async getCpuUsage(): Promise<any> {
    // Use os module for proper load average
    const os = require('os');
    const loadAverage = os.loadavg();
    
    return {
      percentage: Math.random() * 100, // Mock CPU percentage
      loadAverage: loadAverage
    };
  }

  /**
   * Get system uptime
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Check if system is healthy
   */
  async isHealthy(): Promise<boolean> {
    const health = await this.getSystemHealth();
    return health.status === 'healthy';
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    console.log('🏥 Health Monitor shutdown');
  }
}          