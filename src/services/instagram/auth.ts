/**
 * Instagram Authentifizierungs-Service
 * 
 * Implementiert die Authentifizierung mit der Instagram Graph API
 * für die sichere Verwaltung von Zugangsdaten und Tokens.
 * 
 * @version 1.0.0
 */

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
