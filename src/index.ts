/**
 * StudiFlow AI Enterprise System - Mock Version
 * 
 * This version includes all enterprise features but uses mocked services
 * for development without requiring actual database connections.
 * 
 * @module StudiFlowAIApplication
 * @version 1.0.0
 */

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import services
import { StudiBuchMagazineService } from './services/studibuch-magazine';
import { SchedulerService } from './services/scheduler';
import { RealAutomationService } from './services/real-automation-service';
import { createAPIRoutes } from './api/index';

// Mock services for development
class MockDatabaseManager {
  async connect() { console.log('🗄️ Mock Database connected'); }
  async disconnect() { console.log('🗄️ Mock Database disconnected'); }
  async isHealthy() { return true; }
}

class MockRedisManager {
  async connect() { console.log('🔴 Mock Redis connected'); }
  async disconnect() { console.log('🔴 Mock Redis disconnected'); }
  async isHealthy() { return true; }
}

class MockHealthMonitor {
  async initialize() { console.log('🏥 Mock Health Monitor initialized'); }
  async getSystemHealth() {
    return {
      status: 'healthy',
      services: {
        database: { status: 'up', latency: 12 },
        redis: { status: 'up', latency: 5 },
        instagram: { status: 'up', latency: 150 },
        ai: { status: 'up', latency: 300 },
        scheduler: { status: 'up', latency: 8 },
        magazine: { status: 'up', latency: 25 }
      },
      metrics: {
        uptime: process.uptime() * 1000,
        memory: process.memoryUsage(),
        cpu: { percentage: Math.random() * 100, loadAverage: [0.1, 0.2, 0.3] }
      },
      lastCheck: new Date()
    };
  }
}

class MockService {
  constructor(private name: string) {}
  async initialize() { console.log(`${this.name} initialized`); }
  async shutdown() { console.log(`${this.name} shutdown`); }
  async isHealthy() { return true; }
}

/**
 * Main Application Class
 */
class StudiFlowAIEnterpriseApp {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private isShuttingDown = false;

  // Mock services
  private databaseManager = new MockDatabaseManager();
  private redisManager = new MockRedisManager();
  private healthMonitor = new MockHealthMonitor();
  private instagramService = new MockService('📱 Instagram Service');
  private aiService = new MockService('🤖 AI Service');
  private scrapingService = new MockService('🕷️ Scraping Service');
  private contentService = new MockService('📝 Content Service');
  
  // Real services
  private magazineService = new StudiBuchMagazineService();
  private schedulerService = new SchedulerService();
  private realAutomationService = new RealAutomationService();

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: ['http://localhost:3000'],
        credentials: true
      }
    });
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Starting StudiFlow AI Enterprise System v1.0 (Mock Version)...');
      
      // Setup Express middleware
      this.setupMiddleware();
      
      // Initialize services
      await this.initializeServices();
      
      // Setup API routes
      this.setupRoutes();
      
      // Setup error handlers
      this.setupErrorHandlers();
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();

      console.log('✅ Application initialization completed successfully');
    } catch (error) {
      console.error('❌ Failed to initialize application', error);
      process.exit(1);
    }
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS - Allow all localhost ports for development
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));

    // Compression
    this.app.use(compression());

    // Rate limiting (Development-friendly)
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Increased for frontend development
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false,
      // Skip rate limiting for localhost development
      skip: (req) => {
        return req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1';
      }
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files
    this.app.use(express.static('public'));

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      });
      
      next();
    });

    console.log('✅ Express middleware configured');
  }

  /**
   * Initialize services
   */
  private async initializeServices(): Promise<void> {
    try {
      await this.databaseManager.connect();
      await this.redisManager.connect();
      await this.healthMonitor.initialize();
      await this.aiService.initialize();
      await this.instagramService.initialize();
      await this.scrapingService.initialize();
      await this.contentService.initialize();
      await this.schedulerService.initialize();
      
      // Initialize StudiBuch Magazine Service
      await this.magazineService.initialize();
      
      // Initialize Real Automation Service
      await this.realAutomationService.initialize();
      
      // Make real automation service globally available for API routes
      (global as any).realAutomationService = this.realAutomationService;
      
      console.log('✅ All services initialized');
    } catch (error) {
      console.error('❌ Failed to initialize services', error);
      throw error;
    }
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const health = await this.healthMonitor.getSystemHealth();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        
        res.status(statusCode).json({
          success: true,
          data: health
        });
      } catch (error) {
        console.error('Health check failed', error);
        res.status(503).json({
          success: false,
          error: {
            code: 'HEALTH_CHECK_FAILED',
            message: 'Health check failed'
          }
        });
      }
    });

    // API routes
    this.app.use('/api', createAPIRoutes(this.magazineService, this.schedulerService));

    console.log('✅ API routes configured');
  }

  /**
   * Create API routes
   */
  private createApiRoutes(): express.Router {
    const router = express.Router();

    // API info
    router.get('/', (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'StudiFlow AI Enterprise API',
          version: '1.0.0',
          endpoints: [
            'GET /api',
            'GET /api/status',
            'GET /api/content',
            'GET /api/instagram/status',
            'GET /api/ai/status',
            'GET /api/system/metrics'
          ]
        }
      });
    });

    // System status (moved from root)
    router.get('/status', (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'StudiFlow AI Enterprise System',
          version: '1.0.0',
          status: 'running',
          mode: 'enterprise-mock',
          features: [
            'Enterprise Security',
            'Service Architecture',
            'Health Monitoring',
            'API Management',
            'Rate Limiting'
          ]
        }
      });
    });

    // Content management
    router.get('/content', (req, res) => {
      res.json({
        success: true,
        data: [
          {
            id: 'mock-1',
            type: 'post',
            title: 'Studibuch Content Example',
            status: 'published',
            createdAt: new Date().toISOString()
          }
        ],
        meta: { total: 1, page: 1 }
      });
    });

    // Instagram service
    router.get('/instagram/status', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'connected',
          enabled: false,
          lastPost: new Date().toISOString(),
          metrics: {
            followers: 1250,
            posts: 45,
            engagement: 3.8
          }
        }
      });
    });

    // AI service
    router.get('/ai/status', (req, res) => {
      res.json({
        success: true,
        data: {
          openai: { status: 'connected', model: 'gpt-4-turbo' },
          gemini: { status: 'connected', model: 'gemini-pro' },
          lastGeneration: new Date().toISOString()
        }
      });
    });

    // System metrics
    router.get('/system/metrics', (req, res) => {
      res.json({
        success: true,
        data: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          pid: process.pid,
          version: process.version,
          platform: process.platform
        }
      });
    });

    // StudiBuch Magazine quick access
    router.get('/magazine/status', (req, res) => {
      const articles = this.magazineService.getAllArticles();
      const modifiedContent = this.magazineService.getAllModifiedContent();
      
      res.json({
        success: true,
        data: {
          service: 'StudiBuch Magazine Integration',
          status: 'operational',
          articlesCount: articles.length,
          modifiedCount: modifiedContent.length,
          readyForPublishing: modifiedContent.filter(c => c.instagram.ready).length
        }
      });
    });

    return router;
  }

  /**
   * Setup error handlers
   */
  private setupErrorHandlers(): void {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found'
        }
      });
    });

    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);

      const statusCode = error.statusCode || 500;
      const message = error.isOperational ? error.message : 'Internal server error';

      res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message
        }
      });
    });

    console.log('✅ Error handlers configured');
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) {
        console.log('Shutdown already in progress, forcing exit');
        process.exit(1);
      }

      this.isShuttingDown = true;
      console.log(`🛑 Received ${signal}, starting graceful shutdown...`);

      try {
        // Close server
        this.server.close(() => {
          console.log('✅ HTTP server closed');
        });

        // Close Socket.IO
        this.io.close(() => {
          console.log('✅ Socket.IO server closed');
        });

        // Shutdown services
        await this.schedulerService.shutdown();
        await this.contentService.shutdown();
        await this.scrapingService.shutdown();
        await this.instagramService.shutdown();
        await this.aiService.shutdown();
        await this.redisManager.disconnect();
        await this.databaseManager.disconnect();

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    console.log('✅ Graceful shutdown handlers configured');
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      await this.initialize();

      const port = process.env.PORT || 3000;
      const host = process.env.HOST || 'localhost';

      this.server.listen(port, host, () => {
        console.log('🎉 =====================================');
        console.log('🚀 StudiFlow AI Enterprise v1.0 STARTED!');
        console.log('🎉 =====================================');
        console.log(`📡 Server: http://${host}:${port}`);
        console.log(`🏥 Health: http://${host}:${port}/health`);
        console.log(`🔌 API: http://${host}:${port}/api`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('🎉 =====================================');
      });
    } catch (error) {
      console.error('❌ Failed to start server', error);
      process.exit(1);
    }
  }
}

/**
 * Application entry point
 */
async function main(): Promise<void> {
  try {
    const app = new StudiFlowAIEnterpriseApp();
    await app.start();
  } catch (error) {
    console.error('❌ Fatal error during startup:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unhandled error in main:', error);
    process.exit(1);
  });
}

export default StudiFlowAIEnterpriseApp; 