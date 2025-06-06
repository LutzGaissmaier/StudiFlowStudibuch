/**
 * Creatomate Index Service
 * 
 * Hauptmodul für die Creatomate-Integration, das den Client und Generator koordiniert.
 * 
 * @version 1.0.0
 */

import { mainLogger } from '../../core/logger';
import { CreatomateClient, CreatomateCredentials } from './client';
import { CreatomateGenerator, ReelTemplate, ReelGenerationOptions, GeneratedReel } from './generator';
import { MagazineArticle } from '../magazine/parser';
import { ModifiedContent } from '../magazine/adapter';

export class CreatomateService {
  private client: CreatomateClient;
  private generator: CreatomateGenerator;
  private isInitialized = false;

  constructor(credentials: CreatomateCredentials) {
    this.client = new CreatomateClient(credentials);
    this.generator = new CreatomateGenerator(this.client);
  }

  /**
   * Initialisiert den Creatomate-Service
   */
  async initialize(): Promise<void> {
    mainLogger.info('🎬 Initializing Creatomate service...');
    
    try {
      await this.client.initialize();
      this.isInitialized = true;
      mainLogger.info('✅ Creatomate service initialized successfully');
    } catch (error) {
      mainLogger.error('❌ Failed to initialize Creatomate service', { error });
      throw error;
    }
  }

  /**
   * Generiert ein Reel basierend auf einem Artikel
   */
  async generateReelFromArticle(
    article: MagazineArticle,
    options: ReelGenerationOptions
  ): Promise<GeneratedReel> {
    this.ensureInitialized();
    return this.generator.generateReelFromArticle(article, options);
  }

  /**
   * Generiert ein Reel basierend auf modifiziertem Content
   */
  async generateReelFromContent(
    content: ModifiedContent,
    options: ReelGenerationOptions
  ): Promise<GeneratedReel> {
    this.ensureInitialized();
    return this.generator.generateReelFromContent(content, options);
  }

  /**
   * Gibt alle verfügbaren Templates zurück
   */
  getAvailableTemplates(): ReelTemplate[] {
    return this.generator.getAvailableTemplates();
  }

  /**
   * Fügt ein benutzerdefiniertes Template hinzu
   */
  addCustomTemplate(template: ReelTemplate): void {
    this.generator.addCustomTemplate(template);
  }

  /**
   * Prüft, ob der Service gesund ist
   */
  isHealthy(): boolean {
    return this.isInitialized && this.client.isHealthy();
  }

  /**
   * Stellt sicher, dass der Service initialisiert ist
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Creatomate service is not initialized');
    }
  }

  /**
   * Fährt den Service herunter
   */
  async shutdown(): Promise<void> {
    mainLogger.info('🎬 Creatomate service shutting down...');
    this.isInitialized = false;
    mainLogger.info('✅ Creatomate service shutdown');
  }
}

// Export aller relevanten Typen und Klassen
export * from './client';
export * from './generator';
