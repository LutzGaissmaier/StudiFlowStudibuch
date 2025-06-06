/**
 * Creatomate Generator Service
 * 
 * Implementiert die Generierung von Reels und Videos mit Creatomate
 * basierend auf Magazin-Artikeln und Content-Vorlagen.
 * 
 * @version 1.0.0
 */

import { mainLogger } from '../../core/logger';
import { MagazineArticle } from '../magazine/parser';
import { ModifiedContent } from '../magazine/adapter';
import { CreatomateClient, CreatomateVideoOptions, CreatomateVideoResult } from './client';

export interface ReelTemplate {
  id: string;
  name: string;
  description: string;
  type: 'quote' | 'slideshow' | 'text_overlay' | 'animated_text' | 'custom';
  suitableFor: string[];
  previewUrl?: string;
}

export interface ReelGenerationOptions {
  templateId: string;
  duration?: number;
  includeAudio?: boolean;
  audioTrackUrl?: string;
  includeText?: boolean;
  includeImages?: boolean;
  outputFormat?: 'mp4' | 'gif' | 'webm';
  resolution?: '1080p' | '720p' | '480p';
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
}

export interface GeneratedReel {
  id: string;
  contentId: string;
  articleId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  size: number;
  templateId: string;
  createdAt: Date;
}

export class CreatomateGenerator {
  private client: CreatomateClient;
  private templates: ReelTemplate[] = [
    {
      id: 'quote-template',
      name: 'Zitat-Reel',
      description: 'Ein animiertes Reel mit einem Zitat aus dem Artikel',
      type: 'quote',
      suitableFor: ['motivational', 'educational'],
      previewUrl: 'https://example.com/previews/quote-template.mp4'
    },
    {
      id: 'slideshow-template',
      name: 'Bildergalerie',
      description: 'Ein Slideshow-Reel mit Bildern aus dem Artikel',
      type: 'slideshow',
      suitableFor: ['visual', 'gallery'],
      previewUrl: 'https://example.com/previews/slideshow-template.mp4'
    },
    {
      id: 'text-overlay-template',
      name: 'Text-Overlay',
      description: 'Ein Reel mit Text-Overlays auf Bildern',
      type: 'text_overlay',
      suitableFor: ['informational', 'educational'],
      previewUrl: 'https://example.com/previews/text-overlay-template.mp4'
    },
    {
      id: 'animated-text-template',
      name: 'Animierter Text',
      description: 'Ein Reel mit animiertem Text und Übergängen',
      type: 'animated_text',
      suitableFor: ['promotional', 'announcement'],
      previewUrl: 'https://example.com/previews/animated-text-template.mp4'
    }
  ];

  constructor(client: CreatomateClient) {
    this.client = client;
  }

  /**
   * Generiert ein Reel basierend auf einem Artikel
   */
  async generateReelFromArticle(
    article: MagazineArticle,
    options: ReelGenerationOptions
  ): Promise<GeneratedReel> {
    mainLogger.info(`🎬 Generating reel for article: ${article.title}`);
    
    try {
      // Wähle das Template
      const templateId = options.templateId || this.suggestTemplateForArticle(article);
      
      // Bereite die Modifikationen basierend auf dem Artikel vor
      const modifications = this.prepareModificationsFromArticle(article, options);
      
      // Bestimme die Auflösung basierend auf den Optionen
      const { width, height } = this.getResolutionDimensions(options.resolution || '1080p', options.aspectRatio || '9:16');
      
      // Generiere das Video
      const videoOptions: CreatomateVideoOptions = {
        templateId,
        modifications,
        outputFormat: options.outputFormat || 'mp4',
        width,
        height,
        quality: 90
      };
      
      const result = await this.client.generateVideo(videoOptions);
      
      // Erstelle das Reel-Objekt
      const generatedReel: GeneratedReel = {
        id: result.id,
        contentId: `reel_${Date.now()}`,
        articleId: article.id,
        videoUrl: result.url,
        thumbnailUrl: result.thumbnailUrl,
        duration: result.duration,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.size,
        templateId,
        createdAt: new Date()
      };
      
      mainLogger.info(`✅ Successfully generated reel for article: ${article.title}`);
      return generatedReel;
    } catch (error) {
      mainLogger.error(`❌ Failed to generate reel for article: ${article.title}`, { error });
      throw error;
    }
  }

  /**
   * Generiert ein Reel basierend auf modifiziertem Content
   */
  async generateReelFromContent(
    content: ModifiedContent,
    options: ReelGenerationOptions
  ): Promise<GeneratedReel> {
    mainLogger.info(`🎬 Generating reel for content ID: ${content.id}`);
    
    try {
      // Wähle das Template
      const templateId = options.templateId || this.suggestTemplateForContent(content);
      
      // Bereite die Modifikationen basierend auf dem Content vor
      const modifications = this.prepareModificationsFromContent(content, options);
      
      // Bestimme die Auflösung basierend auf den Optionen
      const { width, height } = this.getResolutionDimensions(options.resolution || '1080p', options.aspectRatio || '9:16');
      
      // Generiere das Video
      const videoOptions: CreatomateVideoOptions = {
        templateId,
        modifications,
        outputFormat: options.outputFormat || 'mp4',
        width,
        height,
        quality: 90
      };
      
      const result = await this.client.generateVideo(videoOptions);
      
      // Erstelle das Reel-Objekt
      const generatedReel: GeneratedReel = {
        id: result.id,
        contentId: content.id,
        articleId: content.originalArticleId,
        videoUrl: result.url,
        thumbnailUrl: result.thumbnailUrl,
        duration: result.duration,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.size,
        templateId,
        createdAt: new Date()
      };
      
      mainLogger.info(`✅ Successfully generated reel for content ID: ${content.id}`);
      return generatedReel;
    } catch (error) {
      mainLogger.error(`❌ Failed to generate reel for content ID: ${content.id}`, { error });
      throw error;
    }
  }

  /**
   * Schlägt ein Template für einen Artikel vor
   */
  suggestTemplateForArticle(article: MagazineArticle): string {
    // Prüfe, ob der Artikel Zitate enthält
    if (article.socialMedia.keyQuotes.length > 0) {
      return 'quote-template';
    }
    
    // Prüfe, ob der Artikel viele Bilder enthält
    if (article.images.gallery.length > 2) {
      return 'slideshow-template';
    }
    
    // Prüfe den Inhalt des Artikels
    if (article.content.text.length > 1000) {
      return 'text-overlay-template';
    }
    
    // Standardmäßig animierten Text verwenden
    return 'animated-text-template';
  }

  /**
   * Schlägt ein Template für modifizierten Content vor
   */
  suggestTemplateForContent(content: ModifiedContent): string {
    // Prüfe, ob der Content viele Bilder enthält
    if (content.content.images.length > 2) {
      return 'slideshow-template';
    }
    
    // Prüfe den Inhalt des Contents
    if (content.content.text.length > 500) {
      return 'text-overlay-template';
    }
    
    // Standardmäßig animierten Text verwenden
    return 'animated-text-template';
  }

  /**
   * Bereitet Modifikationen für einen Artikel vor
   */
  private prepareModificationsFromArticle(
    article: MagazineArticle,
    options: ReelGenerationOptions
  ): Record<string, any> {
    const modifications: Record<string, any> = {
      title: article.title,
      subtitle: article.subtitle || '',
      author: article.author,
      category: article.category
    };
    
    // Füge Text hinzu, wenn gewünscht
    if (options.includeText !== false) {
      // Extrahiere Schlüsselzitate oder erstelle eine Zusammenfassung
      if (article.socialMedia.keyQuotes.length > 0) {
        modifications.quotes = article.socialMedia.keyQuotes.slice(0, 3);
        modifications.mainQuote = article.socialMedia.keyQuotes[0];
      } else {
        modifications.summary = article.content.summary;
      }
      
      // Füge Hashtags hinzu
      modifications.hashtags = article.socialMedia.hashtags.join(' ');
    }
    
    // Füge Bilder hinzu, wenn gewünscht
    if (options.includeImages !== false) {
      modifications.images = [];
      
      // Füge das Hauptbild hinzu, falls vorhanden
      if (article.images.featured) {
        modifications.images.push(article.images.featured);
        modifications.featuredImage = article.images.featured;
      }
      
      // Füge Galeriebilder hinzu
      if (article.images.gallery.length > 0) {
        modifications.images.push(...article.images.gallery);
      }
    }
    
    // Füge Audio hinzu, wenn gewünscht
    if (options.includeAudio && options.audioTrackUrl) {
      modifications.audioTrack = options.audioTrackUrl;
    }
    
    // Füge Dauer hinzu, wenn angegeben
    if (options.duration) {
      modifications.duration = options.duration;
    }
    
    // Füge StudiBuch-Branding hinzu
    modifications.logo = 'https://studibuch.de/wp-content/uploads/2022/01/favicon.png';
    modifications.brandName = 'StudiBuch';
    modifications.brandColor = '#a4c63a';
    
    return modifications;
  }

  /**
   * Bereitet Modifikationen für modifizierten Content vor
   */
  private prepareModificationsFromContent(
    content: ModifiedContent,
    options: ReelGenerationOptions
  ): Record<string, any> {
    const modifications: Record<string, any> = {
      title: content.content.text.split('\n')[0] || 'StudiBuch Content',
      subtitle: ''
    };
    
    // Extrahiere Text aus dem Content
    if (options.includeText !== false) {
      // Teile den Text in Zeilen auf
      const lines = content.content.text.split('\n').filter(line => line.trim().length > 0);
      
      if (lines.length > 1) {
        modifications.title = lines[0];
        modifications.subtitle = lines[1];
        
        // Extrahiere Haupttext
        if (lines.length > 2) {
          modifications.mainText = lines.slice(2).join('\n');
        }
      } else {
        modifications.mainText = content.content.text;
      }
      
      // Extrahiere Hashtags
      const hashtagRegex = /#[\w\u00C0-\u00FF]+/g;
      const hashtags = content.content.text.match(hashtagRegex) || [];
      modifications.hashtags = hashtags.join(' ');
    }
    
    // Füge Bilder hinzu, wenn gewünscht
    if (options.includeImages !== false && content.content.images.length > 0) {
      modifications.images = content.content.images;
      modifications.featuredImage = content.content.images[0];
    }
    
    // Füge Bildunterschriften hinzu, falls vorhanden
    if (content.content.captions.length > 0) {
      modifications.captions = content.content.captions;
    }
    
    // Füge Audio hinzu, wenn gewünscht
    if (options.includeAudio && options.audioTrackUrl) {
      modifications.audioTrack = options.audioTrackUrl;
    }
    
    // Füge Dauer hinzu, wenn angegeben
    if (options.duration) {
      modifications.duration = options.duration;
    }
    
    // Füge StudiBuch-Branding hinzu
    modifications.logo = 'https://studibuch.de/wp-content/uploads/2022/01/favicon.png';
    modifications.brandName = 'StudiBuch';
    modifications.brandColor = '#a4c63a';
    
    return modifications;
  }

  /**
   * Bestimmt die Dimensionen basierend auf Auflösung und Seitenverhältnis
   */
  private getResolutionDimensions(
    resolution: '1080p' | '720p' | '480p',
    aspectRatio: '9:16' | '16:9' | '1:1' | '4:5'
  ): { width: number; height: number } {
    // Bestimme die Höhe basierend auf der Auflösung
    let height: number;
    switch (resolution) {
      case '1080p':
        height = 1920;
        break;
      case '720p':
        height = 1280;
        break;
      case '480p':
        height = 854;
        break;
      default:
        height = 1920; // Default: 1080p
    }
    
    // Bestimme das Seitenverhältnis
    let ratio: number;
    switch (aspectRatio) {
      case '9:16':
        ratio = 9 / 16;
        break;
      case '16:9':
        ratio = 16 / 9;
        break;
      case '1:1':
        ratio = 1;
        break;
      case '4:5':
        ratio = 4 / 5;
        break;
      default:
        ratio = 9 / 16; // Default: 9:16 (Instagram Reels)
    }
    
    // Berechne die Breite basierend auf dem Seitenverhältnis
    const width = Math.round(height * ratio);
    
    // Für 9:16 und 16:9 müssen wir die Werte tauschen
    if (aspectRatio === '9:16') {
      return { width, height };
    } else if (aspectRatio === '16:9') {
      return { width: height, height: width };
    } else {
      return { width, height };
    }
  }

  /**
   * Gibt alle verfügbaren Templates zurück
   */
  getAvailableTemplates(): ReelTemplate[] {
    return this.templates;
  }

  /**
   * Fügt ein benutzerdefiniertes Template hinzu
   */
  addCustomTemplate(template: ReelTemplate): void {
    this.templates.push(template);
  }
}
