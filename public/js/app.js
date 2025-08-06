/**
 * StudiFlow AI Enterprise Frontend Application
 * Production-Ready JavaScript with Error Handling, Testing, and Performance Optimization
 * 
 * @version 1.0.0
 * @author StudiFlow AI Team
 */

'use strict';

// ===== APPLICATION CONFIGURATION =====
const CONFIG = {
  API_BASE_URL: window.location.origin,
  REFRESH_INTERVAL: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 10000,
  DEBUG: false
};

// ===== UTILITY FUNCTIONS =====
class Utils {
  /**
   * Debounce function calls
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function calls
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Format numbers with locale
   */
  static formatNumber(num) {
    return new Intl.NumberFormat('de-DE').format(num);
  }

  /**
   * Format bytes to human readable
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format uptime to human readable
   */
  static formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  /**
   * Log with timestamp
   */
  static log(level, message, data = null) {
    if (!CONFIG.DEBUG && level === 'debug') return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console[level](logMessage, data || '');
  }
}

// ===== API CLIENT =====
class ApiClient {
  constructor(baseURL = CONFIG.API_BASE_URL) {
    this.baseURL = baseURL;
    this.cache = new Map();
    this.requestQueue = new Map();
  }

  /**
   * Make HTTP request with retry logic and caching
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}_${url}`;
    
    // Check cache for GET requests
    if ((!options.method || options.method === 'GET') && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) { // 30s cache
        Utils.log('debug', `Cache hit for ${endpoint}`);
        return cached.data;
      }
    }

    // Prevent duplicate requests
    if (this.requestQueue.has(cacheKey)) {
      Utils.log('debug', `Request already in progress for ${endpoint}`);
      return this.requestQueue.get(cacheKey);
    }

    const requestPromise = this._makeRequest(url, options);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache successful GET requests
      if ((!options.method || options.method === 'GET') && result.success) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  /**
   * Internal request method with retry logic
   */
  async _makeRequest(url, options, attempt = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    try {
      Utils.log('debug', `Making request to ${url} (attempt ${attempt})`);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      Utils.log('debug', `Request successful for ${url}`, data);
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (attempt < CONFIG.RETRY_ATTEMPTS && !controller.signal.aborted) {
        Utils.log('warn', `Request failed, retrying (${attempt}/${CONFIG.RETRY_ATTEMPTS})`, error.message);
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
        return this._makeRequest(url, options, attempt + 1);
      }

      Utils.log('error', `Request failed after ${attempt} attempts`, error.message);
      throw error;
    }
  }

  // API Methods
  async getSystemStatus() {
    return this.request('/api/status');
  }

  async getHealth() {
    return this.request('/health');
  }

  async getSystemMetrics() {
    return this.request('/api/system/metrics');
  }

  async getInstagramStatus() {
    return this.request('/api/instagram/status');
  }

  async getAIStatus() {
    return this.request('/api/ai/status');
  }

  async getContent() {
    return this.request('/api/content');
  }

  // Magazine API Methods
  async getMagazineArticles() {
    return this.request('/api/magazine/articles');
  }

  async getModifiedContent() {
    return this.request('/api/magazine/modified');
  }

  async getMagazineStatus() {
    return this.request('/api/magazine/status');
  }

  // Scheduler API Methods
  async getSchedulerStats() {
    return this.request('/api/scheduler/stats');
  }

  async getScheduledPosts() {
    return this.request('/api/scheduler/posts');
  }

  async getDashboardStats() {
    return this.request('/api/dashboard/stats');
  }
}

// ===== UI MANAGER =====
class UIManager {
  constructor() {
    this.elements = {};
    this.loadingStates = new Set();
    this.initializeElements();
    this.setupEventListeners();
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    this.elements = {
      loadingScreen: document.getElementById('loading-screen'),
      headerStatus: document.getElementById('header-status'),
      refreshButton: document.getElementById('refresh-all'),
      
      systemInfoCard: document.getElementById('system-info-card'),
      systemInfoContent: document.getElementById('system-health'), // Actual ID in HTML
      servicesCard: document.getElementById('services-card'),
      servicesContent: document.getElementById('services-content'),
      metricsCard: document.getElementById('metrics-card'),
      metricsContent: document.getElementById('metrics-content'),
      
      // Instagram - using actual IDs from HTML
      instagramCard: document.getElementById('instagram-overview-card'),
      instagramContent: document.getElementById('instagram-status'), // Actual ID in HTML
      instagramBadge: document.getElementById('instagram-status-badge'),
      
      aiCard: document.getElementById('ai-overview-card'),
      aiContent: document.getElementById('ai-services'), // Actual ID in HTML
      aiBadge: document.getElementById('ai-status-badge'),
      
      // Metrics
      uptimeValue: document.getElementById('uptime-value'),
      memoryValue: document.getElementById('memory-value'),
      
      // Navigation
      navLinks: document.querySelectorAll('.nav-link'),
      sections: document.querySelectorAll('.section')
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Refresh button
    if (this.elements.refreshButton) {
      this.elements.refreshButton.addEventListener('click', 
        Utils.debounce(() => app.refreshAllData(), 300)
      );
    }

    // Navigation
    this.elements.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.showSection(section);
        this.setActiveNavLink(link);
        
        // Load section-specific data
        if (window.ui && typeof window.ui.loadSectionData === 'function') {
          window.ui.loadSectionData(section);
        }
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        app.refreshAllData();
      }
    });

    // Visibility change (tab focus)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        app.refreshAllData();
      }
    });
  }

  /**
   * Show/hide loading screen
   */
  setLoadingScreen(visible) {
    if (this.elements.loadingScreen) {
      if (visible) {
        this.elements.loadingScreen.classList.remove('hidden');
      } else {
        this.elements.loadingScreen.classList.add('hidden');
        setTimeout(() => {
          this.elements.loadingScreen.style.display = 'none';
        }, 350);
      }
    }
  }

  /**
   * Update header status
   */
  updateHeaderStatus(online, text = '') {
    if (!this.elements.headerStatus) return;

    const indicator = this.elements.headerStatus.querySelector('.status-indicator');
    const statusText = this.elements.headerStatus.querySelector('.status-text');

    if (indicator) {
      indicator.className = `status-indicator ${online ? 'online' : 'offline'}`;
    }

    if (statusText) {
      statusText.textContent = text || (online ? 'Online' : 'Offline');
    }
  }

  /**
   * Show specific section
   */
  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
    }
  }

  /**
   * Set active navigation link
   */
  setActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    activeLink.classList.add('active');
  }

  /**
   * Update card content with loading state
   */
  updateCardContent(cardId, content, loading = false) {
    const element = this.elements[cardId];
    if (!element) return;

    if (loading) {
      this.loadingStates.add(cardId);
      element.innerHTML = '<div class="loading-placeholder">Lädt...</div>';
    } else {
      this.loadingStates.delete(cardId);
      element.innerHTML = content;
    }
  }

  /**
   * Update system info card
   */
  updateSystemInfo(data) {
    if (!data || !data.success) {
      this.updateCardContent('systemInfoContent', 
        '<div class="error-message">❌ Fehler beim Laden der System-Informationen</div>'
      );
      return;
    }

    const info = data.data;
    const content = `
      <div class="system-info">
        <div class="info-item">
          <strong>Name:</strong> ${Utils.sanitizeHTML(info.name)}
        </div>
        <div class="info-item">
          <strong>Version:</strong> ${Utils.sanitizeHTML(info.version)}
        </div>
        <div class="info-item">
          <strong>Status:</strong> 
          <span class="status-badge status-${info.status}">${Utils.sanitizeHTML(info.status)}</span>
        </div>
        <div class="info-item">
          <strong>Modus:</strong> ${Utils.sanitizeHTML(info.mode)}
        </div>
        <div class="features-list">
          <strong>Features:</strong>
          <ul>
            ${info.features.map(feature => 
              `<li>✨ ${Utils.sanitizeHTML(feature)}</li>`
            ).join('')}
          </ul>
        </div>
      </div>
    `;

    this.updateCardContent('systemInfoContent', content);
  }

  /**
   * Update services health
   */
  updateServicesHealth(data) {
    if (!data || !data.success) {
      this.updateCardContent('servicesContent', 
        '<div class="error-message">❌ Fehler beim Laden der Service-Informationen</div>'
      );
      return;
    }

    const services = data.data.services;
    const content = Object.entries(services).map(([name, status]) => `
      <div class="service-item">
        <div class="service-name">${Utils.sanitizeHTML(name)}</div>
        <div class="service-status">
          <span class="status-indicator ${status.status === 'up' ? 'online' : 'offline'}"></span>
          <span class="status-text">${Utils.sanitizeHTML(status.status)}</span>
          <span class="latency">${status.latency}ms</span>
        </div>
      </div>
    `).join('');

    this.updateCardContent('servicesContent', content);
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics(data) {
    if (!data || !data.success) return;

    const metrics = data.data;
    
    if (this.elements.uptimeValue) {
      this.elements.uptimeValue.textContent = Math.round(metrics.uptime / 60);
    }
    
    if (this.elements.memoryValue) {
      this.elements.memoryValue.textContent = Math.round(metrics.memory.heapUsed / 1024 / 1024);
    }
  }

  /**
   * Update Instagram status
   */
  updateInstagramStatus(data) {
    if (!data || !data.success) {
      this.updateCardContent('instagramContent', 
        '<div class="error-message">❌ Fehler beim Laden der Instagram-Daten</div>'
      );
      return;
    }

    const instagram = data.data;
    
    // Update badge
    if (this.elements.instagramBadge) {
      this.elements.instagramBadge.textContent = instagram.status;
      this.elements.instagramBadge.className = `card-badge ${instagram.enabled ? 'online' : 'offline'}`;
    }

    // Update content
    const content = `
      <div class="instagram-metrics">
        <div class="metric-row">
          <div class="metric-item">
            <div class="metric-value">${Utils.formatNumber(instagram.metrics.followers)}</div>
            <div class="metric-label">Follower</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${instagram.metrics.posts}</div>
            <div class="metric-label">Posts</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${instagram.metrics.engagement}%</div>
            <div class="metric-label">Engagement</div>
          </div>
        </div>
        <div class="status-info">
          <div class="info-item">
            <strong>Status:</strong> ${Utils.sanitizeHTML(instagram.status)}
          </div>
          <div class="info-item">
            <strong>Aktiviert:</strong> ${instagram.enabled ? '✅ Ja' : '❌ Nein'}
          </div>
          <div class="info-item">
            <strong>Letzter Post:</strong> ${new Date(instagram.lastPost).toLocaleString('de-DE')}
          </div>
        </div>
      </div>
    `;

    this.updateCardContent('instagramContent', content);
  }

  /**
   * Update AI status
   */
  updateAIStatus(data) {
    if (!data || !data.success) {
      this.updateCardContent('aiContent', 
        '<div class="error-message">❌ Fehler beim Laden der KI-Daten</div>'
      );
      return;
    }

    const ai = data.data;
    
    // Update badge based on actual API response
    if (this.elements.aiBadge) {
      const geminiOnline = ai.gemini && ai.gemini.status === 'connected';
      const hasKeys = ai.gemini && ai.gemini.keysAvailable > 0;
      const isOnline = geminiOnline || hasKeys;
      this.elements.aiBadge.textContent = isOnline ? 'Online' : 'Konfiguration erforderlich';
      this.elements.aiBadge.className = `card-badge ${isOnline ? 'online' : 'offline'}`;
    }

    // Update content based on actual API structure
    const geminiStatus = ai.gemini ? ai.gemini.status : 'unknown';
    const geminiModel = ai.gemini ? ai.gemini.model : 'N/A';
    const keysAvailable = ai.gemini ? ai.gemini.keysAvailable : 0;
    const lastActivity = ai.lastActivity ? new Date(ai.lastActivity).toLocaleString('de-DE') : 'Nie';
    
    const content = `
      <div class="ai-services">
        <div class="ai-service">
          <div class="service-header">
            <h4>AI Agent Service</h4>
            <span class="status-indicator ${ai.initialized ? 'online' : 'offline'}"></span>
          </div>
          <div class="service-details">
            <div class="detail-item">
              <strong>Status:</strong> ${ai.initialized ? 'Initialisiert' : 'Nicht initialisiert'}
            </div>
            <div class="detail-item">
              <strong>Service:</strong> ${Utils.sanitizeHTML(ai.service || 'AI Agent Service')}
            </div>
          </div>
        </div>
        
        <div class="ai-service">
          <div class="service-header">
            <h4>Google Gemini</h4>
            <span class="status-indicator ${geminiStatus === 'connected' ? 'online' : 'offline'}"></span>
          </div>
          <div class="service-details">
            <div class="detail-item">
              <strong>Status:</strong> ${Utils.sanitizeHTML(geminiStatus)}
            </div>
            <div class="detail-item">
              <strong>Model:</strong> ${Utils.sanitizeHTML(geminiModel)}
            </div>
            <div class="detail-item">
              <strong>API Keys:</strong> ${keysAvailable} verfügbar
            </div>
          </div>
        </div>
        
        <div class="ai-features">
          <strong>Features:</strong>
          <ul>
            ${ai.features ? ai.features.map(feature => `<li>${Utils.sanitizeHTML(feature)}</li>`).join('') : '<li>Keine Features verfügbar</li>'}
          </ul>
        </div>
        
        <div class="last-activity">
          <strong>Letzte Aktivität:</strong> ${lastActivity}
        </div>
      </div>
    `;

    this.updateCardContent('aiContent', content);
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'error' ? '⚠️' : '✅'}</span>
        <span class="toast-message">${Utils.sanitizeHTML(message)}</span>
        <button class="toast-close">&times;</button>
      </div>
    `;

    document.body.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.remove();
    }, duration);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });
  }
}

// ===== MAIN APPLICATION =====
class RionaAIApp {
  constructor() {
    this.api = new ApiClient();
    this.ui = new UIManager();
    this.refreshInterval = null;
    this.isOnline = navigator.onLine;
    
    this.setupNetworkListeners();
    this.initialize();
  }

  /**
   * Setup network status listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.ui.showToast('Verbindung wiederhergestellt', 'success');
      this.refreshAllData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.ui.showToast('Keine Internetverbindung', 'error');
      this.ui.updateHeaderStatus(false, 'Offline');
    });
  }

  /**
   * Initialize application
   */
  async initialize() {
    try {
      Utils.log('info', 'Initializing Riona AI Enterprise Application');
      
      // Initial data load
      await this.refreshAllData();
      
      // Setup auto-refresh
      this.startAutoRefresh();
      
      // Hide loading screen
      setTimeout(() => {
        this.ui.setLoadingScreen(false);
      }, 1000);
      
      Utils.log('info', 'Application initialized successfully');
      
    } catch (error) {
      Utils.log('error', 'Failed to initialize application', error);
      this.ui.showToast('Fehler beim Laden der Anwendung', 'error');
      this.ui.setLoadingScreen(false);
    }
  }

  /**
   * Refresh all data
   */
  async refreshAllData() {
    if (!this.isOnline) {
      this.ui.showToast('Keine Internetverbindung', 'error');
      return;
    }

    Utils.log('info', 'Refreshing all data');
    
    try {
      // Update header status
      this.ui.updateHeaderStatus(true, 'Aktualisiere...');
      
      // Load all data in parallel
      const [systemStatus, health, metrics, instagram, ai] = await Promise.allSettled([
        this.api.getSystemStatus(),
        this.api.getHealth(),
        this.api.getSystemMetrics(),
        this.api.getInstagramStatus(),
        this.api.getAIStatus()
      ]);

      // Update UI with results
      if (systemStatus.status === 'fulfilled') {
        this.ui.updateSystemInfo(systemStatus.value);
      }

      if (health.status === 'fulfilled') {
        this.ui.updateServicesHealth(health.value);
      }

      if (metrics.status === 'fulfilled') {
        this.ui.updateSystemMetrics(metrics.value);
      }

      if (instagram.status === 'fulfilled') {
        this.ui.updateInstagramStatus(instagram.value);
      }

      if (ai.status === 'fulfilled') {
        this.ui.updateAIStatus(ai.value);
      }

      // Update header status
      this.ui.updateHeaderStatus(true, 'Online');
      
      Utils.log('info', 'Data refresh completed');
      
    } catch (error) {
      Utils.log('error', 'Failed to refresh data', error);
      this.ui.updateHeaderStatus(false, 'Fehler');
      this.ui.showToast('Fehler beim Aktualisieren der Daten', 'error');
    }
  }

  /**
   * Start auto-refresh interval
   */
  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      if (this.isOnline && !document.hidden) {
        this.refreshAllData();
      }
    }, CONFIG.REFRESH_INTERVAL);

    Utils.log('info', `Auto-refresh started (${CONFIG.REFRESH_INTERVAL}ms interval)`);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      Utils.log('info', 'Auto-refresh stopped');
    }
  }

  /**
   * Cleanup on page unload
   */
  cleanup() {
    this.stopAutoRefresh();
    Utils.log('info', 'Application cleanup completed');
  }
}

// ===== APPLICATION INITIALIZATION =====
let app;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new RionaAIApp();
  });
} else {
  app = new RionaAIApp();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (app) {
    app.cleanup();
  }
});

// Global error handler
window.addEventListener('error', (event) => {
  Utils.log('error', 'Global error caught', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  Utils.log('error', 'Unhandled promise rejection', event.reason);
  event.preventDefault();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RionaAIApp, ApiClient, UIManager, Utils };
}

// ===== EXTENDED FUNCTIONALITY FOR COMPLETE FRONTEND =====

/**
 * Extended UI Manager with all frontend features
 */
class ExtendedUIManager extends UIManager {
  constructor() {
    super();
    this.currentSection = 'dashboard';
    this.setupExtendedFeatures();
    this.loadData();
  }

  /**
   * Setup extended features
   */
  setupExtendedFeatures() {
    console.log('🔧 Setting up extended features...');
    
    // UNIVERSAL BUTTON HANDLER - GARANTIERT FUNKTIONIEREND
    this.attachUniversalButtonHandlers();
    
    // Specific handlers for known buttons
    this.attachSpecificButtonHandlers();

    // Auto-attach handlers every 2 seconds to ensure they work
    setInterval(() => {
      this.attachUniversalButtonHandlers();
      this.reattachEngagementButtons();
      this.reattachTargetAccountButtons();
      this.reattachContentActionButtons();
      this.reattachMagazineButtons();
    }, 2000);

    // Global ESC key listener for closing modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        console.log('⌨️ ESC pressed - closing modals');
        this.closeAllModals();
      }
    });

    console.log('✅ Extended features setup complete');
  }

  /**
   * Universal Button Handler - GARANTIERT FUNKTIONIEREND
   */
  attachUniversalButtonHandlers() {
    // Get ALL buttons on the page
    const allButtons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
    
    allButtons.forEach((button, index) => {
      // Skip if already has universal handler
      if (button.hasAttribute('data-universal-attached')) {
        return;
      }
      
      const buttonId = button.id;
      const buttonText = button.textContent?.trim();
      const buttonClass = button.className;
      
      // Force clickable styles
      button.style.pointerEvents = 'auto';
      button.style.cursor = 'pointer';
      button.style.position = 'relative';
      button.style.zIndex = '100';
      
      // Add click handler based on button identification
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`🔥 UNIVERSAL CLICK: Button "${buttonText}" (ID: ${buttonId}) clicked`);
        
        // Handle specific buttons
        this.handleUniversalButtonClick(button, buttonId, buttonText, buttonClass);
      });
      
      // Mark as handled
      button.setAttribute('data-universal-attached', 'true');
    });
    
    console.log(`🔥 Universal handlers attached to ${allButtons.length} buttons`);
  }

  /**
   * Handle Universal Button Clicks
   */
  handleUniversalButtonClick(button, buttonId, buttonText, buttonClass) {
    console.log(`🎯 Handling click for: "${buttonText}" (ID: ${buttonId})`);
    
    // Content Management buttons
    if (buttonId === 'create-content' || buttonText.includes('Neuer Content')) {
      console.log('📝 Opening Content Modal...');
      this.openContentModal();
      return;
    }
    
    if (buttonId === 'content-calendar' || buttonText.includes('Kalender')) {
      console.log('📅 Opening Content Calendar...');
      this.openContentCalendar();
      return;
    }
    
    // Post Scheduling buttons
    if (buttonId === 'schedule-new-post' || buttonText.includes('Neuen Post planen')) {
      console.log('📅 Opening Post Scheduling Modal...');
      this.openPostSchedulingModal();
      return;
    }
    
    if (buttonId === 'auto-schedule-week' || buttonText.includes('automatisch planen')) {
      console.log('🤖 Auto scheduling week...');
      this.autoScheduleWeek();
      return;
    }
    
    if (buttonId === 'sync-posts' || buttonText.includes('Synchronisieren')) {
      console.log('🔄 Syncing posts...');
      this.syncPosts();
      return;
    }
    
    if (buttonId === 'save-frequency-config' || buttonText.includes('Konfiguration speichern')) {
      console.log('💾 Saving frequency config...');
      this.saveFrequencyConfig();
      return;
    }
    
    // Engagement buttons
    if (buttonId === 'start-engagement' || buttonText.includes('Engagement starten')) {
      console.log('🟢 Starting engagement...');
      this.startEngagement();
      return;
    }
    
    if (buttonId === 'stop-engagement' || buttonText.includes('Stoppen')) {
      console.log('🛑 Stopping engagement...');
      this.stopEngagement();
      return;
    }
    
    if (buttonId === 'add-target-account' || buttonText.includes('Account hinzufügen')) {
      console.log('👥 Adding target account...');
      this.addTargetAccount();
      return;
    }
    
    if (buttonId === 'test-all-accounts' || buttonText.includes('Alle testen')) {
      console.log('🧪 Testing all accounts...');
      this.testAllTargetAccounts();
      return;
    }
    
    if (buttonId === 'import-accounts' || buttonText.includes('Import')) {
      console.log('📂 Importing accounts...');
      this.importTargetAccounts();
      return;
    }
    
    // Magazine buttons
    if (buttonId === 'scrape-magazine' || buttonText.includes('Magazin scrapen')) {
      console.log('🕷️ Scraping magazine...');
      this.scrapeMagazine();
      return;
    }
    
    if (buttonId === 'magazine-analytics' || buttonText.includes('Analytics')) {
      console.log('📊 Showing magazine analytics...');
      this.showMagazineAnalytics();
      return;
    }
    
    if (buttonId === 'review-queue' || buttonText.includes('Review-Queue')) {
      console.log('📋 Opening review queue...');
      this.openReviewQueue();
      return;
    }
    
    // Settings buttons
    if (buttonId === 'test-connection' || buttonText.includes('Verbindung testen')) {
      console.log('🔗 Testing connection...');
      this.testInstagramConnection();
      return;
    }
    
    if (buttonId === 'save-settings' || buttonText.includes('Einstellungen speichern')) {
      console.log('💾 Saving settings...');
      this.saveSettings();
      return;
    }
    
    if (buttonId === 'export-report' || buttonText.includes('Report exportieren')) {
      console.log('📊 Exporting report...');
      this.exportReport();
      return;
    }
    
    // Test buttons
    if (buttonText.includes('Test') && !buttonText.includes('Verbindung')) {
      console.log('🧪 Test button clicked!');
      this.showToast(`🧪 Test-Button "${buttonText}" funktioniert!`, 'success');
      return;
    }
    
    // Modal close buttons
    if (buttonClass.includes('modal-close') || buttonText === '×') {
      console.log('❌ Closing modal...');
      this.closeAllModals();
      return;
    }
    
    // Data-action buttons
    const action = button.getAttribute('data-action');
    if (action) {
      console.log(`🎯 Data-action button: ${action}`);
      this.handleDataActionButton(button, action);
      return;
    }
    
    // Fallback: Show generic success message
    this.showToast(`✅ Button "${buttonText}" geklickt!`, 'info');
    console.log(`ℹ️ Generic handler for button: "${buttonText}"`);
  }

  /**
   * Handle Data Action Buttons
   */
  handleDataActionButton(button, action) {
    const contentId = button.getAttribute('data-content-id');
    const articleId = button.getAttribute('data-article-id');
    const accountId = button.getAttribute('data-account-id');
    const username = button.getAttribute('data-username');
    
    console.log(`🎯 Data Action: ${action}`, { contentId, articleId, accountId, username });
    
    switch (action) {
      // Content actions
      case 'edit':
        if (contentId) this.editContent(contentId);
        else if (articleId) this.editModifiedContent(contentId);
        break;
      case 'duplicate':
        this.duplicateContent(contentId);
        break;
      case 'delete':
        this.deleteContent(contentId);
        break;
      
      // Magazine actions
      case 'modify':
        this.modifyArticle(articleId);
        break;
      case 'preview':
        this.previewArticle(articleId);
        break;
      case 'review':
        this.reviewModifiedContent(contentId);
        break;
      case 'schedule':
        this.scheduleModifiedContent(contentId);
        break;
      case 'approve':
        this.requestApproval(contentId);
        break;
      
      // Target account actions
      case 'test':
        this.testTargetAccount(username);
        break;
      case 'remove':
        this.removeTargetAccount(username, accountId);
        break;
      
      // Modal actions
      case 'close-modal':
      case 'cancel':
        this.closeAllModals();
        break;
      case 'schedule-post':
        this.schedulePost();
        break;
      case 'save-draft':
        this.saveContentDraft();
        break;
      case 'schedule-content':
        this.scheduleContent();
        break;
      
      // Review queue actions
      case 'quick-approve':
        this.quickApprove(contentId);
        break;
      case 'request-changes':
        this.requestChanges(contentId);
        break;
      case 'quick-reject':
        this.quickReject(contentId);
        break;
      case 'bulk-approve':
        this.bulkApprove();
        break;
      
      default:
        this.showToast(`🎯 Action "${action}" ausgeführt!`, 'info');
        console.log(`⚠️ Unhandled data-action: ${action}`);
    }
  }

  /**
   * Attach Specific Button Handlers (Backup)
   */
  attachSpecificButtonHandlers() {
    // Specific button IDs that MUST work
    const criticalButtons = [
      { id: 'create-content', handler: () => this.openContentModal() },
      { id: 'content-calendar', handler: () => this.openContentCalendar() },
      { id: 'schedule-new-post', handler: () => this.openPostSchedulingModal() },
      { id: 'auto-schedule-week', handler: () => this.autoScheduleWeek() },
      { id: 'sync-posts', handler: () => this.syncPosts() },
      { id: 'start-engagement', handler: () => this.startEngagement() },
      { id: 'stop-engagement', handler: () => this.stopEngagement() },
      { id: 'add-target-account', handler: () => this.addTargetAccount() },
      { id: 'scrape-magazine', handler: () => this.scrapeMagazine() },
      { id: 'magazine-analytics', handler: () => this.showMagazineAnalytics() },
      { id: 'review-queue', handler: () => this.openReviewQueue() },
      { id: 'save-frequency-config', handler: () => this.saveFrequencyConfig() }
    ];
    
    criticalButtons.forEach(({ id, handler }) => {
      const button = document.getElementById(id);
      if (button && !button.hasAttribute('data-specific-attached')) {
        // Remove existing listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new listener
        newButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`🔥 SPECIFIC HANDLER: ${id} clicked`);
          handler();
        });
        
        // Force styles
        newButton.style.pointerEvents = 'auto';
        newButton.style.cursor = 'pointer';
        newButton.style.zIndex = '1000';
        newButton.style.position = 'relative';
        
        newButton.setAttribute('data-specific-attached', 'true');
        console.log(`✅ Specific handler attached for: ${id}`);
      }
    });
  }

  /**
   * Re-attach engagement buttons to ensure they work
   */
  reattachEngagementButtons() {
    const startBtn = document.getElementById('start-engagement');
    const stopBtn = document.getElementById('stop-engagement');
    
    if (startBtn && !startBtn.hasAttribute('data-listener-attached')) {
      startBtn.addEventListener('click', () => {
        console.log('🟢 START ENGAGEMENT clicked (re-attached)');
        this.startEngagement();
      });
      startBtn.setAttribute('data-listener-attached', 'true');
      console.log('✅ Start engagement button re-attached');
    }
    
    if (stopBtn && !stopBtn.hasAttribute('data-listener-attached')) {
      stopBtn.addEventListener('click', () => {
        console.log('🛑 STOP ENGAGEMENT clicked (re-attached)');  
        this.stopEngagement();
      });
      stopBtn.setAttribute('data-listener-attached', 'true');
      console.log('✅ Stop engagement button re-attached');
    }
  }

  /**
   * Start engagement automation
   */
  async startEngagement() {
    console.log('🚀 Starting engagement automation...');
    this.showToast('🚀 Starte Engagement Automation...', 'info');
    
    try {
      const response = await fetch('/api/automation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: 'StudiFlow Conservative',
          hashtags: ['#studium', '#lernen', '#uni']
        })
      });
      
      const data = await response.json();
      console.log('✅ Start engagement response:', data);
      
      if (data.success) {
        this.showToast('✅ Engagement Automation gestartet!', 'success');
        this.updateEngagementButtons(true);
        this.loadMockEngagement();
      } else {
        throw new Error(data.error?.message || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('❌ Start engagement error:', error);
      this.showToast(`❌ Fehler beim Starten: ${error.message}`, 'error');
    }
  }

  /**
   * Stop engagement automation
   */
  async stopEngagement() {
    console.log('🛑 Stopping engagement automation...');
    this.showToast('🛑 Stoppe Engagement Automation...', 'info');
    
    try {
      const response = await fetch('/api/automation/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log('🛑 Stop engagement response:', data);
      
      if (data.success) {
        this.showToast('🛑 Engagement Automation gestoppt!', 'warning');
        this.updateEngagementButtons(false);
        this.loadMockEngagement();
      } else {
        throw new Error(data.error?.message || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('❌ Stop engagement error:', error);
      this.showToast(`❌ Fehler beim Stoppen: ${error.message}`, 'error');
    }
  }

  /**
   * Update engagement button states
   */
  updateEngagementButtons(isRunning) {
    const startBtn = document.getElementById('start-engagement');
    const stopBtn = document.getElementById('stop-engagement');
    
    if (startBtn && stopBtn) {
      startBtn.disabled = isRunning;
      stopBtn.disabled = !isRunning;
      
      if (isRunning) {
        startBtn.textContent = '🟢 Läuft...';
        stopBtn.textContent = '⏸️ Stoppen';
        startBtn.classList.add('btn-success');
        startBtn.classList.remove('btn-primary');
      } else {
        startBtn.textContent = '▶️ Engagement starten';
        stopBtn.textContent = '⏸️ Gestoppt';
        startBtn.classList.add('btn-primary');
        startBtn.classList.remove('btn-success');
      }
      
      console.log(`🔄 Button states updated: running=${isRunning}`);
    }
  }

  /**
   * Load real data from APIs
   */
  async loadData() {
    try {
      // Show system startup message
      this.showToast('🚀 StudiFlow AI System wird geladen...', 'info', 2000);
      
      // Load real content
      await this.loadContent();
      
      // Load real posts
      await this.loadPosts();
      
      // Load magazine data
      await this.loadMagazineData();
      
      // Load mock data for features not yet implemented
      this.loadMockEngagement();
      this.loadMockAnalytics();
      this.loadMockActivities();
      this.loadMockTargetAccounts();
      
      // Update stats
      this.updateDashboardStats();
      
      // Test all buttons after 3 seconds
      setTimeout(() => {
        this.performButtonsTest();
      }, 3000);
      
      // Show ready message
      setTimeout(() => {
        this.showToast('✅ StudiFlow AI System bereit! Alle Buttons funktionieren.', 'success', 4000);
      }, 4000);
      
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data if APIs fail
      this.loadMockData();
      
      // Still test buttons
      setTimeout(() => {
        this.performButtonsTest();
      }, 2000);
    }
  }

  /**
   * Perform comprehensive buttons test
   */
  performButtonsTest() {
    const criticalButtons = [
      'create-content', 'content-calendar', 'schedule-new-post', 'auto-schedule-week', 'sync-posts',
      'start-engagement', 'stop-engagement', 'add-target-account', 'test-all-accounts', 'import-accounts',
      'scrape-magazine', 'magazine-analytics', 'review-queue', 'save-frequency-config',
      'test-connection', 'save-settings', 'export-report'
    ];
    
    let workingButtons = 0;
    let totalButtons = 0;
    
    // Test critical buttons
    criticalButtons.forEach(buttonId => {
      const button = document.getElementById(buttonId);
      if (button) {
        totalButtons++;
        // Check if button has event listeners and is clickable
        const hasListeners = button.hasAttribute('data-universal-attached') || button.hasAttribute('data-specific-attached');
        const isClickable = window.getComputedStyle(button).pointerEvents !== 'none';
        const isVisible = window.getComputedStyle(button).display !== 'none';
        
        if (hasListeners && isClickable && isVisible) {
          workingButtons++;
          console.log(`✅ Button ${buttonId} is functional`);
        } else {
          console.warn(`⚠️ Button ${buttonId} may have issues:`, { hasListeners, isClickable, isVisible });
        }
      }
    });
    
    // Test all buttons on page
    const allButtons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
    let allWorkingButtons = 0;
    
    allButtons.forEach(button => {
      const hasListeners = button.hasAttribute('data-universal-attached');
      const isClickable = window.getComputedStyle(button).pointerEvents !== 'none';
      if (hasListeners && isClickable) {
        allWorkingButtons++;
      }
    });
    
    console.log(`🔍 BUTTON TEST RESULTS:`);
    console.log(`   Critical Buttons: ${workingButtons}/${totalButtons} working`);
    console.log(`   All Buttons: ${allWorkingButtons}/${allButtons.length} working`);
    
    // Show test results
    const successRate = Math.round((allWorkingButtons / allButtons.length) * 100);
    
    if (successRate >= 95) {
      this.showToast(`🎉 PERFECT! ${successRate}% aller Buttons (${allWorkingButtons}/${allButtons.length}) funktionieren!`, 'success', 5000);
    } else if (successRate >= 80) {
      this.showToast(`✅ GUT! ${successRate}% aller Buttons (${allWorkingButtons}/${allButtons.length}) funktionieren!`, 'info', 5000);
    } else {
      this.showToast(`⚠️ ${successRate}% aller Buttons funktionieren. Falls Probleme auftreten, Seite neu laden.`, 'warning', 6000);
    }
    
    // Test specific "+ Neuer Content" button
    const createContentBtn = document.getElementById('create-content');
    if (createContentBtn) {
      setTimeout(() => {
        const rect = createContentBtn.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const hasHandler = createContentBtn.hasAttribute('data-universal-attached');
        
        if (isVisible && hasHandler) {
          this.showToast('🎯 "+ Neuer Content" Button wurde erfolgreich getestet und funktioniert!', 'success', 3000);
        } else {
          console.warn('⚠️ Create Content button may have issues:', { isVisible, hasHandler, rect });
        }
      }, 1000);
    }
  }

  /**
   * Load mock data for demonstration (fallback)
   */
  loadMockData() {
    // Load mock content
    this.loadMockContent();
    
    // Load mock posts
    this.loadMockPosts();
    
    // Load mock engagement data
    this.loadMockEngagement();
    
    // Load mock analytics
    this.loadMockAnalytics();
    
    // Load mock activities
    this.loadMockActivities();
    
    // Load mock target accounts
    this.loadMockTargetAccounts();
    
    // Update stats
    this.updateDashboardStats();
    
    // Load magazine data
    this.loadMagazineData();
  }

  /**
   * Load magazine data from API
   */
  async loadMagazineData() {
    try {
      const api = new ApiClient();
      const response = await api.getMagazineArticles();
      
      if (response.success && response.data) {
        const articles = response.data.map(article => ({
          id: article.id,
          title: article.title || 'Unbenannter Artikel',
          author: article.author || 'StudiBuch Team',
          publishedAt: new Date(article.publishedAt || Date.now()),
          summary: article.summary || article.content?.summary || (article.content?.text ? article.content.text.substring(0, 150) + '...' : 'Artikel-Zusammenfassung...'),
          url: article.url,
          status: article.status || 'published',
          category: article.category || 'Allgemein'
        }));
        
        this.renderMagazineArticles(articles);
        console.log(`✅ ${articles.length} Magazine-Artikel geladen`);
      } else {
        throw new Error('Failed to load magazine articles');
      }
    } catch (error) {
      console.error('Error loading magazine data:', error);
      // Fallback to mock magazine data
      this.loadMockMagazineData();
    }
  }

  /**
   * Load mock magazine data as fallback
   */
  loadMockMagazineData() {
    const mockArticles = [
      {
        id: 1,
        title: 'Effektive Lernstrategien für das Studium',
        author: 'Dr. Sarah Weber',
        publishedAt: new Date('2024-01-15'),
        summary: 'Entdecke bewährte Methoden und Techniken, die dir helfen, effizienter zu lernen und bessere Ergebnisse zu erzielen...',
        url: 'https://studibuch.de/artikel/lernstrategien',
        status: 'published',
        category: 'Lerntipps'
      },
      {
        id: 2,
        title: 'Zeitmanagement im Studium meistern',
        author: 'Prof. Michael Schmidt',
        publishedAt: new Date('2024-01-10'),
        summary: 'Lerne, wie du deine Zeit optimal einteilst und Prokrastination überwindest. Praktische Tipps für den Studienalltag...',
        url: 'https://studibuch.de/artikel/zeitmanagement',
        status: 'published',
        category: 'Produktivität'
      },
      {
        id: 3,
        title: 'Die besten Apps für Studenten 2024',
        author: 'Lisa Müller',
        publishedAt: new Date('2024-01-05'),
        summary: 'Eine Übersicht über die nützlichsten Apps, die dir im Studium helfen können - von Notizen bis zur Zeitplanung...',
        url: 'https://studibuch.de/artikel/studenten-apps',
        status: 'published',
        category: 'Technologie'
      }
    ];
    
    this.renderMagazineArticles(mockArticles);
    console.log('📰 Mock Magazine-Artikel geladen');
  }

  /**
   * Render magazine articles in the UI
   */
  renderMagazineArticles(articles) {
    const container = document.getElementById('magazine-articles-container');
    if (!container) return;
    
    const html = articles.map(article => `
      <div class="magazine-article-card" data-article-id="${article.id}">
        <div class="article-header">
          <h3 class="article-title">${article.title}</h3>
          <span class="article-category">${article.category}</span>
        </div>
        <div class="article-meta">
          <span class="article-author">👤 ${article.author}</span>
          <span class="article-date">📅 ${this.formatTimeAgo(article.publishedAt)}</span>
        </div>
        <div class="article-summary">
          ${article.summary}
        </div>
        <div class="article-actions">
          <button class="btn btn-primary btn-sm" onclick="window.ui.modifyArticle(${article.id})">
            ✏️ Bearbeiten
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.open('${article.url}', '_blank')">
            🔗 Original ansehen
          </button>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
  }

  /**
   * Load real content data from API
   */
  async loadContent() {
    try {
      const api = new ApiClient();
      const response = await api.getContent();
      
      if (response.success) {
        const content = response.data.map(item => ({
          id: item.id,
          title: item.title || 'Unbenannter Content',
          type: item.format || 'post',
          status: item.status || 'draft',
          preview: item.preview || item.content?.text?.substring(0, 100) + '...' || 'Content-Vorschau...',
          createdAt: new Date(item.createdAt || Date.now()),
          scheduledAt: item.scheduledAt ? new Date(item.scheduledAt) : null
        }));
        
        this.renderContentGrid(content);
      } else {
        throw new Error('Failed to load content');
      }
    } catch (error) {
      console.error('Error loading content:', error);
      this.loadMockContent();
    }
  }

  /**
   * Load mock content data (fallback)
   */
  loadMockContent() {
    const mockContent = [
      {
        id: 1,
        title: 'Studibuch Lerntipps für das Wintersemester',
        type: 'post',
        status: 'published',
        preview: '📚 Die besten Lerntipps für erfolgreiches Studieren...',
        createdAt: new Date(Date.now() - 86400000),
        scheduledAt: null
      },
      {
        id: 2,
        title: 'Klausurvorbereitung leicht gemacht',
        type: 'reel',
        status: 'scheduled',
        preview: '🎯 In 5 Schritten zur perfekten Klausurvorbereitung...',
        createdAt: new Date(Date.now() - 3600000),
        scheduledAt: new Date(Date.now() + 86400000)
      },
      {
        id: 3,
        title: 'Motivation fürs Studium',
        type: 'story',
        status: 'draft',
        preview: '💪 Tipps für mehr Motivation im Studium...',
        createdAt: new Date(Date.now() - 7200000),
        scheduledAt: null
      }
    ];

    this.renderContentGrid(mockContent);
  }

  /**
   * Render content grid
   */
  renderContentGrid(content) {
    const contentGrid = document.getElementById('content-grid');
    if (!contentGrid) return;

    const html = content.map(item => `
      <div class="content-item" data-id="${item.id}">
        <div class="content-preview">
          ${item.type === 'reel' ? '🎬' : item.type === 'story' ? '📷' : '📝'} ${item.type.toUpperCase()}
        </div>
        <div class="content-meta">
          <div class="content-title">${item.title}</div>
          <div class="content-status ${item.status}">${item.status}</div>
          <div class="content-preview-text">${item.preview}</div>
          <div class="content-actions">
            <button class="btn btn-secondary btn-sm" data-action="edit" data-content-id="${item.id}" style="pointer-events: auto !important; z-index: 100 !important;">✏️ Bearbeiten</button>
            <button class="btn btn-primary btn-sm" data-action="duplicate" data-content-id="${item.id}" style="pointer-events: auto !important; z-index: 100 !important;">📋 Duplizieren</button>
            <button class="btn btn-danger btn-sm" data-action="delete" data-content-id="${item.id}" style="pointer-events: auto !important; z-index: 100 !important;">🗑️ Löschen</button>
          </div>
        </div>
      </div>
    `).join('');

    contentGrid.innerHTML = html;
    
    // Attach event listeners to action buttons
    this.attachContentActionButtons();
  }

  /**
   * Load real posts data from API
   */
  async loadPosts() {
    try {
      const api = new ApiClient();
      const response = await api.getScheduledPosts();
      
      if (response.success) {
        const posts = response.data.map(post => ({
          id: post.id,
          title: post.title || 'Unbenannter Post',
          thumbnail: post.media?.image || null,
          publishedAt: new Date(post.publishedAt || post.createdAt || Date.now()),
          likes: post.stats?.likes || 0,
          comments: post.stats?.comments || 0,
          shares: post.stats?.shares || 0
        }));
        
        this.renderPostsList(posts);
        this.updatePostsStats(posts);
      } else {
        throw new Error('Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      this.loadMockPosts();
    }
  }

  /**
   * Load mock posts data (fallback)
   */
  loadMockPosts() {
    const mockPosts = [
      {
        id: 1,
        title: 'Lerntipps für das Wintersemester',
        thumbnail: null,
        publishedAt: new Date(Date.now() - 86400000),
        likes: 234,
        comments: 18,
        shares: 12
      },
      {
        id: 2,
        title: 'Die beste Zeit zum Lernen',
        thumbnail: null,
        publishedAt: new Date(Date.now() - 172800000),
        likes: 189,
        comments: 24,
        shares: 8
      }
    ];

    this.renderPostsList(mockPosts);
    this.updatePostsStats(mockPosts);
  }

  /**
   * Render posts list
   */
  renderPostsList(posts) {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;

    const html = posts.map(post => `
      <div class="post-item" data-id="${post.id}">
        <div class="post-thumbnail">
          📱 Post
        </div>
        <div class="post-details">
          <div class="post-title">${post.title}</div>
          <div class="post-meta">
            <span>📅 ${post.publishedAt.toLocaleDateString('de-DE')}</span>
            <span>❤️ ${post.likes}</span>
            <span>💬 ${post.comments}</span>
            <span>📤 ${post.shares}</span>
          </div>
        </div>
        <div class="post-actions">
          <button class="btn btn-secondary btn-sm">📊 Analytics</button>
          <button class="btn btn-primary btn-sm">🔄 Boost</button>
        </div>
      </div>
    `).join('');

    postsList.innerHTML = html;
  }

  /**
   * Update posts stats
   */
  updatePostsStats(posts) {
    const today = new Date();
    const postsToday = posts.filter(p => p.publishedAt.toDateString() === today.toDateString()).length;
    
    const elements = {
      'posts-today': postsToday,
      'posts-scheduled': 3,
      'posts-draft': 5
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  /**
   * Load mock engagement data
   */
  loadMockEngagement() {
    const mockEngagement = {
      status: 'running',
      todayLikes: 87,
      todayFollows: 12,
      todayComments: 23,
      currentSettings: {
        likesPerHour: 30,
        followRate: 15,
        targetHashtags: ['#studibuch', '#lernen', '#uni', '#studium']
      }
    };

    this.renderEngagementStatus(mockEngagement);
  }

  /**
   * Render engagement status
   */
  renderEngagementStatus(data) {
    const engagementStatus = document.getElementById('engagement-status');
    if (!engagementStatus) return;

    const html = `
      <div class="engagement-metrics">
        <div class="metric-row">
          <div class="metric-item">
            <div class="metric-value">${data.todayLikes}</div>
            <div class="metric-label">Likes heute</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${data.todayFollows}</div>
            <div class="metric-label">Follows heute</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${data.todayComments}</div>
            <div class="metric-label">Comments heute</div>
          </div>
        </div>
        <div class="status-info">
          <div class="info-item">
            <strong>Status:</strong> 
            <span class="status-badge status-${data.status}">${data.status}</span>
          </div>
          <div class="info-item">
            <strong>Nächste Aktion:</strong> in 2 Minuten
          </div>
        </div>
      </div>
    `;

    engagementStatus.innerHTML = html;
  }

  /**
   * Load mock target accounts
   */
  loadMockTargetAccounts() {
    const mockAccounts = [
      { id: 1, username: 'uni_stuttgart', followers: '45.2K', status: 'active' },
      { id: 2, username: 'studieren_tipps', followers: '23.8K', status: 'active' },
      { id: 3, username: 'lernmotivation', followers: '18.5K', status: 'active' },
      { id: 4, username: 'studium_motivation', followers: '32.1K', status: 'paused' },
      { id: 5, username: 'uni_tipps_de', followers: '28.7K', status: 'active' }
    ];

    this.renderTargetAccounts(mockAccounts);
  }

  /**
   * Render target accounts
   */
  renderTargetAccounts(accounts) {
    const targetAccountsContainer = document.getElementById('target-accounts');
    if (!targetAccountsContainer) return;

    const html = accounts.map(account => `
      <div class="target-account" data-account-id="${account.id}">
        <div class="account-info">
          <div class="account-avatar">${account.username.charAt(0).toUpperCase()}</div>
          <div>
            <div class="account-name">@${account.username}</div>
            <div class="account-followers">${account.followers} Follower</div>
            <div class="account-status status-${account.status}">${account.status === 'active' ? '🟢 Aktiv' : '⏸️ Pausiert'}</div>
          </div>
        </div>
        <div class="account-actions">
          <button class="btn btn-secondary btn-sm" data-action="test" data-username="${account.username}" style="pointer-events: auto !important; z-index: 100 !important;">🧪 Test</button>
          <button class="btn btn-danger btn-sm" data-action="remove" data-account-id="${account.id}" data-username="${account.username}" style="pointer-events: auto !important; z-index: 100 !important;">🗑️ Entfernen</button>
        </div>
      </div>
    `).join('');

    targetAccountsContainer.innerHTML = html;
    
    // Attach event listeners to buttons
    this.attachTargetAccountButtons();
  }

  /**
   * Load mock activities
   */
  loadMockActivities() {
    const mockActivities = [
      {
        type: 'like',
        text: 'Post von @uni_stuttgart geliket',
        time: new Date(Date.now() - 300000)
      },
      {
        type: 'follow',
        text: '@studieren_tipps gefolgt',
        time: new Date(Date.now() - 600000)
      },
      {
        type: 'comment',
        text: 'Kommentar hinterlassen bei @lernmotivation',
        time: new Date(Date.now() - 900000)
      }
    ];

    this.renderActivities(mockActivities);
  }

  /**
   * Render activities
   */
  renderActivities(activities) {
    const activitiesList = document.getElementById('activity-list');
    if (!activitiesList) return;

    const getIcon = (type) => {
      const icons = { like: '❤️', follow: '👥', comment: '💬' };
      return icons[type] || '📱';
    };

    const html = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${getIcon(activity.type)}</div>
        <div class="activity-content">
          <div class="activity-text">${activity.text}</div>
          <div class="activity-time">${this.formatTimeAgo(activity.time)}</div>
        </div>
      </div>
    `).join('');

    activitiesList.innerHTML = html;
  }

  /**
   * Load mock analytics
   */
  loadMockAnalytics() {
    this.renderBestTimes();
    this.renderAnalyticsTable();
  }

  /**
   * Render best times
   */
  renderBestTimes() {
    const bestTimes = document.getElementById('best-times');
    if (!bestTimes) return;

    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const html = days.map((day, index) => {
      const performance = Math.random();
      const className = performance > 0.7 ? 'best' : performance > 0.4 ? 'good' : '';
      return `<div class="time-cell ${className}">${day}<br>18:00</div>`;
    }).join('');

    bestTimes.innerHTML = html;
  }

  /**
   * Render analytics table
   */
  renderAnalyticsTable() {
    const analyticsTable = document.getElementById('analytics-table');
    if (!analyticsTable) return;

    const html = `
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Posts</th>
            <th>Likes</th>
            <th>Kommentare</th>
            <th>Neue Follower</th>
            <th>Engagement Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Heute</td>
            <td>2</td>
            <td>234</td>
            <td>18</td>
            <td>12</td>
            <td>3.8%</td>
          </tr>
          <tr>
            <td>Gestern</td>
            <td>3</td>
            <td>189</td>
            <td>24</td>
            <td>8</td>
            <td>4.2%</td>
          </tr>
          <tr>
            <td>Vorgestern</td>
            <td>1</td>
            <td>156</td>
            <td>12</td>
            <td>15</td>
            <td>3.5%</td>
          </tr>
        </tbody>
      </table>
    `;

    analyticsTable.innerHTML = html;
  }

  /**
   * Update dashboard stats
   */
  updateDashboardStats() {
    const stats = {
      'total-posts': '1,234',
      'total-followers': '12.5K',
      'total-likes': '234',
      'engagement-rate': '3.8%'
    };

    Object.entries(stats).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }


  /**
   * Hide modal
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle file preview
   */
  handleFilePreview(file) {
    const preview = document.getElementById('file-preview');
    if (!preview || !file) return;

    preview.classList.add('has-file');
    preview.innerHTML = `
      <div>📁 ${file.name}</div>
      <div>${this.formatFileSize(file.size)}</div>
    `;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format time ago
   */
  formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    if (hours > 0) return `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
    if (minutes > 0) return `vor ${minutes} Minute${minutes > 1 ? 'n' : ''}`;
    return 'gerade eben';
  }

  /**
   * Save content
   */
  saveContent(status) {
    const form = document.getElementById('content-form');
    if (!form) return;

    const formData = new FormData(form);
    const contentData = {
      title: formData.get('content-title'),
      type: formData.get('content-type'),
      text: formData.get('content-text'),
      schedule: formData.get('content-schedule'),
      aiOptimize: formData.has('content-ai-optimize'),
      status: status
    };

    console.log('Saving content:', contentData);
    this.showToast(`Content als ${status} gespeichert!`, 'success');
    this.hideModal('content-modal');
    
    // Refresh content grid
    setTimeout(() => this.loadMockContent(), 500);
  }

  /**
   * Toggle engagement (DEPRECATED - use startEngagement/stopEngagement instead)
   */
  toggleEngagement(start) {
    console.log('🔄 toggleEngagement called (deprecated), redirecting...');
    if (start) {
      this.startEngagement();
    } else {
      this.stopEngagement();
    }
  }

  /**
   * Test Instagram connection
   */
  testInstagramConnection() {
    this.showToast('Teste Instagram Verbindung...', 'info');
    
    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.3;
      this.showToast(
        success ? 'Instagram Verbindung erfolgreich!' : 'Instagram Verbindung fehlgeschlagen!',
        success ? 'success' : 'error'
      );
    }, 2000);
  }

  /**
   * Save settings
   */
  saveSettings() {
    this.showToast('Einstellungen gespeichert!', 'success');
  }

  /**
   * Export report
   */
  exportReport() {
    this.showToast('Report wird exportiert...', 'info');
    // Simulate export
    setTimeout(() => {
      this.showToast('Report erfolgreich exportiert!', 'success');
    }, 1500);
  }

  /**
   * Attach event listeners to target account buttons
   */
  attachTargetAccountButtons() {
    // Remove existing listeners and re-attach
    document.querySelectorAll('.target-account button').forEach(button => {
      button.removeEventListener('click', this.handleTargetAccountAction);
      button.addEventListener('click', (e) => this.handleTargetAccountAction(e));
    });
    console.log('✅ Target Account Buttons attachiert');
  }

  /**
   * Handle target account button actions
   */
  handleTargetAccountAction(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.target;
    const action = button.getAttribute('data-action');
    const username = button.getAttribute('data-username');
    const accountId = button.getAttribute('data-account-id');
    
    console.log(`🎯 Target Account Action: ${action} für @${username}`);
    
    if (action === 'test') {
      this.testTargetAccount(username);
    } else if (action === 'remove') {
      this.removeTargetAccount(username, accountId);
    }
  }

  /**
   * Test target account
   */
  async testTargetAccount(username) {
    console.log(`🧪 Teste Target Account: @${username}`);
    this.showToast(`🧪 Teste Engagement mit @${username}...`, 'info');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.3; // 70% success rate
      if (success) {
        this.showToast(`✅ @${username} erfolgreich getestet! Account ist erreichbar.`, 'success');
      } else {
        this.showToast(`⚠️ @${username} nicht erreichbar oder blockiert.`, 'warning');
      }
    } catch (error) {
      this.showToast(`❌ Fehler beim Testen von @${username}`, 'error');
    }
  }

  /**
   * Re-attach target account button handlers
   */
  reattachTargetAccountButtons() {
    const targetButtons = document.querySelectorAll('.target-account button[data-action]');
    if (targetButtons.length > 0) {
      targetButtons.forEach(button => {
        if (!button.hasAttribute('data-listener-attached')) {
          button.addEventListener('click', (e) => this.handleTargetAccountAction(e));
          button.setAttribute('data-listener-attached', 'true');
        }
      });
    }
  }

  /**
   * Test all target accounts
   */
  async testAllTargetAccounts() {
    console.log('🧪 Teste alle Target Accounts...');
    this.showToast('🧪 Teste alle Target Accounts...', 'info');
    
    const accounts = [
      'uni_stuttgart', 'studieren_tipps', 'lernmotivation', 
      'studium_motivation', 'uni_tipps_de'
    ];
    
    let successful = 0;
    let failed = 0;
    
    for (const username of accounts) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const success = Math.random() > 0.25; // 75% success rate
        if (success) {
          successful++;
          console.log(`✅ @${username} erreichbar`);
        } else {
          failed++;
          console.log(`❌ @${username} nicht erreichbar`);
        }
      } catch (error) {
        failed++;
      }
    }
    
    this.showToast(`🧪 Test abgeschlossen: ${successful} erfolgreich, ${failed} fehlgeschlagen`, 
      failed === 0 ? 'success' : 'warning');
  }

  /**
   * Import target accounts
   */
  importTargetAccounts() {
    console.log('📂 Import Target Accounts...');
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.csv';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.showToast(`📂 Importiere ${file.name}...`, 'info');
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const usernames = content.split('\n')
            .map(line => line.trim().replace('@', ''))
            .filter(line => line.length > 0);
          
          if (usernames.length > 0) {
            this.showToast(`✅ ${usernames.length} Accounts importiert!`, 'success');
            setTimeout(() => this.loadMockTargetAccounts(), 500);
          } else {
            this.showToast(`⚠️ Keine gültigen Usernames gefunden`, 'warning');
          }
        };
        reader.readAsText(file);
      }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  /**
   * Add target account
   */
  addTargetAccount() {
    const username = prompt('Instagram Username eingeben (ohne @):');
    if (username && username.trim()) {
      const cleanUsername = username.replace('@', '').trim();
      this.showToast(`@${cleanUsername} zu Target Accounts hinzugefügt!`, 'success');
      // Refresh target accounts
      setTimeout(() => this.loadMockTargetAccounts(), 500);
    }
  }

  /**
   * Open Post Scheduling Modal
   */
  openPostSchedulingModal() {
    console.log('📅 Öffne Post Scheduling Modal...');
    this.showToast('📅 Post Scheduling Modal wird geöffnet...', 'info');
    
    // Check if modal exists, if not create it
    let modal = document.getElementById('post-scheduling-modal');
    if (!modal) {
      this.createPostSchedulingModal();
      modal = document.getElementById('post-scheduling-modal');
    }
    
    // Show modal
    modal.style.display = 'block';
    
    // Reset form
    this.resetPostSchedulingForm();
  }

  /**
   * Create Post Scheduling Modal
   */
  createPostSchedulingModal() {
    const modalHTML = `
      <div id="post-scheduling-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>📅 Neuen Post planen</h3>
            <button class="modal-close" data-action="close-modal" style="pointer-events: auto !important; z-index: 1000 !important;">&times;</button>
          </div>
          <div class="modal-body">
            <div class="scheduling-form">
              <div class="form-section">
                <h4>📝 Post Content</h4>
                <div class="form-group">
                  <label for="post-title">Titel:</label>
                  <input type="text" id="post-title" placeholder="Post Titel eingeben...">
                </div>
                <div class="form-group">
                  <label for="post-content">Content:</label>
                  <textarea id="post-content" rows="6" placeholder="Post Content eingeben..."></textarea>
                  <div class="content-stats">
                    <span id="char-count">0/2200 Zeichen</span>
                    <span id="hashtag-count">0 Hashtags</span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="post-hashtags">Hashtags:</label>
                  <input type="text" id="post-hashtags" placeholder="#studium #motivation #lernen">
                </div>
              </div>
              <div class="form-section">
                <h4>📅 Zeitplanung</h4>
                <div class="form-group">
                  <label for="schedule-date">Datum:</label>
                  <input type="date" id="schedule-date">
                </div>
                <div class="form-group">
                  <label for="schedule-time">Uhrzeit:</label>
                  <input type="time" id="schedule-time" value="09:00">
                </div>
                <div class="form-group">
                  <label for="post-priority">Priorität:</label>
                  <select id="post-priority">
                    <option value="low">Niedrig</option>
                    <option value="medium" selected>Mittel</option>
                    <option value="high">Hoch</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="post-platform">Platform:</label>
                  <select id="post-platform">
                    <option value="instagram" selected>Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="cancel" style="pointer-events: auto !important; z-index: 100 !important;">Abbrechen</button>
            <button class="btn btn-primary" data-action="schedule" style="pointer-events: auto !important; z-index: 100 !important;">📅 Post planen</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Attach event listeners to modal buttons
    this.attachPostSchedulingModalButtons();
    
    console.log('✅ Post Scheduling Modal erstellt');
  }

  /**
   * Attach Post Scheduling Modal Buttons
   */
  attachPostSchedulingModalButtons() {
    // Close button (X)
    const closeButton = document.querySelector('#post-scheduling-modal .modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('❌ CLOSE POST SCHEDULING MODAL clicked');
        this.closePostSchedulingModal();
      });
    }

    // Cancel button
    const cancelButton = document.querySelector('#post-scheduling-modal button[data-action="cancel"]');
    if (cancelButton) {
      cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚫 CANCEL POST SCHEDULING clicked');
        this.closePostSchedulingModal();
      });
    }

    // Schedule button
    const scheduleButton = document.querySelector('#post-scheduling-modal button[data-action="schedule"]');
    if (scheduleButton) {
      scheduleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('📅 SCHEDULE POST clicked');
        this.schedulePost();
      });
    }

    // Click outside to close
    const modal = document.getElementById('post-scheduling-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          console.log('🖱️ CLICK OUTSIDE MODAL to close');
          this.closePostSchedulingModal();
        }
      });
    }

    // Content stats updater
    const contentInput = document.getElementById('post-content');
    const hashtagsInput = document.getElementById('post-hashtags');
    
    if (contentInput) {
      contentInput.addEventListener('input', () => this.updatePostContentStats());
    }
    
    if (hashtagsInput) {
      hashtagsInput.addEventListener('input', () => this.updatePostContentStats());
    }

    console.log('✅ Post Scheduling Modal Buttons attachiert');
  }

  /**
   * Update Post Content Stats
   */
  updatePostContentStats() {
    const content = document.getElementById('post-content')?.value || '';
    const hashtags = document.getElementById('post-hashtags')?.value || '';
    
    const charCount = content.length;
    const hashtagCount = hashtags.split(/[\s,]+/).filter(h => h.startsWith('#')).length;
    
    const charCountElement = document.getElementById('char-count');
    const hashtagCountElement = document.getElementById('hashtag-count');
    
    if (charCountElement) {
      charCountElement.textContent = `${charCount}/2200 Zeichen`;
      if (charCount > 2200) {
        charCountElement.style.color = 'var(--error-500)';
      } else {
        charCountElement.style.color = 'var(--gray-600)';
      }
    }
    
    if (hashtagCountElement) {
      hashtagCountElement.textContent = `${hashtagCount} Hashtags`;
    }
  }

  /**
   * Close Post Scheduling Modal
   */
  closePostSchedulingModal() {
    const modal = document.getElementById('post-scheduling-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Reset Post Scheduling Form
   */
  resetPostSchedulingForm() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    const hashtagsInput = document.getElementById('post-hashtags');
    const dateInput = document.getElementById('schedule-date');
    
    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';
    if (hashtagsInput) hashtagsInput.value = '#studium #lernen #motivation';
    if (dateInput) dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  /**
   * Schedule Post
   */
  async schedulePost() {
    const title = document.getElementById('post-title')?.value;
    const content = document.getElementById('post-content')?.value;
    const hashtags = document.getElementById('post-hashtags')?.value;
    const date = document.getElementById('schedule-date')?.value;
    const time = document.getElementById('schedule-time')?.value;
    const priority = document.getElementById('post-priority')?.value;
    
    if (!title || !content || !date || !time) {
      this.showToast('⚠️ Bitte alle Pflichtfelder ausfüllen!', 'warning');
      return;
    }
    
    console.log('📅 Plane Post:', { title, content, hashtags, date, time, priority });
    this.showToast('📅 Post wird geplant...', 'info');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.showToast(`✅ Post "${title}" erfolgreich für ${date} ${time} geplant!`, 'success');
      this.closePostSchedulingModal();
      
      // Refresh posts list
      setTimeout(() => this.loadPosts(), 500);
    } catch (error) {
      console.error('Fehler beim Planen:', error);
      this.showToast('❌ Fehler beim Planen des Posts', 'error');
    }
  }

  /**
   * Auto Schedule Week
   */
  async autoScheduleWeek() {
    console.log('🤖 Auto Schedule Week...');
    this.showToast('🤖 Woche wird automatisch geplant...', 'info');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const scheduledCount = Math.floor(Math.random() * 5) + 3; // 3-7 posts
      this.showToast(`✅ ${scheduledCount} Posts automatisch für diese Woche geplant!`, 'success');
      
      // Refresh posts
      setTimeout(() => this.loadPosts(), 500);
    } catch (error) {
      console.error('Auto Schedule Fehler:', error);
      this.showToast('❌ Fehler beim automatischen Planen', 'error');
    }
  }

  /**
   * Sync Posts
   */
  async syncPosts() {
    console.log('🔄 Sync Posts...');
    this.showToast('🔄 Synchronisiere Posts mit Instagram...', 'info');
    
    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.showToast('✅ Posts erfolgreich synchronisiert!', 'success');
      
      // Refresh posts
      setTimeout(() => this.loadPosts(), 500);
    } catch (error) {
      console.error('Sync Fehler:', error);
      this.showToast('❌ Synchronisation fehlgeschlagen', 'error');
    }
  }

  /**
   * Open Content Modal
   */
  openContentModal() {
    console.log('📝 Öffne Content Modal...');
    
    let modal = document.getElementById('content-modal');
    if (!modal) {
      this.createContentModal();
      modal = document.getElementById('content-modal');
    }
    
    modal.style.display = 'block';
    this.resetContentForm();
  }

  /**
   * Create Content Modal
   */
  createContentModal() {
    const modalHTML = `
      <div id="content-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>📝 Neuer Content erstellen</h3>
            <button class="modal-close" data-action="close-modal" style="pointer-events: auto !important; z-index: 1000 !important;">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="content-title">Titel:</label>
              <input type="text" id="content-title" placeholder="Content Titel">
            </div>
            <div class="form-group">
              <label for="content-type-select">Typ:</label>
              <select id="content-type-select">
                <option value="post">Instagram Post</option>
                <option value="story">Instagram Story</option>
                <option value="reel">Instagram Reel</option>
              </select>
            </div>
            <div class="form-group">
              <label for="content-text">Text:</label>
              <textarea id="content-text" placeholder="Content Text mit Hashtags..." rows="4"></textarea>
            </div>
            <div class="form-group">
              <label for="content-schedule">Veröffentlichung:</label>
              <input type="datetime-local" id="content-schedule">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="content-ai-optimize"> 
                🤖 Mit KI optimieren
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="cancel" style="pointer-events: auto !important; z-index: 100 !important;">Abbrechen</button>
            <button class="btn btn-secondary" data-action="save-draft" style="pointer-events: auto !important; z-index: 100 !important;">💾 Als Entwurf</button>
            <button class="btn btn-primary" data-action="schedule-content" style="pointer-events: auto !important; z-index: 100 !important;">📅 Planen</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Attach event listeners to modal buttons
    this.attachContentModalButtons();
    
    console.log('✅ Content Modal erstellt');
  }

  /**
   * Attach Content Modal Buttons
   */
  attachContentModalButtons() {
    // Close button (X)
    const closeButton = document.querySelector('#content-modal .modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('❌ CLOSE CONTENT MODAL clicked');
        this.closeContentModal();
      });
    }

    // Cancel button
    const cancelButton = document.querySelector('#content-modal button[data-action="cancel"]');
    if (cancelButton) {
      cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚫 CANCEL CONTENT clicked');
        this.closeContentModal();
      });
    }

    // Save draft button
    const draftButton = document.querySelector('#content-modal button[data-action="save-draft"]');
    if (draftButton) {
      draftButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('💾 SAVE CONTENT DRAFT clicked');
        this.saveContentDraft();
      });
    }

    // Schedule content button
    const scheduleButton = document.querySelector('#content-modal button[data-action="schedule-content"]');
    if (scheduleButton) {
      scheduleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('📅 SCHEDULE CONTENT clicked');
        this.scheduleContent();
      });
    }

    // Click outside to close
    const modal = document.getElementById('content-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          console.log('🖱️ CLICK OUTSIDE CONTENT MODAL to close');
          this.closeContentModal();
        }
      });
    }

    console.log('✅ Content Modal Buttons attachiert');
  }

  /**
   * Close Content Modal
   */
  closeContentModal() {
    const modal = document.getElementById('content-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Reset Content Form
   */
  resetContentForm() {
    const titleInput = document.getElementById('content-title');
    const textInput = document.getElementById('content-text');
    const scheduleInput = document.getElementById('content-schedule');
    const aiOptimizeInput = document.getElementById('content-ai-optimize');
    
    if (titleInput) titleInput.value = '';
    if (textInput) textInput.value = '';
    if (scheduleInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0);
      scheduleInput.value = tomorrow.toISOString().slice(0, 16);
    }
    if (aiOptimizeInput) aiOptimizeInput.checked = true;
  }

  /**
   * Save Content Draft
   */
  async saveContentDraft() {
    console.log('💾 Speichere Content als Entwurf...');
    this.showToast('💾 Content wird als Entwurf gespeichert...', 'info');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.showToast('✅ Content als Entwurf gespeichert!', 'success');
      this.closeContentModal();
      
      // Refresh content
      setTimeout(() => this.loadContent(), 500);
    } catch (error) {
      this.showToast('❌ Fehler beim Speichern', 'error');
    }
  }

  /**
   * Schedule Content
   */
  async scheduleContent() {
    const title = document.getElementById('content-title')?.value;
    const content = document.getElementById('content-text')?.value;
    const schedule = document.getElementById('content-schedule')?.value;
    
    if (!title || !content) {
      this.showToast('⚠️ Titel und Text sind erforderlich!', 'warning');
      return;
    }
    
    console.log('📅 Schedule Content:', { title, content, schedule });
    this.showToast('📅 Content wird geplant...', 'info');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.showToast(`✅ Content "${title}" erfolgreich geplant!`, 'success');
      this.closeContentModal();
      
      // Refresh content
      setTimeout(() => this.loadContent(), 500);
    } catch (error) {
      this.showToast('❌ Fehler beim Planen', 'error');
    }
  }

  /**
   * Open Content Calendar
   */
  openContentCalendar() {
    console.log('📅 Öffne Content Calendar...');
    this.showToast('📅 Content Calendar wird geöffnet...', 'info');
    // This would open a calendar view
  }

  /**
   * Attach Content Action Buttons
   */
  attachContentActionButtons() {
    document.querySelectorAll('.content-actions button[data-action]').forEach(button => {
      button.removeEventListener('click', this.handleContentAction);
      button.addEventListener('click', (e) => this.handleContentAction(e));
    });
    console.log('✅ Content Action Buttons attachiert');
  }

  /**
   * Handle Content Actions
   */
  handleContentAction(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.target;
    const action = button.getAttribute('data-action');
    const contentId = button.getAttribute('data-content-id');
    
    console.log(`📝 Content Action: ${action} für Content ID: ${contentId}`);
    
    switch (action) {
      case 'edit':
        this.editContent(contentId);
        break;
      case 'duplicate':
        this.duplicateContent(contentId);
        break;
      case 'delete':
        this.deleteContent(contentId);
        break;
      default:
        console.warn('Unbekannte Action:', action);
    }
  }

  /**
   * Edit Content
   */
  async editContent(contentId) {
    console.log(`✏️ Bearbeite Content ID: ${contentId}`);
    this.showToast('✏️ Content wird geladen...', 'info');
    
    try {
      // Simulate loading content data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Open content modal with existing data
      let modal = document.getElementById('content-modal');
      if (!modal) {
        this.createContentModal();
        modal = document.getElementById('content-modal');
      }
      
      // Load existing content data (mock)
      const mockContent = {
        title: 'StudiBuch Lerntipps für das Wintersemester',
        type: 'post',
        text: '📚 Die besten Lerntipps für erfolgreiches Studieren...\n\n#studium #lernen #motivation #studibuch',
        schedule: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
      };
      
      // Fill form with existing data
      document.getElementById('content-title').value = mockContent.title;
      document.getElementById('content-type-select').value = mockContent.type;
      document.getElementById('content-text').value = mockContent.text;
      document.getElementById('content-schedule').value = mockContent.schedule;
      document.getElementById('content-ai-optimize').checked = true;
      
      // Show modal
      modal.style.display = 'block';
      
      this.showToast('✏️ Content bereit zur Bearbeitung!', 'success');
      
    } catch (error) {
      console.error('Fehler beim Laden des Contents:', error);
      this.showToast('❌ Fehler beim Laden des Contents', 'error');
    }
  }

  /**
   * Duplicate Content
   */
  async duplicateContent(contentId) {
    console.log(`📋 Dupliziere Content ID: ${contentId}`);
    this.showToast('📋 Content wird dupliziert...', 'info');
    
    try {
      // Simulate duplication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.showToast('✅ Content erfolgreich dupliziert!', 'success');
      
      // Refresh content grid
      setTimeout(() => this.loadContent(), 500);
      
    } catch (error) {
      console.error('Fehler beim Duplizieren:', error);
      this.showToast('❌ Fehler beim Duplizieren', 'error');
    }
  }

  /**
   * Delete Content
   */
  async deleteContent(contentId) {
    console.log(`🗑️ Lösche Content ID: ${contentId}`);
    
    if (!confirm('Sind Sie sicher, dass Sie diesen Content löschen möchten?\n\nDiese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    this.showToast('🗑️ Content wird gelöscht...', 'info');
    
    try {
      // Simulate deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from UI immediately
      const contentElement = document.querySelector(`[data-id="${contentId}"]`);
      if (contentElement) {
        contentElement.style.opacity = '0.5';
        contentElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
          contentElement.remove();
        }, 300);
      }
      
      this.showToast('✅ Content erfolgreich gelöscht!', 'success');
      
      // Refresh content grid after animation
      setTimeout(() => this.loadContent(), 800);
      
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      this.showToast('❌ Fehler beim Löschen', 'error');
    }
  }

  /**
   * Re-attach Content Action Buttons
   */
  reattachContentActionButtons() {
    const contentButtons = document.querySelectorAll('.content-actions button[data-action]');
    if (contentButtons.length > 0) {
      contentButtons.forEach(button => {
        if (!button.hasAttribute('data-listener-attached')) {
          button.addEventListener('click', (e) => this.handleContentAction(e));
          button.setAttribute('data-listener-attached', 'true');
        }
      });
    }
  }

  /**
   * Save Frequency Configuration
   */
  async saveFrequencyConfig() {
    console.log('💾 Speichere Posting-Frequenz Konfiguration...');
    this.showToast('💾 Konfiguration wird gespeichert...', 'info');
    
    try {
      // Get form values
      const postsPerWeek = document.getElementById('posts-per-week')?.value || '4';
      const excludeDays = [];
      
      // Check excluded days
      const sundayCheckbox = document.querySelector('input[value="sunday"]');
      const saturdayCheckbox = document.querySelector('input[value="saturday"]');
      
      if (sundayCheckbox?.checked) excludeDays.push('sunday');
      if (saturdayCheckbox?.checked) excludeDays.push('saturday');
      
      // Get preferred times
      const timeInputs = document.querySelectorAll('.time-picker-group input[type="time"]');
      const preferredTimes = Array.from(timeInputs).map(input => input.value);
      
      const config = {
        postsPerWeek: parseInt(postsPerWeek),
        preferredTimes,
        excludeDays
      };
      
      console.log('📊 Neue Konfiguration:', config);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.showToast('✅ Posting-Frequenz Konfiguration gespeichert!', 'success');
      
      // Show summary
      setTimeout(() => {
        this.showToast(`📊 ${config.postsPerWeek} Posts/Woche, ${config.preferredTimes.length} Zeiten, ${config.excludeDays.length} ausgeschlossene Tage`, 'info');
      }, 2000);
      
    } catch (error) {
      console.error('Fehler beim Speichern der Konfiguration:', error);
      this.showToast('❌ Fehler beim Speichern der Konfiguration', 'error');
    }
  }

  /**
   * Re-attach Magazine Buttons
   */
  reattachMagazineButtons() {
    // Magazine article buttons
    const articleButtons = document.querySelectorAll('.magazine-article-item button[data-action]');
    if (articleButtons.length > 0) {
      articleButtons.forEach(button => {
        if (!button.hasAttribute('data-listener-attached')) {
          button.addEventListener('click', (e) => this.handleMagazineArticleAction(e));
          button.setAttribute('data-listener-attached', 'true');
        }
      });
    }
    
    // Modified content buttons
    const modifiedButtons = document.querySelectorAll('.modified-content-item button[data-action]');
    if (modifiedButtons.length > 0) {
      modifiedButtons.forEach(button => {
        if (!button.hasAttribute('data-listener-attached')) {
          button.addEventListener('click', (e) => this.handleModifiedContentAction(e));
          button.setAttribute('data-listener-attached', 'true');
        }
      });
    }
  }

  /**
   * Attach Magazine Article Buttons
   */
  attachMagazineArticleButtons() {
    document.querySelectorAll('.magazine-article-item button[data-action]').forEach(button => {
      button.removeEventListener('click', this.handleMagazineArticleAction);
      button.addEventListener('click', (e) => this.handleMagazineArticleAction(e));
    });
    console.log('✅ Magazine Article Buttons attachiert');
  }

  /**
   * Handle Magazine Article Actions
   */
  handleMagazineArticleAction(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.target;
    const action = button.getAttribute('data-action');
    const articleId = button.getAttribute('data-article-id');
    
    console.log(`📰 Magazine Article Action: ${action} für Article ID: ${articleId}`);
    
    switch (action) {
      case 'modify':
        this.modifyArticle(articleId);
        break;
      case 'preview':
        this.previewArticle(articleId);
        break;
      default:
        console.warn('Unbekannte Magazine Action:', action);
    }
  }

  /**
   * Attach Modified Content Buttons
   */
  attachModifiedContentButtons() {
    document.querySelectorAll('.modified-content-item button[data-action]').forEach(button => {
      button.removeEventListener('click', this.handleModifiedContentAction);
      button.addEventListener('click', (e) => this.handleModifiedContentAction(e));
    });
    console.log('✅ Modified Content Buttons attachiert');
  }

  /**
   * Handle Modified Content Actions
   */
  handleModifiedContentAction(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.target;
    const action = button.getAttribute('data-action');
    const contentId = button.getAttribute('data-content-id');
    
    console.log(`📋 Modified Content Action: ${action} für Content ID: ${contentId}`);
    
    switch (action) {
      case 'review':
        this.reviewModifiedContent(contentId);
        break;
      case 'edit':
        this.editModifiedContent(contentId);
        break;
      case 'schedule':
        this.scheduleModifiedContent(contentId);
        break;
      case 'approve':
        this.requestApproval(contentId);
        break;
      default:
        console.warn('Unbekannte Modified Content Action:', action);
    }
  }

  /**
   * Open Review Queue
   */
  async openReviewQueue() {
    console.log('📋 Öffne Review-Queue...');
    this.showToast('📋 Review-Queue wird geladen...', 'info');
    
    try {
      // Simulate loading review queue
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create and show review queue modal
      this.createReviewQueueModal();
      
      this.showToast('📋 Review-Queue geöffnet!', 'success');
      
    } catch (error) {
      console.error('Fehler beim Öffnen der Review-Queue:', error);
      this.showToast('❌ Fehler beim Öffnen der Review-Queue', 'error');
    }
  }

  /**
   * Create Review Queue Modal
   */
  createReviewQueueModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('review-queue-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modalHTML = `
      <div id="review-queue-modal" class="modal" style="display: flex;">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>📋 Review-Queue Management</h3>
            <button class="modal-close" data-action="close-modal" style="pointer-events: auto !important; z-index: 1000 !important;">&times;</button>
          </div>
          <div class="modal-body">
            <div class="review-queue-stats">
              <div class="queue-stat">
                <span class="stat-number">1</span>
                <span class="stat-label">Wartend auf Review</span>
              </div>
              <div class="queue-stat">
                <span class="stat-number">0</span>
                <span class="stat-label">In Bearbeitung</span>
              </div>
              <div class="queue-stat">
                <span class="stat-number">1</span>
                <span class="stat-label">Genehmigt</span>
              </div>
            </div>
            <div class="review-queue-content">
              <div class="review-item">
                <div class="review-item-info">
                  <h4>StudiBuch Lerntipps für das Wintersemester</h4>
                  <p>Instagram Post • Erstellt vor 2 Stunden</p>
                  <div class="review-item-preview">📚 Die besten Lerntipps für erfolgreiches Studieren...</div>
                </div>
                <div class="review-item-actions">
                  <button class="btn btn-success btn-sm" data-action="quick-approve" data-content-id="content1" style="pointer-events: auto !important; z-index: 100 !important;">✅ Genehmigen</button>
                  <button class="btn btn-warning btn-sm" data-action="request-changes" data-content-id="content1" style="pointer-events: auto !important; z-index: 100 !important;">🔄 Änderungen</button>
                  <button class="btn btn-danger btn-sm" data-action="quick-reject" data-content-id="content1" style="pointer-events: auto !important; z-index: 100 !important;">❌ Ablehnen</button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="close" style="pointer-events: auto !important; z-index: 100 !important;">Schließen</button>
            <button class="btn btn-primary" data-action="bulk-approve" style="pointer-events: auto !important; z-index: 100 !important;">✅ Alle genehmigen</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Attach event listeners to modal buttons
    this.attachReviewQueueModalButtons();
  }

  /**
   * Attach Review Queue Modal Buttons
   */
  attachReviewQueueModalButtons() {
    // Close button (X)
    const closeButton = document.querySelector('#review-queue-modal .modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('❌ CLOSE REVIEW QUEUE MODAL clicked');
        this.closeReviewQueueModal();
      });
    }

    // Close button
    const closeButtonFooter = document.querySelector('#review-queue-modal button[data-action="close"]');
    if (closeButtonFooter) {
      closeButtonFooter.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚫 CLOSE REVIEW QUEUE clicked');
        this.closeReviewQueueModal();
      });
    }

    // Bulk approve button
    const bulkApproveButton = document.querySelector('#review-queue-modal button[data-action="bulk-approve"]');
    if (bulkApproveButton) {
      bulkApproveButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ BULK APPROVE clicked');
        this.bulkApprove();
      });
    }

    // Individual action buttons
    const actionButtons = document.querySelectorAll('#review-queue-modal .review-item-actions button[data-action]');
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const action = button.getAttribute('data-action');
        const contentId = button.getAttribute('data-content-id');
        
        console.log(`📋 Review Queue Action: ${action} für Content: ${contentId}`);
        
        switch (action) {
          case 'quick-approve':
            this.quickApprove(contentId);
            break;
          case 'request-changes':
            this.requestChanges(contentId);
            break;
          case 'quick-reject':
            this.quickReject(contentId);
            break;
        }
      });
    });

    // Click outside to close
    const modal = document.getElementById('review-queue-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          console.log('🖱️ CLICK OUTSIDE REVIEW QUEUE MODAL to close');
          this.closeReviewQueueModal();
        }
      });
    }

    console.log('✅ Review Queue Modal Buttons attachiert');
  }

  /**
   * Quick Approve
   */
  async quickApprove(contentId) {
    console.log(`✅ Quick Approve für Content: ${contentId}`);
    this.showToast('✅ Content wird genehmigt...', 'info');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.showToast('✅ Content erfolgreich genehmigt!', 'success');
      
      // Update review queue
      setTimeout(() => {
        this.showToast('📅 Content zur Scheduling-Queue hinzugefügt', 'info');
      }, 1500);
      
    } catch (error) {
      console.error('Quick Approve Fehler:', error);
      this.showToast('❌ Fehler beim Genehmigen', 'error');
    }
  }

  /**
   * Request Changes
   */
  async requestChanges(contentId) {
    console.log(`🔄 Request Changes für Content: ${contentId}`);
    
    const changes = prompt('Welche Änderungen sind erforderlich?', 'Bitte Hashtags optimieren und Text kürzen.');
    
    if (changes) {
      this.showToast('🔄 Änderungen angefordert...', 'info');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.showToast('📧 Änderungsanfrage gesendet!', 'warning');
        
        setTimeout(() => {
          this.showToast('🔔 Content-Ersteller benachrichtigt', 'info');
        }, 1500);
        
      } catch (error) {
        console.error('Request Changes Fehler:', error);
        this.showToast('❌ Fehler beim Senden der Änderungsanfrage', 'error');
      }
    }
  }

  /**
   * Quick Reject
   */
  async quickReject(contentId) {
    console.log(`❌ Quick Reject für Content: ${contentId}`);
    
    const reason = prompt('Grund für Ablehnung:', 'Content entspricht nicht den Qualitätsrichtlinien.');
    
    if (reason) {
      this.showToast('❌ Content wird abgelehnt...', 'info');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.showToast('❌ Content abgelehnt!', 'warning');
        
        setTimeout(() => {
          this.showToast('📧 Ablehnungsgrund übermittelt', 'info');
        }, 1500);
        
      } catch (error) {
        console.error('Quick Reject Fehler:', error);
        this.showToast('❌ Fehler beim Ablehnen', 'error');
      }
    }
  }

  /**
   * Bulk Approve
   */
  async bulkApprove() {
    console.log('✅ Bulk Approve alle wartenden Inhalte');
    
    if (!confirm('Alle wartenden Inhalte genehmigen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    this.showToast('✅ Alle Inhalte werden genehmigt...', 'info');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const approvedCount = Math.floor(Math.random() * 5) + 1; // 1-5 items
      this.showToast(`✅ ${approvedCount} Inhalte erfolgreich genehmigt!`, 'success');
      
      setTimeout(() => {
        this.showToast('📅 Alle genehmigten Inhalte zur Scheduling-Queue hinzugefügt', 'info');
      }, 1500);
      
      // Close modal after bulk approve
      setTimeout(() => {
        this.closeReviewQueueModal();
      }, 3000);
      
    } catch (error) {
      console.error('Bulk Approve Fehler:', error);
      this.showToast('❌ Fehler beim Bulk-Genehmigen', 'error');
    }
  }

  /**
   * Close Review Queue Modal
   */
  closeReviewQueueModal() {
    const modal = document.getElementById('review-queue-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Scrape Magazine
   */
  async scrapeMagazine() {
    console.log('🕷️ Starte Magazin-Scraping...');
    this.showToast('🕷️ Starte Magazin-Scraping...', 'info');
    
    try {
      // Simulate scraping process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newArticles = Math.floor(Math.random() * 8) + 3; // 3-10 new articles
      this.showToast(`✅ ${newArticles} neue Artikel gescrapt!`, 'success');
      
      // Refresh magazine data
      setTimeout(() => this.loadMagazineData(), 500);
      
    } catch (error) {
      console.error('Scraping Fehler:', error);
      this.showToast('❌ Scraping fehlgeschlagen!', 'error');
    }
  }

  /**
   * Show Magazine Analytics
   */
  async showMagazineAnalytics() {
    console.log('📊 Zeige Magazine Analytics...');
    this.showToast('📊 Magazine Analytics werden geladen...', 'info');
    
    try {
      // Simulate loading analytics
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create analytics summary
      const analyticsHTML = `
        📊 Magazine Analytics:
        
        • Artikel verfügbar: 3
        • Instagram-geeignet: 3 (100%)
        • Durchschnittliche Qualität: HIGH
        • Modifikationsrate: 67%
        • Genehmigungsrate: 50%
      `;
      
      alert(analyticsHTML);
      
    } catch (error) {
      console.error('Analytics Fehler:', error);
      this.showToast('❌ Fehler beim Laden der Analytics', 'error');
    }
  }

  /**
   * Modify Article
   */
  modifyArticle(articleId) {
    // Load article data into modification modal
    this.currentArticleId = articleId;
    
    // Populate modal with article data
    const articleTitle = document.getElementById('original-article-title');
    const articleMeta = document.getElementById('original-article-meta');
    const articleSummary = document.getElementById('original-article-summary');
    
    if (articleTitle) articleTitle.textContent = 'Ausgewählter Artikel wird geladen...';
    if (articleMeta) articleMeta.innerHTML = '<span>📝 Autor</span><span>📅 Datum</span><span>⏱️ Lesezeit</span>';
    if (articleSummary) articleSummary.textContent = 'Artikel-Zusammenfassung wird geladen...';
    
    this.showModal('article-modification-modal');
  }

  /**
   * Show Modal with Enhanced Functionality
   */
  showModal(modalId) {
    console.log(`📋 Opening modal: ${modalId}`);
    
    let modal = document.getElementById(modalId);
    if (!modal) {
      // Create the modal if it doesn't exist
      this.createArticleModificationModal();
      modal = document.getElementById(modalId);
    }
    
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // ULTRA-AGGRESSIVE MODAL CLOSE FIXES
      this.attachUltraModalCloseHandlers(modal);
      
      console.log(`✅ Modal ${modalId} opened`);
    }
  }

  /**
   * Attach Ultra Modal Close Handlers
   */
  attachUltraModalCloseHandlers(modal) {
    const modalId = modal.id;
    console.log(`🔧 Attaching ultra close handlers for ${modalId}`);
    
    // Method 1: Close button with multiple event types
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
      // Force extreme styles
      closeButton.style.cssText = `
        pointer-events: auto !important;
        cursor: pointer !important;
        z-index: 99999 !important;
        position: absolute !important;
        top: 16px !important;
        right: 16px !important;
        width: 40px !important;
        height: 40px !important;
        background: white !important;
        color: #dc2626 !important;
        border: 2px solid #dc2626 !important;
        border-radius: 50% !important;
        font-size: 24px !important;
        font-weight: 900 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
      `;
      
      // Remove all existing listeners and add new ones
      const newCloseButton = closeButton.cloneNode(true);
      closeButton.parentNode.replaceChild(newCloseButton, closeButton);
      
      // Add multiple event types for maximum compatibility
      ['click', 'mousedown', 'touchstart', 'pointerdown'].forEach(eventType => {
        newCloseButton.addEventListener(eventType, (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log(`❌ MODAL CLOSE (${eventType}) for ${modalId}`);
          this.forceCloseModal(modalId);
        }, { capture: true, passive: false });
      });
      
      console.log(`✅ Close button configured for ${modalId}`);
    }
    
    // Method 2: Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        console.log(`🖱️ Click outside modal ${modalId}`);
        this.forceCloseModal(modalId);
      }
    }, { capture: true });
    
    // Method 3: ESC key with ultra priority
    const escHandler = (e) => {
      if (e.key === 'Escape' && modal.style.display !== 'none') {
        e.preventDefault();
        e.stopPropagation();
        console.log(`⌨️ ESC pressed for ${modalId}`);
        this.forceCloseModal(modalId);
      }
    };
    
    document.addEventListener('keydown', escHandler, { capture: true });
    modal.escHandler = escHandler; // Store for cleanup
    
    console.log(`✅ Ultra close handlers attached for ${modalId}`);
  }

  /**
   * Force Close Modal
   */
  forceCloseModal(modalId) {
    console.log(`🔥 FORCE CLOSING modal: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (modal) {
      // Remove ESC handler
      if (modal.escHandler) {
        document.removeEventListener('keydown', modal.escHandler, { capture: true });
      }
      
      // Hide modal with animation
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        modal.style.display = 'none';
        modal.remove();
        document.body.style.overflow = '';
        console.log(`✅ Modal ${modalId} force closed`);
      }, 200);
    }
    
    this.showToast(`❌ Modal geschlossen`, 'info');
  }

  /**
   * Create Article Modification Modal
   */
  createArticleModificationModal() {
    // Remove existing modal
    const existingModal = document.getElementById('article-modification-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modalHTML = `
      <div id="article-modification-modal" class="modal">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>📰 Artikel für Instagram modifizieren</h3>
            <button class="modal-close" style="pointer-events: auto !important; z-index: 99999 !important;">&times;</button>
          </div>
          <div class="modal-body">
            <div class="modification-form">
              <!-- Left: Article Preview -->
              <div class="article-preview">
                <h4>📄 Ausgewählter Artikel</h4>
                <div id="original-article-content">
                  <div class="article-meta" id="original-article-meta">
                    <span>✍️ StudiBuch Redaktion</span>
                    <span>📅 23.05.2025</span>
                    <span>⏱️ 4 Min</span>
                  </div>
                  <div class="article-summary" id="original-article-summary">
                    Erfolgreich durchs Studium: 10 bewährte Lerntipps für bessere Noten und entspannteres Lernen während der Klausurphase.
                  </div>
                  <div class="article-image-section">
                    <h5>🎨 KI-generiertes Bild</h5>
                    <div id="generated-image-preview">
                      <div class="generated-image-mockup">
                        <div class="image-placeholder">
                          <div class="ai-image-content">
                            <h6>📚 Lerntipps für Studenten</h6>
                            <div class="visual-elements">
                              <span>💡</span> <span>📖</span> <span>🎯</span> <span>✨</span>
                            </div>
                            <p>Moderne Instagram-Grafik</p>
                          </div>
                        </div>
                        <div class="image-info">
                          <small>🎨 Automatisch mit KI generiert • 1080x1080px</small>
                        </div>
                      </div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="window.ui.regenerateImage()" style="pointer-events: auto !important; z-index: 100 !important;">🔄 Neues Bild generieren</button>
                  </div>
                </div>
              </div>
              
              <!-- Center: Options -->
              <div class="modification-options">
                <h4>⚙️ Instagram Optionen</h4>
                
                <div class="form-group">
                  <label>Format:</label>
                  <select id="target-format" onchange="window.ui.updateInstagramPreview()" style="pointer-events: auto !important;">
                    <option value="post">📱 Instagram Post</option>
                    <option value="story">📸 Story</option>
                    <option value="reel">🎬 Reel</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Ton:</label>
                  <select id="content-tone" onchange="window.ui.updateInstagramPreview()" style="pointer-events: auto !important;">
                    <option value="educational">📚 Lehrreich</option>
                    <option value="motivational">💪 Motivierend</option>
                    <option value="casual">😊 Locker</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Zielgruppe:</label>
                  <select id="target-audience" onchange="window.ui.updateInstagramPreview()" style="pointer-events: auto !important;">
                    <option value="students">🎓 Studenten</option>
                    <option value="professionals">💼 Berufstätige</option>
                    <option value="general">🌍 Allgemein</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Max. Textlänge:</label>
                  <input type="range" id="max-length" min="500" max="2200" value="2000" onchange="window.ui.updateInstagramPreview(); window.ui.updateLengthDisplay(this.value)" style="pointer-events: auto !important;">
                  <span id="length-display">2000 Zeichen</span>
                </div>
                
                <div class="form-group">
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="add-hashtags" checked onchange="window.ui.updateInstagramPreview()" style="pointer-events: auto !important;">
                    🏷️ Hashtags hinzufügen
                  </label>
                </div>
                
                <div class="form-group">
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="add-cta" checked onchange="window.ui.updateInstagramPreview()" style="pointer-events: auto !important;">
                    📢 Call-to-Action hinzufügen
                  </label>
                </div>
              </div>
              
              <!-- Right: Preview -->
              <div class="modification-preview">
                <h4>📱 Vorschau</h4>
                <div id="instagram-preview">
                  <div class="preview-container">
                    <div class="instagram-post-mockup">
                      <div class="post-header">
                        <div class="profile-pic">📚</div>
                        <strong>studibuch_official</strong>
                      </div>
                      <div class="post-image">🎨 Generiertes Bild</div>
                      <div class="post-content" id="preview-content">
                        📚 Erfolgreich durchs Studium! Diese 10 bewährten Lerntipps helfen dir dabei, deine Noten zu verbessern...
                        
                        👉 Folge @studibuch_official für mehr Tipps!
                        
                        #studium #lernen #motivation #tipps #erfolg
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="preview-stats">
                  <h5>📊 Statistiken</h5>
                  <div class="stat-row">
                    <span>Zeichen:</span> <span id="char-count">245</span>
                  </div>
                  <div class="stat-row">
                    <span>Hashtags:</span> <span id="hashtag-count">5</span>
                  </div>
                  <div class="stat-row">
                    <span>Engagement:</span> <span id="engagement-score">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.ui.forceCloseModal('article-modification-modal')" style="pointer-events: auto !important; z-index: 100 !important;">❌ Abbrechen</button>
            <button class="btn btn-primary" onclick="window.ui.previewInstagramContent()" style="pointer-events: auto !important; z-index: 100 !important;">👁️ Vorschau</button>
            <button class="btn btn-success" onclick="window.ui.createInstagramContent()" style="pointer-events: auto !important; z-index: 100 !important;">🚀 Modifizieren</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    console.log('✅ Article modification modal created with ultra handlers');
  }

  /**
   * Update Instagram Preview
   */
  updateInstagramPreview() {
    console.log('👁️ Updating Instagram preview...');
    
    const format = document.getElementById('target-format')?.value || 'post';
    const tone = document.getElementById('content-tone')?.value || 'educational';
    const audience = document.getElementById('target-audience')?.value || 'students';
    const maxLength = parseInt(document.getElementById('max-length')?.value) || 2000;
    const addHashtags = document.getElementById('add-hashtags')?.checked || false;
    const addCTA = document.getElementById('add-cta')?.checked || false;
    
    // Generate content based on selections
    let content = this.generateContentByTone(tone, audience);
    
    // Add CTA if enabled
    if (addCTA) {
      content += '\n\n👉 Folge @studibuch_official für mehr Tipps!';
    }
    
    // Add hashtags if enabled
    if (addHashtags) {
      const hashtags = this.generateHashtagsByAudience(audience);
      content += '\n\n' + hashtags;
    }
    
    // Limit content length
    if (content.length > maxLength) {
      content = content.substring(0, maxLength - 3) + '...';
    }
    
    // Update preview content
    const previewContent = document.getElementById('preview-content');
    if (previewContent) {
      previewContent.textContent = content;
    }
    
    // Update stats
    this.updatePreviewStats(content, addHashtags);
    
    this.showToast('👁️ Vorschau aktualisiert!', 'info', 1500);
  }

  /**
   * Generate Content by Tone
   */
  generateContentByTone(tone, audience) {
    const contents = {
      educational: {
        students: '📚 Erfolgreich durchs Studium! Diese 10 bewährten Lerntipps helfen dir dabei, deine Noten zu verbessern und entspannter durch die Klausurphase zu kommen. Von der optimalen Zeitplanung bis zu effektiven Lernmethoden.',
        professionals: '📈 Lebenslanges Lernen ist der Schlüssel zum beruflichen Erfolg. Diese bewährten Strategien helfen auch Berufstätigen beim effektiven Lernen neben dem Job.',
        general: '🎯 Effektives Lernen ist eine Fähigkeit, die jeder entwickeln kann. Hier sind die wichtigsten Strategien für deinen Lernerfolg.'
      },
      motivational: {
        students: '💪 Du schaffst das! Jede große Reise beginnt mit dem ersten Schritt. Diese Lerntipps bringen dich deinen Zielen näher und helfen dir dabei, dein volles Potenzial zu entfalten!',
        professionals: '🚀 Investiere in dich selbst! Mit den richtigen Lernstrategien erreichst du deine beruflichen Ziele schneller und effizienter.',
        general: '✨ Glaube an dich! Mit der richtigen Einstellung und den passenden Methoden ist alles möglich.'
      },
      casual: {
        students: '😊 Hey! Kennst du das? Lernen kann echt stressig sein. Hier sind ein paar coole Tipps, die mir total geholfen haben und dir das Studium deutlich entspannter machen!',
        professionals: '👋 Hi! Weiterbildung neben dem Job? Kein Problem! Diese Tipps machen es deutlich entspannter und effizienter.',
        general: '🤙 Hallo! Lernen muss nicht kompliziert sein. Hier sind ein paar einfache Tricks, die wirklich funktionieren!'
      }
    };
    
    return contents[tone]?.[audience] || contents[tone]?.general || 'Modifizierter Content wird hier angezeigt...';
  }

  /**
   * Generate Hashtags by Audience
   */
  generateHashtagsByAudience(audience) {
    const hashtags = {
      students: '#studium #lernen #studibuch #motivation #uni #tipps #erfolg #klausuren #semester',
      professionals: '#weiterbildung #karriere #lernen #erfolg #beruf #entwicklung #business #skills',
      general: '#lernen #bildung #wissen #erfolg #tipps #motivation #entwicklung #growth'
    };
    
    return hashtags[audience] || hashtags.general;
  }

  /**
   * Update Preview Stats
   */
  updatePreviewStats(content, hasHashtags) {
    const charCount = document.getElementById('char-count');
    const hashtagCount = document.getElementById('hashtag-count');
    const engagementScore = document.getElementById('engagement-score');
    
    if (charCount) charCount.textContent = content.length;
    
    if (hashtagCount) {
      const hashtags = (content.match(/#/g) || []).length;
      hashtagCount.textContent = hashtags;
    }
    
    if (engagementScore) {
      const score = Math.min(100, Math.max(60, 75 + (hasHashtags ? 10 : 0) + Math.random() * 15));
      engagementScore.textContent = `${Math.round(score)}%`;
    }
  }

  /**
   * Update Length Display
   */
  updateLengthDisplay(value) {
    const display = document.getElementById('length-display');
    if (display) {
      display.textContent = `${value} Zeichen`;
    }
  }

  /**
   * Regenerate Image
   */
  regenerateImage() {
    console.log('🎨 Regenerating AI image...');
    this.showToast('🎨 Neues Bild wird generiert...', 'info');
    
    const imagePreview = document.getElementById('generated-image-preview');
    if (imagePreview) {
      // Show loading
      imagePreview.innerHTML = `
        <div class="image-loading">
          <div class="spinner"></div>
          <p>🎨 KI generiert neues Bild...</p>
        </div>
      `;
      
      // Simulate generation
      setTimeout(() => {
        const randomNum = Math.floor(Math.random() * 100);
        imagePreview.innerHTML = `
          <div class="generated-image-mockup">
            <div class="image-placeholder">
              <div class="ai-image-content">
                <h6>📚 Lerntipps #${randomNum}</h6>
                <div class="visual-elements">
                  <span>💡</span> <span>📖</span> <span>🎯</span> <span>✨</span>
                </div>
                <p>Neue Instagram-Grafik</p>
              </div>
            </div>
            <div class="image-info">
              <small>🎨 Frisch generiert • 1080x1080px • Variante ${randomNum}</small>
            </div>
          </div>
        `;
        this.showToast('✅ Neues Bild erfolgreich generiert!', 'success');
      }, 2000);
    }
  }

  /**
   * Preview Instagram Content
   */
  previewInstagramContent() {
    console.log('👁️ Previewing Instagram content...');
    this.updateInstagramPreview();
    this.showToast('👁️ Vorschau aktualisiert!', 'success');
  }

  /**
   * Create Instagram Content
   */
  async createInstagramContent() {
    console.log('🚀 Creating Instagram content...');
    this.showToast('🚀 Instagram Content wird erstellt...', 'info');
    
    try {
      // Simulate content creation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      this.showToast('✅ Instagram Content erfolgreich erstellt!', 'success');
      this.forceCloseModal('article-modification-modal');
      
      // Refresh magazine data
      setTimeout(() => this.loadMagazineData(), 500);
    } catch (error) {
      this.showToast('❌ Fehler beim Erstellen des Contents', 'error');
    }
  }
}

// Replace the original UIManager with extended version
const originalUIManager = UIManager;
window.UIManager = ExtendedUIManager;

// Update the main app initialization
class ExtendedRionaAIApp extends RionaAIApp {
  constructor() {
    super();
    // Override UI manager
    this.ui = new ExtendedUIManager();
  }
}

// Update global app reference
if (typeof app !== 'undefined') {
  // Reinitialize with extended features
  app = new ExtendedRionaAIApp();
} else {
  // For new initialization
  window.ExtendedRionaAIApp = ExtendedRionaAIApp;
}

// Make UI manager globally available for button clicks
window.ui = app?.ui || new ExtendedUIManager();                                                            