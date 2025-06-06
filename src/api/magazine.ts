/**
 * StudiBuch Magazine API Routes
 * 
 * Provides endpoints for magazine content management, modification,
 * and Instagram adaptation workflow.
 * 
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';
import { StudiBuchMagazineService, ContentModificationOptions } from '../services/studibuch-magazine';
import { mainLogger } from '../core/logger';

export function createMagazineRoutes(magazineService: StudiBuchMagazineService): Router {
  const router = Router();

  mainLogger.info('📰 Setting up StudiBuch Magazine API routes...');

  /**
   * GET /api/magazine/articles
   * Get all scraped magazine articles
   */
  router.get('/articles', async (req: Request, res: Response) => {
    try {
      const articles = magazineService.getAllArticles();
      
      res.json({
        success: true,
        data: articles,
        meta: {
          total: articles.length,
          scraped: articles.filter(a => a.scraped.quality === 'high').length,
          instagramReady: articles.filter(a => a.socialMedia.instagramAdaptable).length
        }
      });
    } catch (error) {
      mainLogger.error('Failed to get articles', { error });
      res.status(500).json({
        success: false,
        error: {
          code: 'ARTICLES_FETCH_FAILED',
          message: 'Failed to retrieve articles'
        }
      });
    }
  });

  /**
   * GET /api/magazine/articles/:id
   * Get specific article by ID
   */
  router.get('/articles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const article = magazineService.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ARTICLE_NOT_FOUND',
            message: 'Article not found'
          }
        });
      }

      return res.json({
        success: true,
        data: article
      });
    } catch (error) {
      mainLogger.error('Failed to get article', { error });
      return res.status(500).json({
        success: false,
        error: {
          code: 'ARTICLE_FETCH_FAILED',
          message: 'Failed to retrieve article'
        }
      });
    }
  });

  /**
   * POST /api/magazine/scrape
   * Trigger magazine scraping
   */
  router.post('/scrape', async (req: Request, res: Response) => {
    try {
      const { limit = 20 } = req.body;
      
      mainLogger.info(`Starting magazine scrape with limit: ${limit}`);
      
      const articles = await magazineService.scrapeLatestArticles(limit);
      
      res.json({
        success: true,
        data: {
          scraped: articles.length,
          articles: articles.map(a => ({
            id: a.id,
            title: a.title,
            category: a.category,
            instagramAdaptable: a.socialMedia.instagramAdaptable,
            quality: a.scraped.quality
          }))
        },
        meta: {
          timestamp: new Date().toISOString(),
          source: 'StudiBuch Magazine'
        }
      });
    } catch (error) {
      mainLogger.error('Magazine scraping failed', { error });
      res.status(500).json({
        success: false,
        error: {
          code: 'SCRAPING_FAILED',
          message: 'Failed to scrape magazine content'
        }
      });
    }
  });

  /**
   * POST /api/magazine/articles/:id/modify
   * Modify article for Instagram format
   */
  router.post('/articles/:id/modify', async (req, res) => {
    try {
      const { id } = req.params;
      const options: ContentModificationOptions = {
        targetFormat: req.body.targetFormat || 'instagram_post',
        maxLength: req.body.maxLength || 2000,
        includeHashtags: req.body.includeHashtags !== false,
        includeCallToAction: req.body.includeCallToAction !== false,
        tone: req.body.tone || 'educational',
        targetAudience: req.body.targetAudience || 'students'
      };

      const modifiedContent = await magazineService.modifyContentForInstagram(id, options);
      
      return res.json({
        success: true,
        data: modifiedContent,
        meta: {
          originalArticle: id,
          format: options.targetFormat,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      mainLogger.error('Content modification failed', { error });
      
      if ((error as Error).message.includes('Article not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ARTICLE_NOT_FOUND',
            message: 'Article not found for modification'
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: 'MODIFICATION_FAILED',
          message: 'Failed to modify content for Instagram'
        }
      });
    }
  });

  /**
   * GET /api/magazine/modified
   * Get all modified content
   */
  router.get('/modified', async (req: Request, res: Response) => {
    try {
      const modifiedContent = magazineService.getAllModifiedContent();
      
      // Filter by format if provided
      const { format, approved } = req.query;
      let filteredContent = modifiedContent;

      if (format && typeof format === 'string') {
        filteredContent = filteredContent.filter(c => c.format === format);
      }

      if (approved !== undefined) {
        const isApproved = approved === 'true';
        filteredContent = filteredContent.filter(c => c.metadata.approved === isApproved);
      }

      res.json({
        success: true,
        data: filteredContent,
        meta: {
          total: modifiedContent.length,
          filtered: filteredContent.length,
          ready: filteredContent.filter(c => c.instagram.ready).length,
          published: filteredContent.filter(c => c.instagram.published).length
        }
      });
    } catch (error) {
      mainLogger.error('Failed to get modified content', { error });
      res.status(500).json({
        success: false,
        error: {
          code: 'MODIFIED_CONTENT_FETCH_FAILED',
          message: 'Failed to retrieve modified content'
        }
      });
    }
  });

  /**
   * GET /api/magazine/modified/:id
   * Get specific modified content
   */
  router.get('/modified/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const modifiedContent = magazineService.getModifiedContentById(id);
      
      if (!modifiedContent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MODIFIED_CONTENT_NOT_FOUND',
            message: 'Modified content not found'
          }
        });
      }

      return res.json({
        success: true,
        data: modifiedContent
      });
    } catch (error) {
      mainLogger.error('Failed to get modified content', { error });
      return res.status(500).json({
        success: false,
        error: {
          code: 'MODIFIED_CONTENT_FETCH_FAILED',
          message: 'Failed to retrieve modified content'
        }
      });
    }
  });

  /**
   * PUT /api/magazine/modified/:id/approve
   * Approve modified content for publishing
   */
  router.put('/modified/:id/approve', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const modifiedContent = magazineService.getModifiedContentById(id);
      
      if (!modifiedContent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MODIFIED_CONTENT_NOT_FOUND',
            message: 'Modified content not found'
          }
        });
      }

      // Update approval status
      modifiedContent.metadata.approved = true;
      modifiedContent.instagram.ready = true;

      return res.json({
        success: true,
        data: modifiedContent,
        meta: {
          action: 'approved',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      mainLogger.error('Failed to approve content', { error });
      return res.status(500).json({
        success: false,
        error: {
          code: 'APPROVAL_FAILED',
          message: 'Failed to approve content'
        }
      });
    }
  });

  /**
   * POST /api/magazine/modified/:id/schedule
   * Schedule approved content for Instagram posting
   */
  router.post('/modified/:id/schedule', async (req, res) => {
    try {
      const { id } = req.params;
      const { scheduledFor } = req.body;
      
      const modifiedContent = magazineService.getModifiedContentById(id);
      
      if (!modifiedContent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MODIFIED_CONTENT_NOT_FOUND',
            message: 'Modified content not found'
          }
        });
      }

      if (!modifiedContent.metadata.approved) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CONTENT_NOT_APPROVED',
            message: 'Content must be approved before scheduling'
          }
        });
      }

      // Schedule content
      modifiedContent.instagram.scheduledFor = scheduledFor ? new Date(scheduledFor) : new Date(Date.now() + 3600000); // Default: 1 hour from now

      return res.json({
        success: true,
        data: modifiedContent,
        meta: {
          action: 'scheduled',
          scheduledFor: modifiedContent.instagram.scheduledFor,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      mainLogger.error('Failed to schedule content', { error });
      return res.status(500).json({
        success: false,
        error: {
          code: 'SCHEDULING_FAILED',
          message: 'Failed to schedule content'
        }
      });
    }
  });

  /**
   * GET /api/magazine/analytics
   * Get magazine content analytics
   */
  router.get('/analytics', async (req: Request, res: Response) => {
    try {
      const articles = magazineService.getAllArticles();
      const modifiedContent = magazineService.getAllModifiedContent();

      const analytics = {
        articles: {
          total: articles.length,
          byCategory: articles.reduce((acc, article) => {
            acc[article.category] = (acc[article.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byStudyArea: articles.reduce((acc, article) => {
            acc[article.metadata.studyArea] = (acc[article.metadata.studyArea] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          instagramAdaptable: articles.filter(a => a.socialMedia.instagramAdaptable).length,
          avgReadTime: Math.round(articles.reduce((sum, a) => sum + a.metadata.readTime, 0) / articles.length),
          avgWordCount: Math.round(articles.reduce((sum, a) => sum + a.content.wordCount, 0) / articles.length)
        },
        modifications: {
          total: modifiedContent.length,
          byFormat: modifiedContent.reduce((acc, content) => {
            acc[content.format] = (acc[content.format] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          approved: modifiedContent.filter(c => c.metadata.approved).length,
          scheduled: modifiedContent.filter(c => c.instagram.scheduledFor).length,
          published: modifiedContent.filter(c => c.instagram.published).length
        },
        performance: {
          totalLikes: modifiedContent.reduce((sum, c) => sum + (c.instagram.performance?.likes || 0), 0),
          totalComments: modifiedContent.reduce((sum, c) => sum + (c.instagram.performance?.comments || 0), 0),
          totalShares: modifiedContent.reduce((sum, c) => sum + (c.instagram.performance?.shares || 0), 0),
          avgEngagement: 0 // Calculate based on performance data
        }
      };

      res.json({
        success: true,
        data: analytics,
        meta: {
          generatedAt: new Date().toISOString(),
          period: 'all-time'
        }
      });
    } catch (error) {
      mainLogger.error('Failed to generate analytics', { error });
      res.status(500).json({
        success: false,
        error: {
          code: 'ANALYTICS_FAILED',
          message: 'Failed to generate analytics'
        }
      });
    }
  });

  /**
   * GET /api/magazine/status
   * Get magazine service status
   */
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const articles = magazineService.getAllArticles();
      const modifiedContent = magazineService.getAllModifiedContent();
      
      res.json({
        success: true,
        data: {
          service: 'StudiBuch Magazine Service',
          status: 'operational',
          lastUpdate: new Date().toISOString(),
          statistics: {
            articlesCount: articles.length,
            modifiedCount: modifiedContent.length,
            readyForPublishing: modifiedContent.filter(c => c.instagram.ready).length,
            publishedCount: modifiedContent.filter(c => c.instagram.published).length
          },
          capabilities: [
            'Magazine Content Scraping',
            'Content Analysis & Parsing',
            'Instagram Format Adaptation',
            'Multi-format Support (Post, Story, Reel, Carousel)',
            'Content Approval Workflow',
            'Publishing Scheduler',
            'Performance Analytics'
          ]
        }
      });
    } catch (error) {
      mainLogger.error('Failed to get magazine status', { error });
      res.status(500).json({
        success: false,
        error: {
          code: 'STATUS_CHECK_FAILED',
          message: 'Failed to check magazine service status'
        }
      });
    }
  });

  mainLogger.info('✅ StudiBuch Magazine API routes configured');
  
  return router;
} 