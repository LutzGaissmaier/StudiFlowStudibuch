/**
 * Content Preview Service
 * 
 * Implementiert die Vorschau-Funktionalität für verschiedene Content-Typen
 * mit korrekter Bilddarstellung und responsivem Design.
 * 
 * @version 1.0.0
 */

import { mainLogger } from '../../core/logger';
import { ModifiedContent } from '../magazine/adapter';

export interface PreviewOptions {
  width?: number;
  height?: number;
  showCaption?: boolean;
  showHashtags?: boolean;
  darkMode?: boolean;
  responsive?: boolean;
}

export interface PreviewResult {
  html: string;
  css: string;
  previewImages: string[];
}

export class ContentPreviewService {
  /**
   * Generiert eine HTML-Vorschau für einen Instagram-Post
   */
  generateInstagramPostPreview(content: ModifiedContent, options: PreviewOptions = {}): PreviewResult {
    mainLogger.info(`🖼️ Generating Instagram post preview for content ID: ${content.id}`);
    
    try {
      const {
        width = 400,
        height = 500,
        showCaption = true,
        showHashtags = true,
        darkMode = false,
        responsive = true
      } = options;
      
      // Stelle sicher, dass mindestens ein Bild vorhanden ist
      if (content.content.images.length === 0) {
        throw new Error('No images available for preview');
      }
      
      // Extrahiere Hashtags aus dem Text, falls vorhanden
      const hashtagRegex = /#[\w\u00C0-\u00FF]+/g;
      const hashtags = content.content.text.match(hashtagRegex) || [];
      
      // Entferne Hashtags aus dem Text für die Anzeige, wenn showHashtags false ist
      let displayText = content.content.text;
      if (!showHashtags) {
        displayText = displayText.replace(hashtagRegex, '').trim();
      }
      
      // Generiere das HTML
      const html = `
        <div class="instagram-preview ${darkMode ? 'dark-mode' : 'light-mode'}">
          <div class="instagram-header">
            <div class="profile-image"></div>
            <div class="profile-info">
              <div class="username">studibuch</div>
              <div class="location">StudiBuch Magazin</div>
            </div>
            <div class="options">⋮</div>
          </div>
          <div class="instagram-image">
            <img src="${content.content.images[0]}" alt="Instagram post image" />
          </div>
          ${showCaption ? `
          <div class="instagram-actions">
            <div class="action-buttons">
              <span class="like">♥</span>
              <span class="comment">💬</span>
              <span class="share">📤</span>
              <span class="save">🔖</span>
            </div>
            <div class="likes">Gefällt 123 Mal</div>
            <div class="caption">
              <span class="username">studibuch</span>
              <span class="text">${displayText}</span>
            </div>
            <div class="timestamp">VOR 1 STUNDE</div>
          </div>
          ` : ''}
        </div>
      `;
      
      // Generiere das CSS
      const css = `
        .instagram-preview {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: ${width}px;
          ${responsive ? 'width: 100%;' : `width: ${width}px;`}
          border: 1px solid #dbdbdb;
          border-radius: 3px;
          overflow: hidden;
          margin: 0 auto;
        }
        
        .light-mode {
          background-color: #ffffff;
          color: #262626;
        }
        
        .dark-mode {
          background-color: #121212;
          color: #f5f5f5;
          border-color: #333333;
        }
        
        .instagram-header {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid ${darkMode ? '#333333' : '#efefef'};
        }
        
        .profile-image {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #efefef;
          background-image: url('https://studibuch.de/wp-content/uploads/2022/01/favicon.png');
          background-size: cover;
          margin-right: 12px;
        }
        
        .profile-info {
          flex: 1;
        }
        
        .username {
          font-weight: 600;
          font-size: 14px;
          line-height: 18px;
        }
        
        .location {
          font-size: 12px;
          line-height: 15px;
          color: ${darkMode ? '#a8a8a8' : '#8e8e8e'};
        }
        
        .options {
          font-weight: bold;
          font-size: 16px;
        }
        
        .instagram-image {
          width: 100%;
          position: relative;
          ${responsive ? '' : `height: ${height - 200}px;`}
        }
        
        .instagram-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        
        .instagram-actions {
          padding: 12px 16px;
        }
        
        .action-buttons {
          display: flex;
          margin-bottom: 8px;
        }
        
        .action-buttons span {
          margin-right: 16px;
          font-size: 24px;
          cursor: pointer;
        }
        
        .likes {
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .caption {
          margin-bottom: 8px;
          font-size: 14px;
          line-height: 18px;
        }
        
        .caption .username {
          margin-right: 4px;
        }
        
        .timestamp {
          font-size: 10px;
          line-height: 12px;
          color: ${darkMode ? '#a8a8a8' : '#8e8e8e'};
          text-transform: uppercase;
        }
      `;
      
      return {
        html,
        css,
        previewImages: [content.content.images[0]]
      };
    } catch (error) {
      mainLogger.error(`❌ Failed to generate Instagram post preview: ${error}`);
      throw error;
    }
  }

  /**
   * Generiert eine HTML-Vorschau für ein Instagram-Carousel
   */
  generateInstagramCarouselPreview(content: ModifiedContent, options: PreviewOptions = {}): PreviewResult {
    mainLogger.info(`🖼️ Generating Instagram carousel preview for content ID: ${content.id}`);
    
    try {
      const {
        width = 400,
        height = 600,
        showCaption = true,
        showHashtags = true,
        darkMode = false,
        responsive = true
      } = options;
      
      // Stelle sicher, dass mindestens zwei Bilder vorhanden sind
      if (content.content.images.length < 2) {
        throw new Error('Carousel requires at least 2 images');
      }
      
      // Extrahiere Hashtags aus dem Text, falls vorhanden
      const hashtagRegex = /#[\w\u00C0-\u00FF]+/g;
      const hashtags = content.content.text.match(hashtagRegex) || [];
      
      // Entferne Hashtags aus dem Text für die Anzeige, wenn showHashtags false ist
      let displayText = content.content.text;
      if (!showHashtags) {
        displayText = displayText.replace(hashtagRegex, '').trim();
      }
      
      // Generiere die Carousel-Indikatoren
      const indicators = content.content.images.map((_, index) => 
        `<div class="carousel-indicator ${index === 0 ? 'active' : ''}"></div>`
      ).join('');
      
      // Generiere das HTML
      const html = `
        <div class="instagram-preview ${darkMode ? 'dark-mode' : 'light-mode'}">
          <div class="instagram-header">
            <div class="profile-image"></div>
            <div class="profile-info">
              <div class="username">studibuch</div>
              <div class="location">StudiBuch Magazin</div>
            </div>
            <div class="options">⋮</div>
          </div>
          <div class="instagram-carousel">
            <div class="carousel-container">
              <img src="${content.content.images[0]}" alt="Carousel image 1" class="carousel-image" />
              <div class="carousel-navigation">
                <div class="carousel-prev">◀</div>
                <div class="carousel-next">▶</div>
              </div>
              <div class="carousel-counter">1/${content.content.images.length}</div>
            </div>
            <div class="carousel-indicators">
              ${indicators}
            </div>
          </div>
          ${showCaption ? `
          <div class="instagram-actions">
            <div class="action-buttons">
              <span class="like">♥</span>
              <span class="comment">💬</span>
              <span class="share">📤</span>
              <span class="save">🔖</span>
            </div>
            <div class="likes">Gefällt 123 Mal</div>
            <div class="caption">
              <span class="username">studibuch</span>
              <span class="text">${displayText}</span>
            </div>
            <div class="timestamp">VOR 1 STUNDE</div>
          </div>
          ` : ''}
        </div>
      `;
      
      // Generiere das CSS
      const css = `
        .instagram-preview {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: ${width}px;
          ${responsive ? 'width: 100%;' : `width: ${width}px;`}
          border: 1px solid #dbdbdb;
          border-radius: 3px;
          overflow: hidden;
          margin: 0 auto;
        }
        
        .light-mode {
          background-color: #ffffff;
          color: #262626;
        }
        
        .dark-mode {
          background-color: #121212;
          color: #f5f5f5;
          border-color: #333333;
        }
        
        .instagram-header {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid ${darkMode ? '#333333' : '#efefef'};
        }
        
        .profile-image {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #efefef;
          background-image: url('https://studibuch.de/wp-content/uploads/2022/01/favicon.png');
          background-size: cover;
          margin-right: 12px;
        }
        
        .profile-info {
          flex: 1;
        }
        
        .username {
          font-weight: 600;
          font-size: 14px;
          line-height: 18px;
        }
        
        .location {
          font-size: 12px;
          line-height: 15px;
          color: ${darkMode ? '#a8a8a8' : '#8e8e8e'};
        }
        
        .options {
          font-weight: bold;
          font-size: 16px;
        }
        
        .instagram-carousel {
          width: 100%;
          position: relative;
        }
        
        .carousel-container {
          position: relative;
          ${responsive ? '' : `height: ${height - 250}px;`}
        }
        
        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        
        .carousel-navigation {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          transform: translateY(-50%);
          padding: 0 16px;
        }
        
        .carousel-prev, .carousel-next {
          width: 30px;
          height: 30px;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          color: #262626;
        }
        
        .carousel-counter {
          position: absolute;
          top: 12px;
          right: 12px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .carousel-indicators {
          display: flex;
          justify-content: center;
          padding: 8px 0;
        }
        
        .carousel-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: ${darkMode ? '#555555' : '#c7c7c7'};
          margin: 0 2px;
        }
        
        .carousel-indicator.active {
          background-color: ${darkMode ? '#ffffff' : '#0095f6'};
        }
        
        .instagram-actions {
          padding: 12px 16px;
        }
        
        .action-buttons {
          display: flex;
          margin-bottom: 8px;
        }
        
        .action-buttons span {
          margin-right: 16px;
          font-size: 24px;
          cursor: pointer;
        }
        
        .likes {
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .caption {
          margin-bottom: 8px;
          font-size: 14px;
          line-height: 18px;
        }
        
        .caption .username {
          margin-right: 4px;
        }
        
        .timestamp {
          font-size: 10px;
          line-height: 12px;
          color: ${darkMode ? '#a8a8a8' : '#8e8e8e'};
          text-transform: uppercase;
        }
      `;
      
      return {
        html,
        css,
        previewImages: content.content.images
      };
    } catch (error) {
      mainLogger.error(`❌ Failed to generate Instagram carousel preview: ${error}`);
      throw error;
    }
  }

  /**
   * Generiert eine HTML-Vorschau für ein Instagram-Reel
   */
  generateInstagramReelPreview(content: ModifiedContent, options: PreviewOptions = {}): PreviewResult {
    mainLogger.info(`🖼️ Generating Instagram reel preview for content ID: ${content.id}`);
    
    try {
      const {
        width = 400,
        height = 700,
        showCaption = true,
        showHashtags = true,
        darkMode = false,
        responsive = true
      } = options;
      
      // Stelle sicher, dass mindestens ein Bild oder Video vorhanden ist
      if (content.content.images.length === 0) {
        throw new Error('No media available for preview');
      }
      
      // Extrahiere Hashtags aus dem Text, falls vorhanden
      const hashtagRegex = /#[\w\u00C0-\u00FF]+/g;
      const hashtags = content.content.text.match(hashtagRegex) || [];
      
      // Entferne Hashtags aus dem Text für die Anzeige, wenn showHashtags false ist
      let displayText = content.content.text;
      if (!showHashtags) {
        displayText = displayText.replace(hashtagRegex, '').trim();
      }
      
      // Generiere das HTML
      const html = `
        <div class="instagram-preview reel-preview ${darkMode ? 'dark-mode' : 'light-mode'}">
          <div class="reel-container">
            <img src="${content.content.images[0]}" alt="Reel thumbnail" class="reel-thumbnail" />
            <div class="reel-overlay">
              <div class="reel-play-button">▶</div>
              <div class="reel-audio">
                <div class="audio-icon">🎵</div>
                <div class="audio-info">
                  <div class="audio-title">Original Audio</div>
                  <div class="audio-author">studibuch</div>
                </div>
              </div>
            </div>
          </div>
          ${showCaption ? `
          <div class="instagram-actions">
            <div class="action-buttons">
              <span class="like">♥</span>
              <span class="comment">💬</span>
              <span class="share">📤</span>
              <span class="save">🔖</span>
            </div>
            <div class="likes">Gefällt 123 Mal</div>
            <div class="caption">
              <span class="username">studibuch</span>
              <span class="text">${displayText}</span>
            </div>
            <div class="timestamp">VOR 1 STUNDE</div>
          </div>
          ` : ''}
        </div>
      `;
      
      // Generiere das CSS
      const css = `
        .instagram-preview {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: ${width}px;
          ${responsive ? 'width: 100%;' : `width: ${width}px;`}
          border: 1px solid #dbdbdb;
          border-radius: 3px;
          overflow: hidden;
          margin: 0 auto;
        }
        
        .reel-preview {
          background-color: ${darkMode ? '#121212' : '#ffffff'};
        }
        
        .light-mode {
          background-color: #ffffff;
          color: #262626;
        }
        
        .dark-mode {
          background-color: #121212;
          color: #f5f5f5;
          border-color: #333333;
        }
        
        .reel-container {
          position: relative;
          width: 100%;
          ${responsive ? 'aspect-ratio: 9/16;' : `height: ${height - 150}px;`}
          background-color: #000000;
        }
        
        .reel-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        
        .reel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
        }
        
        .reel-play-button {
          width: 60px;
          height: 60px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          margin: auto;
        }
        
        .reel-audio {
          display: flex;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.5);
          padding: 8px 12px;
          border-radius: 16px;
          color: white;
          align-self: flex-start;
        }
        
        .audio-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        
        .audio-info {
          font-size: 12px;
        }
        
        .audio-title {
          font-weight: 600;
        }
        
        .instagram-actions {
          padding: 12px 16px;
        }
        
        .action-buttons {
          display: flex;
          margin-bottom: 8px;
        }
        
        .action-buttons span {
          margin-right: 16px;
          font-size: 24px;
          cursor: pointer;
        }
        
        .likes {
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .caption {
          margin-bottom: 8px;
          font-size: 14px;
          line-height: 18px;
        }
        
        .caption .username {
          margin-right: 4px;
        }
        
        .timestamp {
          font-size: 10px;
          line-height: 12px;
          color: ${darkMode ? '#a8a8a8' : '#8e8e8e'};
          text-transform: uppercase;
        }
      `;
      
      return {
        html,
        css,
        previewImages: [content.content.images[0]]
      };
    } catch (error) {
      mainLogger.error(`❌ Failed to generate Instagram reel preview: ${error}`);
      throw error;
    }
  }

  /**
   * Generiert eine HTML-Vorschau für eine Instagram-Story
   */
  generateInstagramStoryPreview(content: ModifiedContent, options: PreviewOptions = {}): PreviewResult {
    mainLogger.info(`🖼️ Generating Instagram story preview for content ID: ${content.id}`);
    
    try {
      const {
        width = 400,
        height = 700,
        showCaption = true,
        showHashtags = true,
        darkMode = false,
        responsive = true
      } = options;
      
      // Stelle sicher, dass mindestens ein Bild vorhanden ist
      if (content.content.images.length === 0) {
        throw new Error('No images available for preview');
      }
      
      // Extrahiere Hashtags aus dem Text, falls vorhanden
      const hashtagRegex = /#[\w\u00C0-\u00FF]+/g;
      const hashtags = content.content.text.match(hashtagRegex) || [];
      
      // Entferne Hashtags aus dem Text für die Anzeige, wenn showHashtags false ist
      let displayText = content.content.text;
      if (!showHashtags) {
        displayText = displayText.replace(hashtagRegex, '').trim();
      }
      
      // Generiere das HTML
      const html = `
        <div class="instagram-preview story-preview ${darkMode ? 'dark-mode' : 'light-mode'}">
          <div class="story-container">
            <img src="${content.content.images[0]}" alt="Story image" class="story-image" />
            <div class="story-overlay">
              <div class="story-header">
                <div class="story-profile">
                  <div class="profile-image"></div>
                  <div class="profile-info">
                    <div class="username">studibuch</div>
                    <div class="timestamp">VOR 1 STUNDE</div>
                  </div>
                </div>
                <div class="story-options">⋮</div>
              </div>
              ${showCaption ? `
              <div class="story-caption">
                <div class="caption-box">
                  ${displayText}
                </div>
              </div>
              ` : ''}
              <div class="story-footer">
                <div class="story-reply">
                  <input type="text" placeholder="Antworten..." readonly />
                  <div class="send-button">➤</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Generiere das CSS
      const css = `
        .instagram-preview {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: ${width}px;
          ${responsive ? 'width: 100%;' : `width: ${width}px;`}
          border: 1px solid #dbdbdb;
          border-radius: 3px;
          overflow: hidden;
          margin: 0 auto;
        }
        
        .story-preview {
          background-color: #000000;
        }
        
        .story-container {
          position: relative;
          width: 100%;
          ${responsive ? 'aspect-ratio: 9/16;' : `height: ${height}px;`}
          background-color: #000000;
        }
        
        .story-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        
        .story-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
        }
        
        .story-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .story-profile {
          display: flex;
          align-items: center;
        }
        
        .profile-image {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #efefef;
          background-image: url('https://studibuch.de/wp-content/uploads/2022/01/favicon.png');
          background-size: cover;
          margin-right: 12px;
          border: 2px solid white;
        }
        
        .profile-info {
          color: white;
        }
        
        .username {
          font-weight: 600;
          font-size: 14px;
          line-height: 18px;
        }
        
        .timestamp {
          font-size: 12px;
          line-height: 15px;
          opacity: 0.8;
        }
        
        .story-options {
          color: white;
          font-weight: bold;
          font-size: 16px;
        }
        
        .story-caption {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 16px 0;
        }
        
        .caption-box {
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          max-width: 80%;
          font-size: 14px;
          line-height: 18px;
          text-align: center;
        }
        
        .story-footer {
          margin-top: auto;
        }
        
        .story-reply {
          display: flex;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 8px 16px;
        }
        
        .story-reply input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 8px 0;
          font-size: 14px;
        }
        
        .story-reply input::placeholder {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .send-button {
          color: white;
          font-size: 16px;
          margin-left: 8px;
        }
      `;
      
      return {
        html,
        css,
        previewImages: [content.content.images[0]]
      };
    } catch (error) {
      mainLogger.error(`❌ Failed to generate Instagram story preview: ${error}`);
      throw error;
    }
  }

  /**
   * Generiert eine HTML-Vorschau basierend auf dem Content-Format
   */
  generatePreview(content: ModifiedContent, options: PreviewOptions = {}): PreviewResult {
    switch (content.format) {
      case 'instagram_post':
        return this.generateInstagramPostPreview(content, options);
      case 'instagram_carousel':
        return this.generateInstagramCarouselPreview(content, options);
      case 'instagram_reel':
        return this.generateInstagramReelPreview(content, options);
      case 'instagram_story':
        return this.generateInstagramStoryPreview(content, options);
      default:
        throw new Error(`Unsupported content format: ${content.format}`);
    }
  }
}
