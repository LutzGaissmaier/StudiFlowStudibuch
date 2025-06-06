/**
 * Magazin-Parser Service
 * 
 * Implementiert die Parsing-Funktionalität für StudiBuch Magazin-Artikel
 * zur Extraktion von Inhalten, Bildern und Metadaten.
 * 
 * @version 1.0.0
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { mainLogger } from '../../core/logger';
import { ArticleLink } from './scraper';

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

export interface ParsingOptions {
  extractImages?: boolean;
  extractTags?: boolean;
  generateSocialMediaData?: boolean;
  maxRetries?: number;
}

export class MagazineParser {
  private userAgent = 'StudiFlow AI Content Bot 1.0';

  /**
   * Parst einen Artikel von einer URL
   */
  async parseArticle(articleLink: ArticleLink, options: ParsingOptions = {}): Promise<MagazineArticle | null> {
    const {
      extractImages = true,
      extractTags = true,
      generateSocialMediaData = true,
      maxRetries = 3
    } = options;

    try {
      let retries = 0;
      let success = false;
      let response;
      
      // Wiederholungsversuche bei Fehlern
      while (!success && retries < maxRetries) {
        try {
          response = await axios.get(articleLink.url, {
            headers: {
              'User-Agent': this.userAgent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 15000
          });
          success = true;
        } catch (error) {
          retries++;
          mainLogger.warn(`Retry ${retries}/${maxRetries} for parsing article: ${articleLink.url}`, { error });
          
          if (retries >= maxRetries) {
            throw error;
          }
          
          // Exponentielles Backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      }

      if (!response) {
        throw new Error('Failed to fetch article after retries');
      }

      const $ = cheerio.load(response.data);

      // Extrahiere Artikel-Daten
      const title = this.extractTitle($) || articleLink.title;
      const subtitle = this.extractSubtitle($);
      const author = this.extractAuthor($);
      const publishedAt = articleLink.publishedAt || this.extractPublishedDate($);
      const category = articleLink.category || this.extractCategory($);
      const content = this.extractContent($);
      const images = extractImages ? this.extractImages($, articleLink.url) : { gallery: [], alt: [] };
      const tags = extractTags ? this.extractTags($) : [];

      if (!title || !content.text) {
        mainLogger.warn(`Insufficient content for article: ${articleLink.url}`);
        return null;
      }

      const article: MagazineArticle = {
        id: this.generateArticleId(articleLink.url),
        title,
        subtitle,
        author,
        publishedAt,
        category,
        tags,
        url: articleLink.url,
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
        socialMedia: generateSocialMediaData ? {
          instagramAdaptable: this.assessInstagramAdaptability(content.text, images),
          suggestedFormats: this.suggestInstagramFormats(content.text, images),
          hashtags: this.generateHashtags(title, content.text, category),
          keyQuotes: this.extractKeyQuotes(content.text)
        } : {
          instagramAdaptable: false,
          suggestedFormats: ['post'],
          hashtags: [],
          keyQuotes: []
        },
        scraped: {
          at: new Date(),
          source: articleLink.url,
          quality: this.assessContentQuality(content.text, images)
        }
      };

      return article;
    } catch (error) {
      mainLogger.error(`Failed to parse article: ${articleLink.url}`, { error });
      return null;
    }
  }

  /**
   * Extrahiert den Titel aus der Artikel-Seite
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
   * Extrahiert den Untertitel aus der Artikel-Seite
   */
  private extractSubtitle($: cheerio.CheerioAPI): string | undefined {
    const selectors = [
      '.subtitle',
      '.excerpt',
      '.entry-subtitle',
      '.post-subtitle',
      'h2.subtitle'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        return element.text().trim();
      }
    }

    return undefined;
  }

  /**
   * Extrahiert den Autor aus der Artikel-Seite
   */
  private extractAuthor($: cheerio.CheerioAPI): string {
    const selectors = [
      '.author',
      '.byline',
      '.entry-author',
      '.post-author',
      'meta[name="author"]'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        if (selector === 'meta[name="author"]') {
          return element.attr('content') || 'StudiBuch Team';
        }
        return element.text().trim();
      }
    }

    return 'StudiBuch Team';
  }

  /**
   * Extrahiert das Veröffentlichungsdatum aus der Artikel-Seite
   */
  private extractPublishedDate($: cheerio.CheerioAPI): Date {
    const selectors = [
      '.published',
      '.date',
      'time',
      '.entry-date',
      '.post-date',
      'meta[property="article:published_time"]'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        if (selector === 'meta[property="article:published_time"]') {
          const content = element.attr('content');
          if (content) {
            return new Date(content);
          }
        } else {
          const datetime = element.attr('datetime');
          if (datetime) {
            return new Date(datetime);
          }
          const text = element.text().trim();
          if (text) {
            const date = new Date(text);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }
      }
    }

    return new Date();
  }

  /**
   * Extrahiert die Kategorie aus der Artikel-Seite
   */
  private extractCategory($: cheerio.CheerioAPI): string {
    const selectors = [
      '.category',
      '.tag',
      '.entry-category',
      '.post-category',
      'meta[property="article:section"]'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        if (selector === 'meta[property="article:section"]') {
          return element.attr('content') || 'Studium';
        }
        return element.text().trim();
      }
    }

    return 'Studium';
  }

  /**
   * Extrahiert den Inhalt aus der Artikel-Seite
   */
  private extractContent($: cheerio.CheerioAPI): { html: string; text: string } {
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
        return { html, text };
      }
    }

    return { html: '', text: '' };
  }

  /**
   * Extrahiert Bilder aus der Artikel-Seite
   */
  private extractImages($: cheerio.CheerioAPI, baseUrl: string): MagazineArticle['images'] {
    const images: string[] = [];
    const alt: string[] = [];
    
    $('img').each((_, img) => {
      const src = $(img).attr('src');
      const altText = $(img).attr('alt') || '';
      
      if (src) {
        const fullUrl = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        images.push(fullUrl);
        alt.push(altText);
      }
    });

    return {
      featured: images.length > 0 ? images[0] : undefined,
      gallery: images.slice(1),
      alt
    };
  }

  /**
   * Extrahiert Tags aus der Artikel-Seite
   */
  private extractTags($: cheerio.CheerioAPI): string[] {
    const tags: string[] = [];
    
    $('.tag, .category, .keyword, .tags a, .categories a').each((_, element) => {
      const tag = $(element).text().trim();
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    });
    
    return tags;
  }

  /**
   * Generiert eine Zusammenfassung aus dem Text
   */
  private generateSummary(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join('. ');
    return summary.length > 0 ? summary + '.' : '';
  }

  /**
   * Bewertet die Schwierigkeit des Textes
   */
  private assessDifficulty(text: string): 'beginner' | 'intermediate' | 'advanced' {
    const wordCount = text.split(/\s+/).length;
    const complexWords = text.match(/\b\w{8,}\b/g)?.length || 0;
    const ratio = complexWords / wordCount;
    
    if (ratio < 0.1) return 'beginner';
    if (ratio < 0.2) return 'intermediate';
    return 'advanced';
  }

  /**
   * Extrahiert den Studienbereich aus dem Text
   */
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

  /**
   * Extrahiert das Semester aus dem Text
   */
  private extractSemester(content: string): string | undefined {
    const semesterMatch = content.match(/(\d+)\.\s*Semester/i);
    return semesterMatch ? semesterMatch[1] + '. Semester' : undefined;
  }

  /**
   * Bewertet die Instagram-Adaptierbarkeit des Artikels
   */
  private assessInstagramAdaptability(text: string, images: MagazineArticle['images']): boolean {
    return text.length > 100 && (!!images.featured || images.gallery.length > 0);
  }

  /**
   * Schlägt Instagram-Formate für den Artikel vor
   */
  private suggestInstagramFormats(text: string, images: MagazineArticle['images']): ('post' | 'story' | 'reel' | 'carousel')[] {
    const formats: ('post' | 'story' | 'reel' | 'carousel')[] = ['post'];
    
    if (images.gallery.length > 1) formats.push('carousel');
    if (text.length < 500) formats.push('story');
    if (images.gallery.length > 0) formats.push('reel');
    
    return formats;
  }

  /**
   * Generiert Hashtags für den Artikel
   */
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

  /**
   * Extrahiert Schlüsselzitate aus dem Text
   */
  private extractKeyQuotes(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const quotes: string[] = [];
    
    // Suche nach Zitaten mit Anführungszeichen
    const quotedRegex = /"([^"]+)"|„([^"]+)"|»([^«]+)«|'([^']+)'/g;
    let match;
    while ((match = quotedRegex.exec(text)) !== null) {
      const quote = match[1] || match[2] || match[3] || match[4];
      if (quote && quote.length > 20 && quote.length < 200) {
        quotes.push(quote);
      }
    }
    
    // Wenn keine Zitate gefunden wurden, verwende wichtige Sätze
    if (quotes.length === 0) {
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (
          trimmed.length > 40 && 
          trimmed.length < 200 && 
          (trimmed.includes('wichtig') || 
           trimmed.includes('beachten') || 
           trimmed.includes('merken') || 
           trimmed.includes('Tipp'))
        ) {
          quotes.push(trimmed);
        }
      });
    }
    
    // Wenn immer noch keine Zitate gefunden wurden, verwende die längsten Sätze
    if (quotes.length === 0) {
      const sortedSentences = [...sentences].sort((a, b) => b.length - a.length);
      quotes.push(...sortedSentences.slice(0, 3).map(s => s.trim()));
    }
    
    return quotes.slice(0, 5);
  }

  /**
   * Bewertet die Qualität des Inhalts
   */
  private assessContentQuality(text: string, images: MagazineArticle['images']): 'high' | 'medium' | 'low' {
    const wordCount = text.split(/\s+/).length;
    const hasImages = !!images.featured || images.gallery.length > 0;
    
    if (wordCount > 800 && hasImages) return 'high';
    if (wordCount > 400 || hasImages) return 'medium';
    return 'low';
  }

  /**
   * Generiert eine eindeutige ID für einen Artikel basierend auf der URL
   */
  private generateArticleId(url: string): string {
    return Buffer.from(url).toString('base64').slice(0, 16);
  }
}
