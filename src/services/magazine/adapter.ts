/**
 * Magazin-Adapter Service
 * 
 * Implementiert die Anpassung von Magazin-Artikeln für verschiedene
 * Social-Media-Formate und Content-Typen.
 * 
 * @version 1.0.0
 */

import { mainLogger } from '../../core/logger';
import { MagazineArticle } from './parser';

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

export class MagazineAdapter {
  /**
   * Passt einen Artikel für Instagram an
   */
  async adaptForInstagram(
    article: MagazineArticle, 
    options: ContentModificationOptions
  ): Promise<ModifiedContent> {
    mainLogger.info(`🔄 Adapting article for Instagram: ${article.title}`);
    
    try {
      let transformedText = '';
      const images = [article.images.featured, ...article.images.gallery].filter(Boolean) as string[];
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
      
      const modifiedContent: ModifiedContent = {
        id: this.generateModifiedContentId(article.id, options.targetFormat),
        originalArticleId: article.id,
        format: options.targetFormat,
        content: {
          text: transformedText,
          images: images.slice(0, 10), // Max 10 images
          captions
        },
        metadata: {
          createdAt: new Date(),
          modifiedFrom: article.url,
          aiGenerated: true,
          approved: false
        },
        instagram: {
          ready: true
        }
      };
      
      mainLogger.info(`✅ Successfully adapted article for Instagram: ${article.title}`);
      return modifiedContent;
    } catch (error) {
      mainLogger.error(`❌ Failed to adapt article for Instagram: ${article.title}`, { error });
      throw error;
    }
  }

  /**
   * Erstellt einen Instagram-Post
   */
  private async createInstagramPost(
    article: MagazineArticle, 
    options: ContentModificationOptions
  ): Promise<string> {
    const hook = this.createHook(article.title, options.tone);
    const body = this.summarizeForInstagram(article.content.text, options.maxLength - 200);
    const hashtags = options.includeHashtags ? article.socialMedia.hashtags.slice(0, 10).join(' ') : '';
    const cta = options.includeCallToAction ? this.generateCallToAction(options.targetAudience) : '';
    
    return `${hook}\n\n${body}\n\n${cta}\n\n${hashtags}`.trim();
  }

  /**
   * Erstellt eine Instagram-Story
   */
  private async createInstagramStory(
    article: MagazineArticle, 
    options: ContentModificationOptions
  ): Promise<string> {
    const title = article.title.length > 50 ? article.title.substring(0, 47) + '...' : article.title;
    const keyPoints = this.extractKeyPoints(article.content.text, 3);
    const hashtags = options.includeHashtags ? article.socialMedia.hashtags.slice(0, 5).join(' ') : '';
    
    return `📚 ${title}\n\n${keyPoints.join('\n\n')}\n\n${hashtags}`.trim();
  }

  /**
   * Erstellt ein Instagram-Reel
   */
  private async createInstagramReel(
    article: MagazineArticle, 
    options: ContentModificationOptions
  ): Promise<string> {
    const hook = this.createHook(article.title, 'motivational');
    const keyQuote = article.socialMedia.keyQuotes.length > 0 
      ? article.socialMedia.keyQuotes[0] 
      : this.summarizeForInstagram(article.content.text, 100);
    const hashtags = options.includeHashtags ? article.socialMedia.hashtags.slice(0, 8).join(' ') : '';
    const cta = options.includeCallToAction ? this.generateCallToAction(options.targetAudience) : '';
    
    return `${hook}\n\n"${keyQuote}"\n\n${cta}\n\n${hashtags}`.trim();
  }

  /**
   * Erstellt ein Instagram-Carousel
   */
  private async createInstagramCarousel(
    article: MagazineArticle, 
    options: ContentModificationOptions
  ): Promise<{ mainText: string; captions: string[] }> {
    const hook = this.createHook(article.title, options.tone);
    const intro = this.summarizeForInstagram(article.content.text, 150);
    const hashtags = options.includeHashtags ? article.socialMedia.hashtags.slice(0, 10).join(' ') : '';
    const cta = options.includeCallToAction ? this.generateCallToAction(options.targetAudience) : '';
    
    const mainText = `${hook}\n\n${intro}\n\nSwipe ➡️ to learn more!\n\n${cta}\n\n${hashtags}`.trim();
    
    // Erstelle Bildunterschriften für jedes Bild im Carousel
    const keyPoints = this.extractKeyPoints(article.content.text, 5);
    const captions = keyPoints.map((point, index) => {
      return `${index + 1}/${keyPoints.length + 1}: ${point}`;
    });
    
    // Füge die Zusammenfassung als letzte Bildunterschrift hinzu
    captions.push(`${keyPoints.length + 1}/${keyPoints.length + 1}: ${this.generateCallToAction(options.targetAudience)}`);
    
    return { mainText, captions };
  }

  /**
   * Erstellt einen Hook basierend auf dem Titel und Ton
   */
  private createHook(title: string, tone: ContentModificationOptions['tone']): string {
    switch (tone) {
      case 'casual':
        return `Hey! 👋 Kennst du schon "${title}"? Hier erfährst du mehr!`;
      case 'professional':
        return `📚 Fachlicher Einblick: "${title}" - Wichtige Erkenntnisse für Studierende`;
      case 'motivational':
        return `💪 Durchstarten mit "${title}" - Diese Tipps bringen dich weiter!`;
      case 'educational':
        return `📝 Lernstoff: "${title}" - Das Wichtigste zusammengefasst`;
      default:
        return `📚 "${title}" - Jetzt auf StudiBuch`;
    }
  }

  /**
   * Fasst den Text für Instagram zusammen
   */
  private summarizeForInstagram(text: string, maxLength: number): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = '';
    
    for (const sentence of sentences) {
      const potentialSummary = summary + (summary ? ' ' : '') + sentence.trim() + '.';
      if (potentialSummary.length <= maxLength) {
        summary = potentialSummary;
      } else {
        break;
      }
    }
    
    return summary;
  }

  /**
   * Extrahiert Schlüsselpunkte aus dem Text
   */
  private extractKeyPoints(text: string, count: number): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints: string[] = [];
    
    // Suche nach Sätzen mit Schlüsselwörtern
    const keywordSentences = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return lower.includes('wichtig') || 
             lower.includes('beachten') || 
             lower.includes('merken') || 
             lower.includes('tipp') ||
             lower.includes('fazit');
    });
    
    // Wenn genügend Sätze mit Schlüsselwörtern gefunden wurden
    if (keywordSentences.length >= count) {
      return keywordSentences.slice(0, count).map(s => s.trim() + '.');
    }
    
    // Andernfalls füge die wichtigsten Sätze hinzu
    const remainingCount = count - keywordSentences.length;
    keyPoints.push(...keywordSentences.map(s => s.trim() + '.'));
    
    // Füge die längsten Sätze hinzu (als Heuristik für Wichtigkeit)
    const sortedByLength = [...sentences]
      .filter(s => !keywordSentences.includes(s))
      .sort((a, b) => b.length - a.length);
    
    keyPoints.push(...sortedByLength.slice(0, remainingCount).map(s => s.trim() + '.'));
    
    return keyPoints;
  }

  /**
   * Generiert einen Call-to-Action basierend auf der Zielgruppe
   */
  private generateCallToAction(targetAudience: ContentModificationOptions['targetAudience']): string {
    switch (targetAudience) {
      case 'students':
        return '📚 Mehr Tipps und Infos für dein Studium findest du auf studibuch.de!';
      case 'professionals':
        return '💼 Entdecke weitere Fachbeiträge und Expertenwissen auf studibuch.de!';
      case 'general':
        return '🔍 Weitere spannende Artikel findest du auf studibuch.de!';
      default:
        return '👉 Besuche studibuch.de für mehr Informationen!';
    }
  }

  /**
   * Generiert eine eindeutige ID für modifizierten Content
   */
  private generateModifiedContentId(articleId: string, format: string): string {
    return `${articleId}_${format}_${Date.now()}`;
  }
}
