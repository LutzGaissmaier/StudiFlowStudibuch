/**
 * Creatomate Client Service
 * 
 * Implementiert die Integration mit der Creatomate API für die
 * automatische Generierung von Reels und Videos.
 * 
 * @version 1.0.0
 */

import axios from 'axios';
import { mainLogger } from '../../core/logger';

export interface CreatomateCredentials {
  apiKey: string;
}

export interface CreatomateTemplate {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  previewUrl?: string;
  thumbnailUrl?: string;
}

export interface CreatomateVideoOptions {
  templateId: string;
  modifications: Record<string, any>;
  outputFormat?: 'mp4' | 'gif' | 'webm';
  width?: number;
  height?: number;
  fps?: number;
  quality?: number;
}

export interface CreatomateVideoResult {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  duration: number;
  format: string;
  size: number;
}

export class CreatomateClient {
  private apiKey: string;
  private baseUrl = 'https://api.creatomate.com/v1';
  private isInitialized = false;

  constructor(credentials: CreatomateCredentials) {
    this.apiKey = credentials.apiKey;
  }

  /**
   * Initialisiert den Creatomate-Client
   */
  async initialize(): Promise<void> {
    mainLogger.info('🎬 Initializing Creatomate client...');
    
    try {
      // Teste die API-Verbindung
      await this.getTemplates(1);
      
      this.isInitialized = true;
      mainLogger.info('✅ Creatomate client initialized successfully');
    } catch (error) {
      mainLogger.error('❌ Failed to initialize Creatomate client', { error });
      throw error;
    }
  }

  /**
   * Ruft verfügbare Templates ab
   */
  async getTemplates(limit: number = 10): Promise<CreatomateTemplate[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/templates`, {
        params: {
          limit
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        tags: template.tags,
        previewUrl: template.preview_url,
        thumbnailUrl: template.thumbnail_url
      }));
    } catch (error) {
      mainLogger.error('❌ Failed to get templates', { error });
      throw error;
    }
  }

  /**
   * Ruft ein Template anhand seiner ID ab
   */
  async getTemplate(templateId: string): Promise<CreatomateTemplate> {
    try {
      const response = await axios.get(`${this.baseUrl}/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const template = response.data;
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        tags: template.tags,
        previewUrl: template.preview_url,
        thumbnailUrl: template.thumbnail_url
      };
    } catch (error) {
      mainLogger.error(`❌ Failed to get template: ${templateId}`, { error });
      throw error;
    }
  }

  /**
   * Generiert ein Video basierend auf einem Template
   */
  async generateVideo(options: CreatomateVideoOptions): Promise<CreatomateVideoResult> {
    try {
      const {
        templateId,
        modifications,
        outputFormat = 'mp4',
        width,
        height,
        fps,
        quality
      } = options;
      
      const requestData: any = {
        template_id: templateId,
        modifications
      };
      
      // Füge optionale Parameter hinzu
      if (outputFormat) requestData.output_format = outputFormat;
      if (width) requestData.width = width;
      if (height) requestData.height = height;
      if (fps) requestData.fps = fps;
      if (quality) requestData.quality = quality;
      
      const response = await axios.post(`${this.baseUrl}/renders`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = response.data;
      return {
        id: result.id,
        url: result.url,
        thumbnailUrl: result.thumbnail_url,
        width: result.width,
        height: result.height,
        duration: result.duration,
        format: result.format,
        size: result.size
      };
    } catch (error) {
      mainLogger.error('❌ Failed to generate video', { error });
      throw error;
    }
  }

  /**
   * Prüft den Status eines Render-Jobs
   */
  async checkRenderStatus(renderId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/renders/${renderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      mainLogger.error(`❌ Failed to check render status: ${renderId}`, { error });
      throw error;
    }
  }

  /**
   * Prüft, ob der Client gesund ist
   */
  isHealthy(): boolean {
    return this.isInitialized;
  }
}
