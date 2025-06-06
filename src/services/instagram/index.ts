/**
 * Instagram Service Hauptmodul
 * 
 * Zentraler Service für die Instagram-Integration, der die Authentifizierungs-,
 * Content- und Interaktions-Services koordiniert.
 * 
 * @version 1.0.0
 */

import { mainLogger } from '../../core/logger';
import { InstagramAuthService, InstagramCredentials } from './auth';
import { InstagramContentService } from './content';
import { InstagramInteractionService } from './interaction';

export class InstagramService {
  private authService: InstagramAuthService;
  private contentService: InstagramContentService;
  private interactionService: InstagramInteractionService;
  private isInitialized = false;

  constructor(credentials: InstagramCredentials) {
    this.authService = new InstagramAuthService(credentials);
    this.contentService = new InstagramContentService(credentials);
    this.interactionService = new InstagramInteractionService(credentials);
  }

  /**
   * Initialisiert den Instagram-Service
   */
  async initialize(): Promise<void> {
    mainLogger.info('📱 Instagram service initializing...');
    
    try {
      // Credentials aus dem Cache laden
      const credentialsLoaded = await this.authService.loadCredentials();
      
      // Wenn Credentials geladen wurden und gültig sind
      if (credentialsLoaded) {
        const credentials = this.authService.getCredentials();
        
        // Wenn das Token abgelaufen ist, aktualisieren
        if (credentials.expiresAt && new Date() >= credentials.expiresAt) {
          await this.authService.refreshAccessToken();
        }
        
        // Aktualisierte Credentials an die anderen Services weitergeben
        const updatedCredentials = this.authService.getCredentials();
        this.contentService.setCredentials(updatedCredentials);
        this.interactionService.setCredentials(updatedCredentials);
      }
      
      this.isInitialized = true;
      mainLogger.info('✅ Instagram service initialized');
    } catch (error) {
      mainLogger.error('❌ Failed to initialize Instagram service', { error });
      throw error;
    }
  }

  /**
   * Gibt den Auth-Service zurück
   */
  getAuthService(): InstagramAuthService {
    return this.authService;
  }

  /**
   * Gibt den Content-Service zurück
   */
  getContentService(): InstagramContentService {
    return this.contentService;
  }

  /**
   * Gibt den Interaction-Service zurück
   */
  getInteractionService(): InstagramInteractionService {
    return this.interactionService;
  }

  /**
   * Prüft, ob der Service gesund ist
   */
  async isHealthy(): Promise<boolean> {
    return this.isInitialized && this.authService.hasValidCredentials();
  }

  /**
   * Fährt den Service herunter
   */
  async shutdown(): Promise<void> {
    mainLogger.info('📱 Instagram service shutting down...');
    this.isInitialized = false;
    mainLogger.info('✅ Instagram service shutdown');
  }
}

// Export aller relevanten Typen und Klassen
export * from './auth';
export * from './content';
export * from './interaction';
