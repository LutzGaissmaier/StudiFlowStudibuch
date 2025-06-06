# Anpassung der Module für das StudiFlow AI Enterprise System

## Übersicht

Dieses Dokument beschreibt die Anpassung und Integration der Module aus der Mini-Version in das bestehende StudiFlow AI Enterprise System. Ziel ist es, ein einheitliches System ohne Redundanzen zu schaffen.

## Instagram-API-Integration

### Bestehende Implementierung (Mini-Version)

```typescript
/**
 * Instagram API Integration für StudiFlow AI Enterprise
 * 
 * Implementiert die vollständige Integration mit der Instagram Graph API
 * für Authentifizierung, Content-Veröffentlichung und Interaktionen.
 */

import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Typdefinitionen
export interface InstagramCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface InstagramAccountInfo {
  id: string;
  username: string;
  name: string;
  biography: string;
  followers: number;
  following: number;
  mediaCount: number;
  profilePicture: string;
}

export interface InstagramPostOptions {
  caption: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  hashtags?: string[];
  userTags?: { username: string; x: number; y: number }[];
  childrenMediaUrls?: string[];
}

export interface InstagramReelOptions {
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  shareToFeed?: boolean;
  hashtags?: string[];
  audioName?: string;
}

// Hauptklasse für Instagram-Integration
export class InstagramService {
  private credentials: InstagramCredentials;
  private baseUrl = 'https://graph.instagram.com';
  private apiVersion = 'v18.0';
  private cacheDir: string;
  private isInitialized = false;
  private logger: any; // In der realen Implementierung durch Logger-Interface ersetzen

  constructor(credentials: InstagramCredentials, cacheDir?: string, logger?: any) {
    this.credentials = credentials;
    this.cacheDir = cacheDir || path.join(process.cwd(), 'cache', 'instagram');
    this.logger = logger || console;
    this.ensureCacheDirectory();
  }

  /**
   * Initialisiert den Instagram-Service
   */
  async initialize(): Promise<void> {
    this.logger.info('📱 Instagram service initializing...');
    
    try {
      await this.ensureCacheDirectory();
      
      // Überprüfen und aktualisieren des Access Tokens, falls notwendig
      if (this.credentials.accessToken && this.credentials.expiresAt) {
        const now = new Date();
        if (now >= this.credentials.expiresAt) {
          await this.refreshAccessToken();
        }
      }
      
      this.isInitialized = true;
      this.logger.info('✅ Instagram service initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Instagram service', { error });
      throw error;
    }
  }

  /**
   * Stellt sicher, dass das Cache-Verzeichnis existiert
   */
  private async ensureCacheDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create cache directory', { error });
      throw error;
    }
  }

  /**
   * Generiert die Authentifizierungs-URL für OAuth
   */
  generateAuthUrl(scopes: string[] = ['user_profile', 'user_media']): string {
    const scopeString = scopes.join(',');
    const state = uuidv4();
    
    return `https://api.instagram.com/oauth/authorize?client_id=${this.credentials.clientId}&redirect_uri=${encodeURIComponent(this.credentials.redirectUri)}&scope=${scopeString}&response_type=code&state=${state}`;
  }

  /**
   * Tauscht den Autorisierungscode gegen ein Access Token
   */
  async exchangeCodeForToken(code: string): Promise<void> {
    try {
      const response = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.credentials.redirectUri,
        code
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      this.credentials.accessToken = response.data.access_token;
      
      // Langlebiges Token abrufen
      await this.getLongLivedToken();
      
      // Token im Cache speichern
      await this.saveCredentials();
      
      this.logger.info('✅ Successfully exchanged code for token');
    } catch (error) {
      this.logger.error('❌ Failed to exchange code for token', { error });
      throw error;
    }
  }

  /**
   * Holt ein langlebiges Access Token
   */
  private async getLongLivedToken(): Promise<void> {
    try {
      const response = await axios.get(`https://graph.instagram.com/access_token`, {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: this.credentials.clientSecret,
          access_token: this.credentials.accessToken
        }
      });
      
      this.credentials.accessToken = response.data.access_token;
      
      // Token-Ablaufzeit berechnen (60 Tage)
      const expiresIn = response.data.expires_in || 5184000; // Default: 60 Tage
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
      this.credentials.expiresAt = expiresAt;
      
      this.logger.info('✅ Successfully obtained long-lived token');
    } catch (error) {
      this.logger.error('❌ Failed to get long-lived token', { error });
      throw error;
    }
  }

  /**
   * Aktualisiert das Access Token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.get(`https://graph.instagram.com/refresh_access_token`, {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: this.credentials.accessToken
        }
      });
      
      this.credentials.accessToken = response.data.access_token;
      
      // Token-Ablaufzeit berechnen (60 Tage)
      const expiresIn = response.data.expires_in || 5184000; // Default: 60 Tage
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
      this.credentials.expiresAt = expiresAt;
      
      // Aktualisierte Credentials speichern
      await this.saveCredentials();
      
      this.logger.info('✅ Successfully refreshed access token');
    } catch (error) {
      this.logger.error('❌ Failed to refresh access token', { error });
      throw error;
    }
  }

  /**
   * Speichert die Credentials im Cache
   */
  private async saveCredentials(): Promise<void> {
    try {
      const credentialsPath = path.join(this.cacheDir, 'credentials.json');
      await fs.writeFile(credentialsPath, JSON.stringify(this.credentials), 'utf-8');
      this.logger.info('✅ Credentials saved to cache');
    } catch (error) {
      this.logger.error('❌ Failed to save credentials', { error });
      throw error;
    }
  }

  /**
   * Lädt die Credentials aus dem Cache
   */
  async loadCredentials(): Promise<boolean> {
    try {
      const credentialsPath = path.join(this.cacheDir, 'credentials.json');
      const data = await fs.readFile(credentialsPath, 'utf-8');
      const credentials = JSON.parse(data);
      
      // Datum-Strings in Date-Objekte umwandeln
      if (credentials.expiresAt) {
        credentials.expiresAt = new Date(credentials.expiresAt);
      }
      
      this.credentials = credentials;
      this.logger.info('✅ Credentials loaded from cache');
      return true;
    } catch (error) {
      this.logger.warn('⚠️ Failed to load credentials from cache', { error });
      return false;
    }
  }

  /**
   * Ruft Informationen über den aktuellen Account ab
   */
  async getAccountInfo(): Promise<InstagramAccountInfo> {
    this.ensureInitialized();
    
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url',
          access_token: this.credentials.accessToken
        }
      });
      
      return {
        id: response.data.id,
        username: response.data.username,
        name: response.data.name,
        biography: response.data.biography,
        followers: response.data.followers_count,
        following: response.data.follows_count,
        mediaCount: response.data.media_count,
        profilePicture: response.data.profile_picture_url
      };
    } catch (error) {
      this.logger.error('❌ Failed to get account info', { error });
      throw error;
    }
  }

  /**
   * Veröffentlicht einen Post auf Instagram
   */
  async publishPost(options: InstagramPostOptions): Promise<string> {
    this.ensureInitialized();
    
    try {
      let mediaId: string;
      
      switch (options.mediaType) {
        case 'IMAGE':
          mediaId = await this.uploadImage(options.mediaUrl, options.caption);
          break;
        case 'VIDEO':
          mediaId = await this.uploadVideo(options.mediaUrl, options.caption);
          break;
        case 'CAROUSEL_ALBUM':
          if (!options.childrenMediaUrls || options.childrenMediaUrls.length === 0) {
            throw new Error('Carousel album requires at least one child media URL');
          }
          mediaId = await this.uploadCarousel(options.childrenMediaUrls, options.caption);
          break;
        default:
          throw new Error(`Unsupported media type: ${options.mediaType}`);
      }
      
      this.logger.info(`✅ Successfully published post with media ID: ${mediaId}`);
      return mediaId;
    } catch (error) {
      this.logger.error('❌ Failed to publish post', { error });
      throw error;
    }
  }

  /**
   * Veröffentlicht ein Reel auf Instagram
   */
  async publishReel(options: InstagramReelOptions): Promise<string> {
    this.ensureInitialized();
    
    try {
      // Container erstellen
      const containerResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
        media_type: 'REELS',
        video_url: options.videoUrl,
        caption: options.caption,
        thumb_url: options.thumbnailUrl,
        share_to_feed: options.shareToFeed || false
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Veröffentlichung
      const publishResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media_publish`, {
        creation_id: containerId
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const mediaId = publishResponse.data.id;
      
      this.logger.info(`✅ Successfully published reel with media ID: ${mediaId}`);
      return mediaId;
    } catch (error) {
      this.logger.error('❌ Failed to publish reel', { error });
      throw error;
    }
  }

  /**
   * Lädt ein Bild hoch
   */
  private async uploadImage(imageUrl: string, caption: string): Promise<string> {
    try {
      // Container erstellen
      const containerResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
        image_url: imageUrl,
        caption: caption
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Veröffentlichung
      const publishResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media_publish`, {
        creation_id: containerId
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      return publishResponse.data.id;
    } catch (error) {
      this.logger.error('❌ Failed to upload image', { error });
      throw error;
    }
  }

  /**
   * Lädt ein Video hoch
   */
  private async uploadVideo(videoUrl: string, caption: string): Promise<string> {
    try {
      // Container erstellen
      const containerResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
        media_type: 'VIDEO',
        video_url: videoUrl,
        caption: caption
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Veröffentlichung
      const publishResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media_publish`, {
        creation_id: containerId
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      return publishResponse.data.id;
    } catch (error) {
      this.logger.error('❌ Failed to upload video', { error });
      throw error;
    }
  }

  /**
   * Lädt ein Carousel hoch
   */
  private async uploadCarousel(mediaUrls: string[], caption: string): Promise<string> {
    try {
      // Medien-IDs für jedes Kind-Element erstellen
      const childrenIds = [];
      
      for (const mediaUrl of mediaUrls) {
        const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.mov');
        
        const childResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
          [isVideo ? 'video_url' : 'image_url']: mediaUrl,
          is_carousel_item: true
        }, {
          params: {
            access_token: this.credentials.accessToken
          }
        });
        
        childrenIds.push(childResponse.data.id);
      }
      
      // Container für das Carousel erstellen
      const containerResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
        media_type: 'CAROUSEL',
        children: childrenIds,
        caption: caption
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Veröffentlichung
      const publishResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media_publish`, {
        creation_id: containerId
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      return publishResponse.data.id;
    } catch (error) {
      this.logger.error('❌ Failed to upload carousel', { error });
      throw error;
    }
  }

  /**
   * Stellt sicher, dass der Service initialisiert ist
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Instagram service is not initialized');
    }
    
    if (!this.credentials.accessToken) {
      throw new Error('No access token available');
    }
  }

  /**
   * Prüft, ob der Service gesund ist
   */
  async isHealthy(): Promise<boolean> {
    return this.isInitialized && !!this.credentials.accessToken;
  }

  /**
   * Fährt den Service herunter
   */
  async shutdown(): Promise<void> {
    this.logger.info('📱 Instagram service shutting down...');
    this.isInitialized = false;
    this.logger.info('✅ Instagram service shutdown');
  }
}
```

### Angepasste Implementierung für das Bestandssystem

Die angepasste Implementierung folgt der neuen Verzeichnisstruktur und integriert sich nahtlos in das bestehende System:

```typescript
// src/services/instagram/auth.ts
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mainLogger } from '../../core/logger';

export interface InstagramCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export class InstagramAuthService {
  private credentials: InstagramCredentials;
  private baseUrl = 'https://graph.instagram.com';
  private apiVersion = 'v18.0';
  private cacheDir: string;

  constructor(credentials: InstagramCredentials, cacheDir?: string) {
    this.credentials = credentials;
    this.cacheDir = cacheDir || path.join(process.cwd(), 'cache', 'instagram');
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
   * Generiert die Authentifizierungs-URL für OAuth
   */
  generateAuthUrl(scopes: string[] = ['user_profile', 'user_media']): string {
    const scopeString = scopes.join(',');
    const state = uuidv4();
    
    return `https://api.instagram.com/oauth/authorize?client_id=${this.credentials.clientId}&redirect_uri=${encodeURIComponent(this.credentials.redirectUri)}&scope=${scopeString}&response_type=code&state=${state}`;
  }

  /**
   * Tauscht den Autorisierungscode gegen ein Access Token
   */
  async exchangeCodeForToken(code: string): Promise<void> {
    try {
      const response = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.credentials.redirectUri,
        code
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      this.credentials.accessToken = response.data.access_token;
      
      // Langlebiges Token abrufen
      await this.getLongLivedToken();
      
      // Token im Cache speichern
      await this.saveCredentials();
      
      mainLogger.info('✅ Successfully exchanged code for token');
    } catch (error) {
      mainLogger.error('❌ Failed to exchange code for token', { error });
      throw error;
    }
  }

  /**
   * Holt ein langlebiges Access Token
   */
  private async getLongLivedToken(): Promise<void> {
    try {
      const response = await axios.get(`https://graph.instagram.com/access_token`, {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: this.credentials.clientSecret,
          access_token: this.credentials.accessToken
        }
      });
      
      this.credentials.accessToken = response.data.access_token;
      
      // Token-Ablaufzeit berechnen (60 Tage)
      const expiresIn = response.data.expires_in || 5184000; // Default: 60 Tage
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
      this.credentials.expiresAt = expiresAt;
      
      mainLogger.info('✅ Successfully obtained long-lived token');
    } catch (error) {
      mainLogger.error('❌ Failed to get long-lived token', { error });
      throw error;
    }
  }

  /**
   * Aktualisiert das Access Token
   */
  async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.get(`https://graph.instagram.com/refresh_access_token`, {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: this.credentials.accessToken
        }
      });
      
      this.credentials.accessToken = response.data.access_token;
      
      // Token-Ablaufzeit berechnen (60 Tage)
      const expiresIn = response.data.expires_in || 5184000; // Default: 60 Tage
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
      this.credentials.expiresAt = expiresAt;
      
      // Aktualisierte Credentials speichern
      await this.saveCredentials();
      
      mainLogger.info('✅ Successfully refreshed access token');
    } catch (error) {
      mainLogger.error('❌ Failed to refresh access token', { error });
      throw error;
    }
  }

  /**
   * Speichert die Credentials im Cache
   */
  private async saveCredentials(): Promise<void> {
    try {
      const credentialsPath = path.join(this.cacheDir, 'credentials.json');
      await fs.writeFile(credentialsPath, JSON.stringify(this.credentials), 'utf-8');
      mainLogger.info('✅ Credentials saved to cache');
    } catch (error) {
      mainLogger.error('❌ Failed to save credentials', { error });
      throw error;
    }
  }

  /**
   * Lädt die Credentials aus dem Cache
   */
  async loadCredentials(): Promise<boolean> {
    try {
      const credentialsPath = path.join(this.cacheDir, 'credentials.json');
      const data = await fs.readFile(credentialsPath, 'utf-8');
      const credentials = JSON.parse(data);
      
      // Datum-Strings in Date-Objekte umwandeln
      if (credentials.expiresAt) {
        credentials.expiresAt = new Date(credentials.expiresAt);
      }
      
      this.credentials = credentials;
      mainLogger.info('✅ Credentials loaded from cache');
      return true;
    } catch (error) {
      mainLogger.warn('⚠️ Failed to load credentials from cache', { error });
      return false;
    }
  }

  /**
   * Gibt die aktuellen Credentials zurück
   */
  getCredentials(): InstagramCredentials {
    return this.credentials;
  }

  /**
   * Prüft, ob gültige Credentials vorhanden sind
   */
  hasValidCredentials(): boolean {
    if (!this.credentials.accessToken || !this.credentials.expiresAt) {
      return false;
    }
    
    const now = new Date();
    return now < this.credentials.expiresAt;
  }
}

// src/services/instagram/content.ts
import axios from 'axios';
import { mainLogger } from '../../core/logger';
import { InstagramCredentials } from './auth';

export interface InstagramPostOptions {
  caption: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  hashtags?: string[];
  userTags?: { username: string; x: number; y: number }[];
  childrenMediaUrls?: string[];
}

export interface InstagramReelOptions {
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  shareToFeed?: boolean;
  hashtags?: string[];
  audioName?: string;
}

export class InstagramContentService {
  private credentials: InstagramCredentials;
  private baseUrl = 'https://graph.instagram.com';
  private apiVersion = 'v18.0';

  constructor(credentials: InstagramCredentials) {
    this.credentials = credentials;
  }

  /**
   * Veröffentlicht einen Post auf Instagram
   */
  async publishPost(options: InstagramPostOptions): Promise<string> {
    try {
      let mediaId: string;
      
      switch (options.mediaType) {
        case 'IMAGE':
          mediaId = await this.uploadImage(options.mediaUrl, options.caption);
          break;
        case 'VIDEO':
          mediaId = await this.uploadVideo(options.mediaUrl, options.caption);
          break;
        case 'CAROUSEL_ALBUM':
          if (!options.childrenMediaUrls || options.childrenMediaUrls.length === 0) {
            throw new Error('Carousel album requires at least one child media URL');
          }
          mediaId = await this.uploadCarousel(options.childrenMediaUrls, options.caption);
          break;
        default:
          throw new Error(`Unsupported media type: ${options.mediaType}`);
      }
      
      mainLogger.info(`✅ Successfully published post with media ID: ${mediaId}`);
      return mediaId;
    } catch (error) {
      mainLogger.error('❌ Failed to publish post', { error });
      throw error;
    }
  }

  /**
   * Veröffentlicht ein Reel auf Instagram
   */
  async publishReel(options: InstagramReelOptions): Promise<string> {
    try {
      // Container erstellen
      const containerResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
        media_type: 'REELS',
        video_url: options.videoUrl,
        caption: options.caption,
        thumb_url: options.thumbnailUrl,
        share_to_feed: options.shareToFeed || false
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Veröffentlichung
      const publishResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media_publish`, {
        creation_id: containerId
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const mediaId = publishResponse.data.id;
      
      mainLogger.info(`✅ Successfully published reel with media ID: ${mediaId}`);
      return mediaId;
    } catch (error) {
      mainLogger.error('❌ Failed to publish reel', { error });
      throw error;
    }
  }

  /**
   * Lädt ein Bild hoch
   */
  private async uploadImage(imageUrl: string, caption: string): Promise<string> {
    try {
      // Container erstellen
      const containerResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
        image_url: imageUrl,
        caption: caption
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Veröffentlichung
      const publishResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media_publish`, {
        creation_id: containerId
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      return publishResponse.data.id;
    } catch (error) {
      mainLogger.error('❌ Failed to upload image', { error });
      throw error;
    }
  }

  /**
   * Lädt ein Video hoch
   */
  private async uploadVideo(videoUrl: string, caption: string): Promise<string> {
    try {
      // Container erstellen
      const containerResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
        media_type: 'VIDEO',
        video_url: videoUrl,
        caption: caption
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Veröffentlichung
      const publishResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media_publish`, {
        creation_id: containerId
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      return publishResponse.data.id;
    } catch (error) {
      mainLogger.error('❌ Failed to upload video', { error });
      throw error;
    }
  }

  /**
   * Lädt ein Carousel hoch
   */
  private async uploadCarousel(mediaUrls: string[], caption: string): Promise<string> {
    try {
      // Medien-IDs für jedes Kind-Element erstellen
      const childrenIds = [];
      
      for (const mediaUrl of mediaUrls) {
        const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.mov');
        
        const childResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
          [isVideo ? 'video_url' : 'image_url']: mediaUrl,
          is_carousel_item: true
        }, {
          params: {
            access_token: this.credentials.accessToken
          }
        });
        
        childrenIds.push(childResponse.data.id);
      }
      
      // Container für das Carousel erstellen
      const containerResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
        media_type: 'CAROUSEL',
        children: childrenIds,
        caption: caption
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      const containerId = containerResponse.data.id;
      
      // Veröffentlichung
      const publishResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media_publish`, {
        creation_id: containerId
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      return publishResponse.data.id;
    } catch (error) {
      mainLogger.error('❌ Failed to upload carousel', { error });
      throw error;
    }
  }

  /**
   * Setzt die Credentials
   */
  setCredentials(credentials: InstagramCredentials): void {
    this.credentials = credentials;
  }
}

// src/services/instagram/interaction.ts
import axios from 'axios';
import { mainLogger } from '../../core/logger';
import { InstagramCredentials } from './auth';

export interface InstagramAccountInfo {
  id: string;
  username: string;
  name: string;
  biography: string;
  followers: number;
  following: number;
  mediaCount: number;
  profilePicture: string;
}

export class InstagramInteractionService {
  private credentials: InstagramCredentials;
  private baseUrl = 'https://graph.instagram.com';
  private apiVersion = 'v18.0';

  constructor(credentials: InstagramCredentials) {
    this.credentials = credentials;
  }

  /**
   * Ruft Informationen über den aktuellen Account ab
   */
  async getAccountInfo(): Promise<InstagramAccountInfo> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url',
          access_token: this.credentials.accessToken
        }
      });
      
      return {
        id: response.data.id,
        username: response.data.username,
        name: response.data.name,
        biography: response.data.biography,
        followers: response.data.followers_count,
        following: response.data.follows_count,
        mediaCount: response.data.media_count,
        profilePicture: response.data.profile_picture_url
      };
    } catch (error) {
      mainLogger.error('❌ Failed to get account info', { error });
      throw error;
    }
  }

  /**
   * Setzt die Credentials
   */
  setCredentials(credentials: InstagramCredentials): void {
    this.credentials = credentials;
  }
}

// src/services/instagram/index.ts
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
```

## Magazin-Scraping-Integration

Die Magazin-Scraping-Funktionalität wird ähnlich angepasst und in die neue Verzeichnisstruktur integriert. Der bestehende Code aus dem StudiBuch-Magazin-Service wird optimiert und in separate Module aufgeteilt.

## Bildvorschau-Korrektur

Die Bildvorschau-Funktionalität wird im Content-Service implementiert und mit dem Instagram-Service integriert.

## Creatomate-Integration

Die Creatomate-Integration wird als neuer Service implementiert und in die bestehende Architektur integriert.

## Benutzeroberfläche

Die Benutzeroberfläche wird vereinheitlicht und konsistent gestaltet, um ein nahtloses Benutzererlebnis zu bieten.

## Ankaufsystem-Integration

Die Beta-Version des Ankaufsystems wird in die neue Architektur integriert und mit dem Gesamtsystem verbunden.

## Fazit

Die Anpassung und Integration der Module aus der Mini-Version in das bestehende StudiFlow AI Enterprise System erfolgt schrittweise und modular. Durch die klare Trennung der Verantwortlichkeiten und die Beseitigung von Redundanzen entsteht ein konsistentes, einheitliches System aus einem Guss.
