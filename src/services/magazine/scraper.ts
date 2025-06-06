/**
 * Magazin-Scraper Service
 * 
 * Implementiert die Scraping-Funktionalität für StudiBuch Magazin-Artikel
 * mit robusten Mechanismen für Fehlerbehandlung und Caching.
 * 
 * @version 1.0.0
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import path from 'path';
import { mainLogger } from '../../core/logger';

export interface ScrapingOptions {
  categories?: string[];
  limit?: number;
  includeImages?: boolean;
  includeTags?: boolean;
  maxRetries?: number;
  cacheResults?: boolean;
}

export interface ArticleLink {
  url: string;
  title: string;
  category?: string;
  publishedAt?: Date;
}

export class MagazineScraper {
  private baseUrl = 'https://studibuch.de/magazin';
  private cacheDir: string;
  private userAgent = 'StudiFlow AI Content Bot 1.0';

  constructor(cacheDir?: string) {
    this.cacheDir = cacheDir || path.join(process.cwd(), 'cache', 'magazine');
    this.ensureCacheDirectory();
  }

  /**
   * Stellt sicher, dass das Cache-Verzeichnis existiert
   */
  private async ensureCacheDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      mainLogger.error('Failed to create cache directory', { error });
      throw error;
    }
  }

  /**
   * Scrapt die neuesten Artikel vom StudiBuch Magazin
   */
  async scrapeLatestArticles(options: ScrapingOptions = {}): Promise<ArticleLink[]> {
    const {
      categories = [],
      limit = 20,
      maxRetries = 3
    } = options;

    mainLogger.info(`🕷️ Scraping latest ${limit} articles from StudiBuch Magazine...`);
    
    try {
      let retries = 0;
      let success = false;
      let response;
      
      // Wiederholungsversuche bei Fehlern
      while (!success && retries < maxRetries) {
        try {
          response = await axios.get(this.baseUrl, {
            headers: {
              'User-Agent': this.userAgent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 10000
          });
          success = true;
        } catch (error) {
          retries++;
          mainLogger.warn(`Retry ${retries}/${maxRetries} for scraping main page`, { error });
          
          if (retries >= maxRetries) {
            throw error;
          }
          
          // Exponentielles Backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      }

      if (!response) {
        throw new Error('Failed to fetch magazine page after retries');
      }

      const $ = cheerio.load(response.data);
      
      // Extrahiere Artikel-Links
      const articleLinks = this.extractArticleLinks($);
      
      // Filtere nach Kategorien, falls angegeben
      const filteredLinks = categories.length > 0
        ? articleLinks.filter(link => {
            if (!link.category) return false;
            return categories.some(category => 
              link.category?.toLowerCase().includes(category.toLowerCase())
            );
          })
        : articleLinks;
      
      // Begrenze die Anzahl der Links
      const limitedLinks = filteredLinks.slice(0, limit);
      
      mainLogger.info(`✅ Successfully scraped ${limitedLinks.length} article links`);
      return limitedLinks;
    } catch (error) {
      mainLogger.error('❌ Failed to scrape StudiBuch Magazine', { error });
      throw error;
    }
  }

  /**
   * Extrahiert Artikel-Links von der Hauptseite
   */
  private extractArticleLinks($: cheerio.CheerioAPI): ArticleLink[] {
    const links: ArticleLink[] = [];
    
    // Verschiedene Selektoren für die StudiBuch Magazin-Struktur
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
        const title = $(element).text().trim();
        
        if (href && title) {
          const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          
          // Versuche, die Kategorie zu extrahieren
          let category: string | undefined;
          const categoryElement = $(element).closest('article').find('.category, .tag').first();
          if (categoryElement.length) {
            category = categoryElement.text().trim();
          }
          
          // Versuche, das Veröffentlichungsdatum zu extrahieren
          let publishedAt: Date | undefined;
          const dateElement = $(element).closest('article').find('.published, .date, time').first();
          if (dateElement.length) {
            const dateStr = dateElement.attr('datetime') || dateElement.text().trim();
            if (dateStr) {
              publishedAt = new Date(dateStr);
            }
          }
          
          if (!links.some(link => link.url === fullUrl)) {
            links.push({
              url: fullUrl,
              title,
              category,
              publishedAt
            });
          }
        }
      });
    });

    return links;
  }

  /**
   * Generiert eine eindeutige ID für einen Artikel basierend auf der URL
   */
  generateArticleId(url: string): string {
    return Buffer.from(url).toString('base64').slice(0, 16);
  }
}
