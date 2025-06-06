/**
 * Test Setup and Configuration
 * 
 * This module sets up the testing environment for the Riona AI Enterprise system.
 * It includes database setup, mocking, and test utilities.
 * 
 * @module TestSetup
 * @version 1.0.0
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Redis from 'ioredis-mock';
import { jest } from '@jest/globals';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/riona-ai-test';
process.env.MONGODB_DB_NAME = 'riona-ai-test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-long-enough-for-validation';
process.env.OPENAI_API_KEY = 'sk-test-openai-key-for-testing-purposes-only';
process.env.GEMINI_API_KEY = 'test-gemini-key-for-testing';
process.env.INSTAGRAM_ENABLED = 'false';
process.env.STUDIBUCH_SCRAPING_ENABLED = 'false';

// Global test variables
let mongoServer: MongoMemoryServer;
let redisClient: Redis;

/**
 * Global test setup - runs before all tests
 */
beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;

  // Connect to test database
  await mongoose.connect(mongoUri);

  // Setup Redis mock
  redisClient = new Redis();

  // Mock external services
  setupMocks();

  console.log('🧪 Test environment initialized');
}, 30000);

/**
 * Global test teardown - runs after all tests
 */
afterAll(async () => {
  // Close database connections
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  // Stop MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }

  // Close Redis connection
  if (redisClient) {
    redisClient.disconnect();
  }

  console.log('🧪 Test environment cleaned up');
}, 30000);

/**
 * Setup before each test
 */
beforeEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Clear Redis
  await redisClient.flushall();

  // Reset all mocks
  jest.clearAllMocks();
});

/**
 * Setup mocks for external services
 */
function setupMocks(): void {
  // Mock OpenAI
  jest.mock('openai', () => ({
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Mocked AI response for testing'
              }
            }]
          })
        }
      }
    }))
  }));

  // Mock Google Generative AI
  jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue('Mocked Gemini response for testing')
          }
        })
      })
    }))
  }));

  // Mock Instagram Private API
  jest.mock('instagram-private-api', () => ({
    IgApiClient: jest.fn().mockImplementation(() => ({
      state: {
        generateDevice: jest.fn(),
        serialize: jest.fn().mockReturnValue('{}'),
        deserialize: jest.fn()
      },
      account: {
        login: jest.fn().mockResolvedValue(true)
      },
      media: {
        uploadPhoto: jest.fn().mockResolvedValue({ pk: 'test-media-id' })
      },
      publish: {
        photo: jest.fn().mockResolvedValue({ pk: 'test-post-id' })
      }
    }))
  }));

  // Mock Puppeteer
  jest.mock('puppeteer', () => ({
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn().mockResolvedValue(true),
        content: jest.fn().mockResolvedValue('<html><body>Test content</body></html>'),
        close: jest.fn().mockResolvedValue(true)
      }),
      close: jest.fn().mockResolvedValue(true)
    })
  }));

  // Mock file system operations
  jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    readFileSync: jest.fn().mockReturnValue('test file content'),
    unlinkSync: jest.fn()
  }));

  // Mock Sharp for image processing
  jest.mock('sharp', () => jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('test image data')),
    toFile: jest.fn().mockResolvedValue({ size: 1024 })
  })));

  // Mock FFmpeg for video processing
  jest.mock('fluent-ffmpeg', () => jest.fn().mockImplementation(() => ({
    input: jest.fn().mockReturnThis(),
    output: jest.fn().mockReturnThis(),
    size: jest.fn().mockReturnThis(),
    fps: jest.fn().mockReturnThis(),
    duration: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    run: jest.fn()
  })));

  console.log('🔧 External service mocks configured');
}

/**
 * Test utilities
 */
export const testUtils = {
  /**
   * Create a test user
   */
  createTestUser: async (overrides = {}) => {
    const defaultUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      role: 'editor' as const,
      isActive: true
    };

    return { ...defaultUser, ...overrides };
  },

  /**
   * Create test content item
   */
  createTestContent: async (overrides = {}) => {
    const defaultContent = {
      type: 'post' as const,
      status: 'draft' as const,
      title: 'Test Content',
      caption: 'This is test content for automated testing',
      hashtags: ['#test', '#automation'],
      mediaFiles: [],
      createdBy: 'test-user-id'
    };

    return { ...defaultContent, ...overrides };
  },

  /**
   * Create test scraped article
   */
  createTestArticle: async (overrides = {}) => {
    const defaultArticle = {
      title: 'Test Article',
      content: 'This is test article content for scraping tests',
      excerpt: 'Test excerpt',
      author: 'Test Author',
      publishedAt: new Date(),
      sourceUrl: 'https://example.com/test-article',
      category: 'Technology',
      tags: ['test', 'article'],
      scrapedAt: new Date()
    };

    return { ...defaultArticle, ...overrides };
  },

  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate random string
   */
  randomString: (length = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate test JWT token
   */
  generateTestToken: (): string => {
    return 'test-jwt-token-for-authentication-testing';
  },

  /**
   * Mock HTTP request
   */
  mockRequest: (overrides = {}) => {
    const defaultRequest = {
      method: 'GET',
      url: '/test',
      headers: {},
      body: {},
      params: {},
      query: {},
      user: null,
      ip: '127.0.0.1'
    };

    return { ...defaultRequest, ...overrides };
  },

  /**
   * Mock HTTP response
   */
  mockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },

  /**
   * Assert API response format
   */
  assertApiResponse: (response: any, expectedData?: any) => {
    expect(response).toHaveProperty('success');
    expect(typeof response.success).toBe('boolean');

    if (response.success) {
      if (expectedData !== undefined) {
        expect(response).toHaveProperty('data');
        expect(response.data).toEqual(expectedData);
      }
    } else {
      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('code');
      expect(response.error).toHaveProperty('message');
    }
  },

  /**
   * Assert pagination response format
   */
  assertPaginationResponse: (response: any) => {
    testUtils.assertApiResponse(response);
    expect(response).toHaveProperty('pagination');
    expect(response.pagination).toHaveProperty('page');
    expect(response.pagination).toHaveProperty('limit');
    expect(response.pagination).toHaveProperty('total');
    expect(response.pagination).toHaveProperty('totalPages');
    expect(response.pagination).toHaveProperty('hasNext');
    expect(response.pagination).toHaveProperty('hasPrev');
  }
};

/**
 * Custom Jest matchers
 */
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },

  toBeValidObjectId(received) {
    const pass = typeof received === 'string' && /^[0-9a-fA-F]{24}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      };
    }
  }
});

// Export test database connection
export { mongoServer, redisClient };

console.log('🧪 Test setup configuration loaded'); 