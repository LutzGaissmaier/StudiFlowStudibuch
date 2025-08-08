/**
 * StudiBuch Magazine Content Service
 * 
 * Handles scraping, parsing, and management of StudiBuch Magazine content
 * for adaptation into Instagram posts and other social media formats.
 * 
 * @version 1.0.0
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { mainLogger } from '../core/logger';

export interface MagazineArticle {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  url: string;
  content: {
    html: string;
    text: string;
    summary: string;
    wordCount: number;
  };
  images: {
    featured?: string;
    gallery: string[];
    alt: string[];
  };
  metadata: {
    readTime: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    studyArea: string;
    semester?: string;
  };
  socialMedia: {
    instagramAdaptable: boolean;
    suggestedFormats: ('post' | 'story' | 'reel' | 'carousel')[];
    hashtags: string[];
    keyQuotes: string[];
  };
  scraped: {
    at: Date;
    source: string;
    quality: 'high' | 'medium' | 'low';
  };
}

export interface ContentModificationOptions {
  targetFormat: 'instagram_post' | 'instagram_story' | 'instagram_reel' | 'instagram_carousel';
  maxLength: number;
  includeHashtags: boolean;
  includeCallToAction: boolean;
  tone: 'casual' | 'professional' | 'motivational' | 'educational';
  targetAudience: 'students' | 'professionals' | 'general';
}

export interface ModifiedContent {
  id: string;
  originalArticleId: string;
  format: ContentModificationOptions['targetFormat'];
  content: {
    text: string;
    images: string[];
    captions: string[];
  };
  metadata: {
    createdAt: Date;
    modifiedFrom: string;
    aiGenerated: boolean;
    approved: boolean;
  };
  instagram: {
    ready: boolean;
    scheduledFor?: Date;
    published?: Date;
    performance?: {
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    };
  };
}

/**
 * StudiBuch Magazine Service Class
 */
export class StudiBuchMagazineService {
  private baseUrl = 'https://studibuch.de/magazin';
  private cacheDir = path.join(process.cwd(), 'cache', 'magazine');
  private imageDir = path.join(process.cwd(), 'public', 'assets', 'images', 'magazine');
  private articles: Map<string, MagazineArticle> = new Map();
  private modifiedContent: Map<string, ModifiedContent> = new Map();

  constructor() {
    this.ensureCacheDirectory();
    this.ensureImageDirectory();
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    mainLogger.info('📰 Initializing StudiBuch Magazine Service...');
    
    try {
      await this.ensureCacheDirectory();
      await this.loadCachedArticles();
      
      // Add mock data for immediate functionality
      await this.createSampleImages();
      await this.createMockData();
      
      mainLogger.info(`📦 Loaded ${this.articles.size} cached articles and ${this.modifiedContent.size} modified content items`);
      mainLogger.info('✅ StudiBuch Magazine Service initialized successfully');
    } catch (error) {
      mainLogger.error('❌ Failed to initialize StudiBuch Magazine Service', { error });
      throw error;
    }
  }

  /**
   * Scrape latest articles from StudiBuch Magazine
   */
  async scrapeLatestArticles(limit: number = 20): Promise<MagazineArticle[]> {
    mainLogger.info(`🕷️ Scraping latest ${limit} articles from StudiBuch Magazine...`);
    
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Riona AI Content Bot 1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data) as cheerio.CheerioAPI;
      const articles: MagazineArticle[] = [];

      // Extract article links from main page
      const articleLinks = this.extractArticleLinks($);
      
      for (let i = 0; i < Math.min(articleLinks.length, limit); i++) {
        const link = articleLinks[i];
        try {
          const article = await this.scrapeArticleDetails(link);
          if (article) {
            articles.push(article);
            this.articles.set(article.id, article);
            await this.cacheArticle(article);
          }
        } catch (error) {
          mainLogger.warn(`Failed to scrape article: ${link}`, error);
        }
      }

      mainLogger.info(`✅ Successfully scraped ${articles.length} articles`);
      return articles;
    } catch (error) {
      mainLogger.error('❌ Failed to scrape StudiBuch Magazine', { error });
      throw error;
    }
  }

  /**
   * Extract article links from main page
   */
  private extractArticleLinks($: cheerio.CheerioAPI): string[] {
    const links: string[] = [];
    
    // Different selectors for StudiBuch magazine structure
    const selectors = [
      'article h2 a',
      '.post-title a',
      '.entry-title a',
      'h2.entry-title a',
      '.article-title a',
      '.post h2 a'
    ];

    selectors.forEach(selector => {
      $(selector).each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          if (!links.includes(fullUrl)) {
            links.push(fullUrl);
          }
        }
      });
    });

    return links;
  }

  /**
   * Scrape detailed article content
   */
  private async scrapeArticleDetails(url: string): Promise<MagazineArticle | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Riona AI Content Bot 1.0'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data) as cheerio.CheerioAPI;

      // Extract article data
      const title = this.extractTitle($);
      const subtitle = this.extractSubtitle($);
      const author = this.extractAuthor($);
      const publishedAt = this.extractPublishedDate($);
      const category = this.extractCategory($);
      const content = this.extractContent($);
      const articleId = this.generateArticleId(url);
      const images = await this.extractImages($, url, articleId);
      const tags = this.extractTags($);

      if (!title || !content.text) {
        mainLogger.warn(`Insufficient content for article: ${url}`);
        return null;
      }

      const article: MagazineArticle = {
        id: this.generateArticleId(url),
        title,
        subtitle,
        author,
        publishedAt,
        category,
        tags,
        url,
        content: {
          ...content,
          summary: this.generateSummary(content.text),
          wordCount: content.text.split(/\s+/).length
        },
        images,
        metadata: {
          readTime: Math.ceil(content.text.split(/\s+/).length / 200), // ~200 WPM
          difficulty: this.assessDifficulty(content.text),
          studyArea: this.extractStudyArea(title, content.text, category),
          semester: this.extractSemester(content.text)
        },
        socialMedia: {
          instagramAdaptable: this.assessInstagramAdaptability(content.text, images),
          suggestedFormats: this.suggestInstagramFormats(content.text, images),
          hashtags: this.generateHashtags(title, content.text, category),
          keyQuotes: this.extractKeyQuotes(content.text)
        },
        scraped: {
          at: new Date(),
          source: url,
          quality: this.assessContentQuality(content.text, images)
        }
      };

      return article;
    } catch (error) {
      mainLogger.error(`Failed to scrape article details: ${url}`, { error });
      return null;
    }
  }

  /**
   * Extract title from article page
   */
  private extractTitle($: cheerio.CheerioAPI): string {
    const selectors = [
      'h1.entry-title',
      'h1.post-title',
      'h1.article-title',
      '.entry-header h1',
      'article h1',
      'h1'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        return element.text().trim();
      }
    }

    return '';
  }

  /**
   * Extract content from article page
   */
  private extractContent($: cheerio.CheerioAPI): { html: string; text: string; summary: string; wordCount: number } {
    const selectors = [
      '.entry-content',
      '.post-content',
      '.article-content',
      '.content',
      'article .content',
      '.post-body'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        const html = element.html() || '';
        const text = element.text().trim();
        const summary = this.generateSummary(text);
        const wordCount = text.split(/\s+/).length;
        return { html, text, summary, wordCount };
      }
    }

    const summary = '';
    const wordCount = 0;
    return { html: '', text: '', summary, wordCount };
  }

  /**
   * Modify article content for Instagram format
   */
  async modifyContentForInstagram(
    articleId: string, 
    options: ContentModificationOptions
  ): Promise<ModifiedContent> {
    const article = this.articles.get(articleId);
    if (!article) {
      throw new Error(`Article not found: ${articleId}`);
    }

    mainLogger.info(`🔄 Modifying content for Instagram: ${article.title}`);

    const modifiedContent: ModifiedContent = {
      id: this.generateModifiedContentId(articleId, options.targetFormat),
      originalArticleId: articleId,
      format: options.targetFormat,
      content: await this.transformContent(article, options),
      metadata: {
        createdAt: new Date(),
        modifiedFrom: article.url,
        aiGenerated: true,
        approved: false
      },
      instagram: {
        ready: false
      }
    };

    this.modifiedContent.set(modifiedContent.id, modifiedContent);
    await this.cacheModifiedContent(modifiedContent);

    return modifiedContent;
  }

  /**
   * Transform article content based on Instagram format requirements
   */
  private async transformContent(
    article: MagazineArticle, 
    options: ContentModificationOptions
  ): Promise<{ text: string; images: string[]; captions: string[] }> {
    
    const baseText = article.content.text;
    const images = article.images.gallery.slice(0, 10); // Max 10 images for carousel
    
    let transformedText = '';
    const captions: string[] = [];

    switch (options.targetFormat) {
      case 'instagram_post':
        transformedText = await this.createInstagramPost(article, options);
        break;
        
      case 'instagram_story':
        transformedText = await this.createInstagramStory(article, options);
        break;
        
      case 'instagram_reel':
        transformedText = await this.createInstagramReel(article, options);
        break;
        
      case 'instagram_carousel':
        const carouselData = await this.createInstagramCarousel(article, options);
        transformedText = carouselData.mainText;
        captions.push(...carouselData.captions);
        break;
    }

    return {
      text: transformedText,
      images,
      captions
    };
  }

  /**
   * Create Instagram Post content
   */
  private async createInstagramPost(
    article: MagazineArticle, 
    options: ContentModificationOptions
  ): Promise<string> {
    const hook = this.createHook(article.title, options.tone);
    const body = this.summarizeForInstagram(article.content.text, options.maxLength - 100);
    const hashtags = options.includeHashtags ? article.socialMedia.hashtags.slice(0, 10).join(' ') : '';
    const cta = options.includeCallToAction ? this.generateCallToAction(options.targetAudience) : '';
    
    return `${hook}\n\n${body}\n\n${cta}\n\n${hashtags}`.trim();
  }

  /**
   * Get all articles
   */
  getAllArticles(): MagazineArticle[] {
    return Array.from(this.articles.values());
  }

  /**
   * Get all modified content
   */
  getAllModifiedContent(): ModifiedContent[] {
    return Array.from(this.modifiedContent.values());
  }

  /**
   * Get article by ID
   */
  getArticleById(id: string): MagazineArticle | undefined {
    return this.articles.get(id);
  }

  /**
   * Get modified content by ID
   */
  getModifiedContentById(id: string): ModifiedContent | undefined {
    return this.modifiedContent.get(id);
  }

  // Helper methods (simplified implementations)
  private generateArticleId(url: string): string {
    return Buffer.from(url).toString('base64').slice(0, 16);
  }

  private generateModifiedContentId(articleId: string, format: string): string {
    return `${articleId}_${format}_${Date.now()}`;
  }

  private extractAuthor($: cheerio.CheerioAPI): string {
    return $('.author').first().text().trim() || 'StudiBuch Team';
  }

  private extractPublishedDate($: cheerio.CheerioAPI): Date {
    const dateStr = $('.published, .date, time').first().attr('datetime') || $('.published, .date, time').first().text();
    return dateStr ? new Date(dateStr) : new Date();
  }

  private extractCategory($: cheerio.CheerioAPI): string {
    return $('.category, .tag').first().text().trim() || 'Studium';
  }

  private extractSubtitle($: cheerio.CheerioAPI): string | undefined {
    return $('.subtitle, .excerpt').first().text().trim() || undefined;
  }

  private async extractImages($: cheerio.CheerioAPI, baseUrl: string, articleId: string): Promise<MagazineArticle['images']> {
    const imageUrls: string[] = [];
    
    // Extract image URLs with better selectors
    $('img').each((_, img) => {
      const src = $(img).attr('src') || $(img).attr('data-src') || $(img).attr('data-lazy-src');
      if (src) {
        const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        if (!src.includes('icon') && !src.includes('logo') && !src.includes('avatar')) {
          imageUrls.push(fullUrl);
        }
      }
    });

    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && !imageUrls.includes(ogImage)) {
      imageUrls.unshift(ogImage); // Add as first image
    }

    return await this.downloadAndProcessImages(imageUrls, articleId);
  }

  private extractTags($: cheerio.CheerioAPI): string[] {
    const tags: string[] = [];
    $('.tag, .category, .keyword').each((_, element) => {
      const tag = $(element).text().trim();
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    });
    return tags;
  }

  private generateSummary(text: string): string {
    const sentences = text.split('.').slice(0, 3);
    return sentences.join('.') + '.';
  }

  private assessDifficulty(text: string): 'beginner' | 'intermediate' | 'advanced' {
    const wordCount = text.split(/\s+/).length;
    const complexWords = text.match(/\b\w{8,}\b/g)?.length || 0;
    const ratio = complexWords / wordCount;
    
    if (ratio < 0.1) return 'beginner';
    if (ratio < 0.2) return 'intermediate';
    return 'advanced';
  }

  private extractStudyArea(title: string, content: string, category: string): string {
    const areas = ['Informatik', 'BWL', 'Jura', 'Medizin', 'Ingenieurwesen', 'Geisteswissenschaften'];
    const text = `${title} ${content} ${category}`.toLowerCase();
    
    for (const area of areas) {
      if (text.includes(area.toLowerCase())) {
        return area;
      }
    }
    return 'Allgemein';
  }

  private extractSemester(content: string): string | undefined {
    const semesterMatch = content.match(/(\d+)\.\s*Semester/i);
    return semesterMatch ? semesterMatch[1] + '. Semester' : undefined;
  }

  private assessInstagramAdaptability(text: string, images: MagazineArticle['images']): boolean {
    return text.length > 100 && (!!images.featured || images.gallery.length > 0);
  }

  private suggestInstagramFormats(text: string, images: MagazineArticle['images']): ('post' | 'story' | 'reel' | 'carousel')[] {
    const formats: ('post' | 'story' | 'reel' | 'carousel')[] = ['post'];
    
    if (images.gallery.length > 1) formats.push('carousel');
    if (text.length < 500) formats.push('story');
    if (images.gallery.length > 0) formats.push('reel');
    
    return formats;
  }

  private generateHashtags(title: string, content: string, category: string): string[] {
    const base = ['#studibuch', '#studium', '#lernen', '#uni', '#student'];
    const text = `${title} ${content} ${category}`.toLowerCase();
    
    const keywords = [
      'klausur', 'prüfung', 'semester', 'bachelor', 'master', 'vorlesung', 
      'seminar', 'hausarbeit', 'thesis', 'praktikum', 'motivation'
    ];
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        base.push(`#${keyword}`);
      }
    });
    
    return base.slice(0, 15);
  }

  private extractKeyQuotes(text: string): string[] {
    const sentences = text.split('.').filter(s => s.length > 50 && s.length < 200);
    return sentences.slice(0, 3).map(s => s.trim() + '.');
  }

  private assessContentQuality(text: string, images: MagazineArticle['images']): 'high' | 'medium' | 'low' {
    const hasGoodLength = text.length > 300;
    const hasImages = images.featured || images.gallery.length > 0;
    const hasStructure = text.includes('\n') || text.split('.').length > 5;
    
    if (hasGoodLength && hasImages && hasStructure) return 'high';
    if (hasGoodLength && (hasImages || hasStructure)) return 'medium';
    return 'low';
  }

  private createHook(title: string, tone: string): string {
    const hooks = {
      casual: ['💡 Wusstest du schon?', '🤔 Kennst du das?', '✨ Hier ein Tipp:'],
      professional: ['📚 Wichtig für dein Studium:', '🎓 Studien-Tipp:', '📖 Wissen:'],
      motivational: ['💪 Du schaffst das!', '🚀 Erfolg im Studium:', '⭐ Motivation:'],
      educational: ['📝 Lerntipp:', '🧠 Wissen kompakt:', '📚 Studium-Hack:']
    };
    
    const toneHooks = hooks[tone as keyof typeof hooks] || hooks.educational;
    const randomHook = toneHooks[Math.floor(Math.random() * toneHooks.length)];
    return `${randomHook} ${title}`;
  }

  private summarizeForInstagram(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    const sentences = text.split('.');
    let summary = '';
    
    for (const sentence of sentences) {
      if ((summary + sentence).length > maxLength) break;
      summary += sentence + '.';
    }
    
    return summary.trim() || text.slice(0, maxLength) + '...';
  }

  private generateCallToAction(audience: string): string {
    const ctas = {
      students: ['💬 Wie sind eure Erfahrungen?', '📚 Teilt eure Tipps!', '🤝 Gemeinsam lernen wir besser!'],
      professionals: ['💼 Was sind eure Strategien?', '🎯 Teilt eure Expertise!', '📈 Diskutiert mit!'],
      general: ['💭 Was denkst du?', '🗨️ Schreibt uns eure Meinung!', '👥 Teilt eure Gedanken!']
    };
    
    const audienceCtas = ctas[audience as keyof typeof ctas] || ctas.general;
    return audienceCtas[Math.floor(Math.random() * audienceCtas.length)];
  }

  private async createInstagramStory(article: MagazineArticle, options: ContentModificationOptions): Promise<string> {
    const keyPoint = article.socialMedia.keyQuotes[0] || article.content.summary;
    return `📚 ${keyPoint}\n\n👆 Swipe up für mehr Infos!`;
  }

  private async createInstagramReel(article: MagazineArticle, options: ContentModificationOptions): Promise<string> {
    return `🎬 ${article.title}\n\n${article.content.summary.slice(0, 100)}...\n\n#reel #studium #lernen`;
  }

  private async createInstagramCarousel(
    article: MagazineArticle, 
    options: ContentModificationOptions
  ): Promise<{ mainText: string; captions: string[] }> {
    const mainText = `📖 ${article.title}\n\nSwipe für Details! 👉`;
    const captions = [
      article.content.summary,
      ...article.socialMedia.keyQuotes.slice(0, 4)
    ];
    
    return { mainText, captions };
  }

  private async ensureCacheDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      mainLogger.warn('Failed to create cache directory', error);
    }
  }

  /**
   * Download and process images from URLs
   */
  private async downloadAndProcessImages(imageUrls: string[], articleId: string): Promise<{ featured?: string; gallery: string[]; alt: string[] }> {
    const processedImages: string[] = [];
    const altTexts: string[] = [];
    
    await this.ensureImageDirectory();
    
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      try {
        const processedImagePath = await this.downloadAndProcessImage(imageUrl, articleId, i);
        if (processedImagePath) {
          processedImages.push(processedImagePath);
          altTexts.push(`Bild ${i + 1} aus StudiBuch Artikel`);
        }
      } catch (error) {
        mainLogger.warn(`Failed to download image: ${imageUrl}`, error);
      }
    }
    
    return {
      featured: processedImages[0],
      gallery: processedImages.slice(1),
      alt: altTexts
    };
  }

  /**
   * Download and process a single image
   */
  private async downloadAndProcessImage(imageUrl: string, articleId: string, index: number): Promise<string | null> {
    try {
      const urlHash = Buffer.from(imageUrl).toString('base64').slice(0, 8);
      const filename = `${articleId}_${index}_${urlHash}`;
      const originalPath = path.join(this.imageDir, `${filename}_original.jpg`);
      const thumbnailPath = path.join(this.imageDir, `${filename}_thumb.jpg`);
      const instagramPath = path.join(this.imageDir, `${filename}_instagram.jpg`);
      
      if (await this.fileExists(originalPath)) {
        return `/assets/images/magazine/${filename}_original.jpg`;
      }
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Riona AI Content Bot 1.0'
        }
      });
      
      const imageBuffer = Buffer.from(response.data);
      
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      
      await image
        .resize(1200, null, { withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(originalPath);
      
      // Create thumbnail (300x200)
      await image
        .resize(300, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      
      // Create Instagram optimized (1080x1080)
      await image
        .resize(1080, 1080, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(instagramPath);
      
      mainLogger.info(`✅ Processed image: ${filename} (${metadata.width}x${metadata.height})`);
      
      return `/assets/images/magazine/${filename}_original.jpg`;
    } catch (error) {
      mainLogger.error(`Failed to process image: ${imageUrl}`, error);
      return null;
    }
  }

  /**
   * Ensure image directory exists
   */
  private async ensureImageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.imageDir, { recursive: true });
    } catch (error) {
      mainLogger.warn('Failed to create image directory', error);
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async cacheArticle(article: MagazineArticle): Promise<void> {
    try {
      const filePath = path.join(this.cacheDir, `article_${article.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(article, null, 2));
    } catch (error) {
      mainLogger.warn(`Failed to cache article ${article.id}`, error);
    }
  }

  private async cacheModifiedContent(content: ModifiedContent): Promise<void> {
    try {
      const filePath = path.join(this.cacheDir, `modified_${content.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(content, null, 2));
    } catch (error) {
      mainLogger.warn(`Failed to cache modified content ${content.id}`, error);
    }
  }

  private async loadCachedArticles(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const articleFiles = files.filter(f => f.startsWith('article_') && f.endsWith('.json'));
      
      for (const file of articleFiles) {
        try {
          const filePath = path.join(this.cacheDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const article: MagazineArticle = JSON.parse(data);
          this.articles.set(article.id, article);
        } catch (error) {
          mainLogger.warn(`Failed to load cached article: ${file}`, error);
        }
      }

      const modifiedFiles = files.filter(f => f.startsWith('modified_') && f.endsWith('.json'));
      
      for (const file of modifiedFiles) {
        try {
          const filePath = path.join(this.cacheDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const modified: ModifiedContent = JSON.parse(data);
          this.modifiedContent.set(modified.id, modified);
        } catch (error) {
          mainLogger.warn(`Failed to load cached modified content: ${file}`, error);
        }
      }

      mainLogger.info(`📦 Loaded ${this.articles.size} cached articles and ${this.modifiedContent.size} modified content items`);
    } catch (error) {
      mainLogger.warn('Failed to load cached content', error);
    }
  }

  /**
   * Create mock data for immediate functionality
   */
  private async createMockData(): Promise<void> {
    const mockArticles: MagazineArticle[] = [
      {
        id: 'mock-article-1',
        title: 'Erfolgreich durchs Studium: 10 bewährte Lerntipps',
        subtitle: 'Mit diesen Strategien meisterst du jede Klausurphase',
        author: 'StudiBuch Redaktion',
        publishedAt: new Date(Date.now() - 86400000), // 1 day ago
        category: 'Lerntipps',
        tags: ['studium', 'lernen', 'klausuren', 'tipps', 'erfolg'],
        url: 'https://studibuch.de/lerntipps-studium-erfolg',
        content: {
          html: '<h2>10 bewährte Lerntipps</h2><p>Das Studium kann herausfordernd sein...</p>',
          text: '1. Erstelle einen Lernplan\n2. Nutze aktive Lernmethoden\n3. Finde deinen optimalen Lernort...',
          summary: 'Zehn bewährte Strategien für erfolgreiches Lernen im Studium',
          wordCount: 850
        },
        images: {
          featured: '/assets/images/magazine/mock-article-1_0_sample.jpg',
          gallery: [],
          alt: ['Studierende beim Lernen']
        },
        metadata: {
          readTime: 4,
          difficulty: 'beginner',
          studyArea: 'Allgemein',
          semester: undefined
        },
        socialMedia: {
          instagramAdaptable: true,
          suggestedFormats: ['post', 'carousel'],
          hashtags: ['#studibuch', '#lerntipps', '#studium', '#erfolg', '#klausuren'],
          keyQuotes: ['Der Schlüssel zum Erfolg liegt in der richtigen Planung']
        },
        scraped: {
          at: new Date(),
          source: 'StudiBuch Magazine',
          quality: 'high'
        }
      },
      {
        id: 'mock-article-2',
        title: 'Work-Life-Balance im Studium: Wie du alles unter einen Hut bekommst',
        subtitle: 'Studium, Job und Freizeit erfolgreich vereinbaren',
        author: 'StudiBuch Redaktion',
        publishedAt: new Date(Date.now() - 172800000), // 2 days ago
        category: 'Lifestyle',
        tags: ['work-life-balance', 'studium', 'zeitmanagement', 'stress'],
        url: 'https://studibuch.de/work-life-balance-studium',
        content: {
          html: '<h2>Balance finden</h2><p>Studium, Nebenjob und Freizeit...</p>',
          text: 'Die richtige Balance zwischen Studium, Arbeit und Freizeit zu finden ist essentiell...',
          summary: 'Praktische Tipps für eine gesunde Work-Life-Balance während des Studiums',
          wordCount: 720
        },
        images: {
          featured: '/assets/images/magazine/mock-article-2_0_sample.jpg',
          gallery: [],
          alt: ['Work-Life-Balance Illustration']
        },
        metadata: {
          readTime: 3,
          difficulty: 'intermediate',
          studyArea: 'Allgemein',
          semester: undefined
        },
        socialMedia: {
          instagramAdaptable: true,
          suggestedFormats: ['post', 'story'],
          hashtags: ['#studibuch', '#worklifebalance', '#studium', '#zeitmanagement'],
          keyQuotes: ['Balance ist der Schlüssel zu einem erfolgreichen Studium']
        },
        scraped: {
          at: new Date(),
          source: 'StudiBuch Magazine',
          quality: 'high'
        }
      },
      {
        id: 'mock-article-3',
        title: 'Motivation in der Klausurphase: Durchhalten bis zum Erfolg',
        subtitle: 'Wie du auch in stressigen Zeiten motiviert bleibst',
        author: 'StudiBuch Redaktion',
        publishedAt: new Date(Date.now() - 259200000), // 3 days ago
        category: 'Motivation',
        tags: ['motivation', 'klausurphase', 'durchhalten', 'mental health'],
        url: 'https://studibuch.de/motivation-klausurphase',
        content: {
          html: '<h2>Motiviert bleiben</h2><p>Die Klausurphase ist oft die härteste Zeit...</p>',
          text: 'Motivation ist in der Klausurphase besonders wichtig. Diese Strategien helfen...',
          summary: 'Strategien um in stressigen Klausurphasen motiviert zu bleiben',
          wordCount: 650
        },
        images: {
          featured: '/assets/images/magazine/mock-article-3_0_sample.jpg',
          gallery: [],
          alt: ['Motivations-Tipps Grafik']
        },
        metadata: {
          readTime: 3,
          difficulty: 'beginner',
          studyArea: 'Allgemein',
          semester: undefined
        },
        socialMedia: {
          instagramAdaptable: true,
          suggestedFormats: ['post', 'story', 'reel'],
          hashtags: ['#studibuch', '#motivation', '#klausurphase', '#durchhalten', '#mentalhealth'],
          keyQuotes: ['Jeder kleine Schritt bringt dich deinem Ziel näher']
        },
        scraped: {
          at: new Date(),
          source: 'StudiBuch Magazine',
          quality: 'high'
        }
      }
    ];

    // Add mock articles to the collection
    mockArticles.forEach(article => {
      this.articles.set(article.id, article);
    });

    // Create some modified content examples
    const mockModifiedContent: ModifiedContent[] = [
      {
        id: 'modified-1',
        originalArticleId: 'mock-article-1',
        format: 'instagram_post',
        content: {
          text: '💡 Erfolgreich durchs Studium? Diese 10 Lerntipps bringen dich ans Ziel! 🎯\n\n✅ Erstelle einen realistischen Lernplan\n✅ Nutze aktive Lernmethoden\n✅ Finde deinen perfekten Lernort\n✅ Plane regelmäßige Pausen\n✅ Bilde Lerngruppen\n\nWelcher Tipp hilft dir am meisten? 💬\n\n#studibuch #lerntipps #studium #erfolg #klausuren #uni #student #motivation',
          images: [],
          captions: []
        },
        metadata: {
          createdAt: new Date(),
          modifiedFrom: 'https://studibuch.de/lerntipps-studium-erfolg',
          aiGenerated: true,
          approved: false
        },
        instagram: {
          ready: false,
          scheduledFor: undefined,
          published: undefined,
          performance: undefined
        }
      },
      {
        id: 'modified-2',
        originalArticleId: 'mock-article-2',
        format: 'instagram_story',
        content: {
          text: '📚 Work-Life-Balance im Studium\n\nStudium + Job + Freizeit = Stress? 😰\n\nNicht mit den richtigen Strategien! 💪\n\n👆 Swipe up für alle Tipps!',
          images: [],
          captions: []
        },
        metadata: {
          createdAt: new Date(),
          modifiedFrom: 'https://studibuch.de/work-life-balance-studium',
          aiGenerated: true,
          approved: true
        },
        instagram: {
          ready: true,
          scheduledFor: new Date(Date.now() + 3600000), // 1 hour from now
          published: undefined,
          performance: undefined
        }
      }
    ];

    // Add mock modified content
    mockModifiedContent.forEach(content => {
      this.modifiedContent.set(content.id, content);
    });

    mainLogger.info(`📝 Created ${mockArticles.length} mock articles and ${mockModifiedContent.length} mock modified content items`);
  }

  /**
   * Create sample images for testing
   */
  private async createSampleImages(): Promise<void> {
    try {
      await this.ensureImageDirectory();
      
      const sampleImages = [
        { name: 'mock-article-1_0_sample.jpg', color: '#667eea', text: 'Lerntipps' },
        { name: 'mock-article-2_0_sample.jpg', color: '#764ba2', text: 'Balance' },
        { name: 'mock-article-3_0_sample.jpg', color: '#10b981', text: 'Motivation' }
      ];
      
      for (const sample of sampleImages) {
        const imagePath = path.join(this.imageDir, sample.name);
        
        if (!(await this.fileExists(imagePath))) {
          const svg = `
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
              <rect width="800" height="600" fill="${sample.color}"/>
              <text x="400" y="300" font-family="Arial, sans-serif" font-size="48" 
                    fill="white" text-anchor="middle" dominant-baseline="middle">
                ${sample.text}
              </text>
            </svg>
          `;
          
          await sharp(Buffer.from(svg))
            .jpeg({ quality: 85 })
            .toFile(imagePath);
            
          mainLogger.info(`✅ Created sample image: ${sample.name}`);
        }
      }
    } catch (error) {
      mainLogger.warn('Failed to create sample images', error);
    }
  }
}                                                                  