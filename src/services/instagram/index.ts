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
import { InstagramAutomationService, InstagramAutomationCredentials } from './automation';
import { AIAgentService } from '../ai/agent';

export class InstagramService {
  private authService: InstagramAuthService;
  private contentService: InstagramContentService;
  private interactionService: InstagramInteractionService;
  private automationService: InstagramAutomationService | null = null;
  private aiAgent: AIAgentService | null = null;
  private isInitialized = false;

  constructor(credentials: InstagramCredentials, automationCredentials?: InstagramAutomationCredentials, geminiApiKeys?: string[]) {
    this.authService = new InstagramAuthService(credentials);
    this.contentService = new InstagramContentService(credentials);
    this.interactionService = new InstagramInteractionService(credentials);
    
    if (geminiApiKeys && geminiApiKeys.length > 0) {
      this.aiAgent = new AIAgentService(geminiApiKeys);
      
      if (automationCredentials) {
        this.automationService = new InstagramAutomationService(credentials, automationCredentials, this.aiAgent);
      }
    }
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
      
      if (this.automationService) {
        await this.automationService.initialize();
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
   * Gibt den Automation-Service zurück
   */
  getAutomationService(): InstagramAutomationService | null {
    return this.automationService;
  }

  /**
   * Gibt den AI-Agent-Service zurück
   */
  getAIAgentService(): AIAgentService | null {
    return this.aiAgent;
  }

  /**
   * Prüft, ob der Service gesund ist
   */
  async isHealthy(): Promise<boolean> {
    const baseHealthy = this.isInitialized && this.authService.hasValidCredentials();
    const automationHealthy = this.automationService ? this.automationService.isHealthy() : true;
    return baseHealthy && automationHealthy;
  }

  /**
   * Fährt den Service herunter
   */
  async shutdown(): Promise<void> {
    mainLogger.info('📱 Instagram service shutting down...');
    
    if (this.automationService) {
      await this.automationService.shutdown();
    }
    
    this.isInitialized = false;
    mainLogger.info('✅ Instagram service shutdown');
  }
}

// Export aller relevanten Typen und Klassen
export * from './auth';
export * from './content';
export * from './interaction';
export * from './automation';
