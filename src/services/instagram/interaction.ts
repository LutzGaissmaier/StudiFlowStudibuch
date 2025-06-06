/**
 * Instagram Interaktions-Service
 * 
 * Implementiert die Interaktionsfunktionen für die Instagram Graph API
 * zum Abrufen von Account-Informationen und Interaktionen mit anderen Accounts.
 * 
 * @version 1.0.0
 */

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

export interface InstagramMedia {
  id: string;
  mediaType: string;
  mediaUrl: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  username: string;
  likeCount?: number;
  commentCount?: number;
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
   * Ruft die Medien des aktuellen Accounts ab
   */
  async getMedia(limit: number = 10): Promise<InstagramMedia[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/media`, {
        params: {
          fields: 'id,media_type,media_url,permalink,caption,timestamp,username,like_count,comments_count',
          limit: limit,
          access_token: this.credentials.accessToken
        }
      });
      
      return response.data.data.map((item: any) => ({
        id: item.id,
        mediaType: item.media_type,
        mediaUrl: item.media_url,
        permalink: item.permalink,
        caption: item.caption,
        timestamp: item.timestamp,
        username: item.username,
        likeCount: item.like_count,
        commentCount: item.comments_count
      }));
    } catch (error) {
      mainLogger.error('❌ Failed to get media', { error });
      throw error;
    }
  }

  /**
   * Ruft die Insights für ein bestimmtes Medium ab
   */
  async getMediaInsights(mediaId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${mediaId}/insights`, {
        params: {
          metric: 'engagement,impressions,reach,saved',
          access_token: this.credentials.accessToken
        }
      });
      
      return response.data.data;
    } catch (error) {
      mainLogger.error('❌ Failed to get media insights', { error });
      throw error;
    }
  }

  /**
   * Ruft die Kommentare für ein bestimmtes Medium ab
   */
  async getComments(mediaId: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${mediaId}/comments`, {
        params: {
          fields: 'id,text,timestamp,username',
          limit: limit,
          access_token: this.credentials.accessToken
        }
      });
      
      return response.data.data;
    } catch (error) {
      mainLogger.error('❌ Failed to get comments', { error });
      throw error;
    }
  }

  /**
   * Kommentiert ein Medium
   */
  async commentMedia(mediaId: string, text: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/${mediaId}/comments`, {
        message: text
      }, {
        params: {
          access_token: this.credentials.accessToken
        }
      });
      
      return response.data.id;
    } catch (error) {
      mainLogger.error('❌ Failed to comment media', { error });
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
