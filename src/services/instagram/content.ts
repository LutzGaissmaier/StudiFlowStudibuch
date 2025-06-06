/**
 * Instagram Content-Service
 * 
 * Implementiert die Content-Veröffentlichungsfunktionen für die Instagram Graph API
 * zur Veröffentlichung von Posts, Videos, Carousels und Reels.
 * 
 * @version 1.0.0
 */

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
      // Hashtags zur Caption hinzufügen, falls vorhanden
      let caption = options.caption;
      if (options.hashtags && options.hashtags.length > 0) {
        caption += '\n\n' + options.hashtags.join(' ');
      }
      
      let mediaId: string;
      
      switch (options.mediaType) {
        case 'IMAGE':
          mediaId = await this.uploadImage(options.mediaUrl, caption);
          break;
        case 'VIDEO':
          mediaId = await this.uploadVideo(options.mediaUrl, caption);
          break;
        case 'CAROUSEL_ALBUM':
          if (!options.childrenMediaUrls || options.childrenMediaUrls.length === 0) {
            throw new Error('Carousel album requires at least one child media URL');
          }
          mediaId = await this.uploadCarousel(options.childrenMediaUrls, caption);
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
      // Hashtags zur Caption hinzufügen, falls vorhanden
      let caption = options.caption;
      if (options.hashtags && options.hashtags.length > 0) {
        caption += '\n\n' + options.hashtags.join(' ');
      }
      
      // Container erstellen
      const containerResponse = await axios.post(`${this.baseUrl}/${this.apiVersion}/me/media`, {
        media_type: 'REELS',
        video_url: options.videoUrl,
        caption: caption,
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
