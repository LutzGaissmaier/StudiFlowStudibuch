/**
 * Konfigurationsdatei für StudiFlow AI Enterprise
 * 
 * Enthält alle Konfigurationseinstellungen für die Anwendung.
 * 
 * @version 1.0.0
 */

// Basis-Konfiguration
const config = {
  // Anwendungsinformationen
  app: {
    name: 'StudiFlow AI Enterprise',
    version: '1.0.0',
    description: 'Integrierte Lösung für Content-Management und Social Media Automatisierung',
    company: 'StudiBuch',
    website: 'https://studibuch.de',
    logo: '/assets/images/logo.png',
    logoIcon: '/assets/images/logo-icon.png'
  },
  
  // API-Konfiguration
  api: {
    baseUrl: process.env.API_BASE_URL || '/api',
    timeout: 30000, // 30 Sekunden
    retryAttempts: 3,
    retryDelay: 1000 // 1 Sekunde
  },
  
  // Instagram-Konfiguration
  instagram: {
    apiVersion: 'v18.0',
    scopes: [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement'
    ],
    callbackUrl: process.env.INSTAGRAM_CALLBACK_URL || 'https://studiflow.studibuch.de/auth/instagram/callback',
    postTypes: [
      { id: 'image', label: 'Bild', icon: 'image' },
      { id: 'carousel', label: 'Carousel', icon: 'collections' },
      { id: 'video', label: 'Video', icon: 'videocam' },
      { id: 'reel', label: 'Reel', icon: 'movie' }
    ]
  },
  
  // Magazin-Konfiguration
  magazine: {
    baseUrl: 'https://studibuch.de/magazin',
    scrapingInterval: 3600000, // 1 Stunde
    categories: [
      { id: 'lernstrategien', label: 'Lernstrategien' },
      { id: 'finanzen', label: 'Finanzen' },
      { id: 'auslandsstudium', label: 'Auslandsstudium' },
      { id: 'studentenleben', label: 'Studentenleben' },
      { id: 'karriere', label: 'Karriere' },
      { id: 'digitales', label: 'Digitales' }
    ]
  },
  
  // Content-Konfiguration
  content: {
    maxTitleLength: 100,
    maxCaptionLength: 2200, // Instagram-Limit
    hashtagLimit: 30,
    defaultScheduleTime: '10:00',
    previewTemplates: {
      post: 'templates/preview/instagram-post.html',
      carousel: 'templates/preview/instagram-carousel.html',
      video: 'templates/preview/instagram-video.html',
      reel: 'templates/preview/instagram-reel.html'
    }
  },
  
  // Creatomate-Konfiguration
  creatomate: {
    apiVersion: 'v1',
    templates: [
      { id: 'social_media_reel', label: 'Social Media Reel', thumbnail: '/assets/images/templates/social-media-reel.jpg' },
      { id: 'quote_animation', label: 'Zitat-Animation', thumbnail: '/assets/images/templates/quote-animation.jpg' },
      { id: 'step_by_step_guide', label: 'Schritt-für-Schritt Anleitung', thumbnail: '/assets/images/templates/step-by-step-guide.jpg' },
      { id: 'product_showcase', label: 'Produkt-Präsentation', thumbnail: '/assets/images/templates/product-showcase.jpg' },
      { id: 'text_overlay', label: 'Text-Overlay', thumbnail: '/assets/images/templates/text-overlay.jpg' }
    ],
    aspectRatios: [
      { id: '9:16', label: '9:16 (Stories, Reels)', width: 1080, height: 1920 },
      { id: '4:5', label: '4:5 (Posts)', width: 1080, height: 1350 },
      { id: '1:1', label: '1:1 (Quadratisch)', width: 1080, height: 1080 },
      { id: '16:9', label: '16:9 (Landscape)', width: 1920, height: 1080 }
    ]
  },
  
  // KI-Konfiguration
  ai: {
    providers: [
      { id: 'openai', label: 'OpenAI' },
      { id: 'gemini', label: 'Google Gemini' }
    ],
    models: {
      openai: [
        { id: 'gpt-4', label: 'GPT-4' },
        { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
      ],
      gemini: [
        { id: 'gemini-pro', label: 'Gemini Pro' },
        { id: 'gemini-ultra', label: 'Gemini Ultra' }
      ]
    },
    defaultProvider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
    maxTokens: 2000,
    temperature: 0.7
  },
  
  // UI-Konfiguration
  ui: {
    theme: {
      light: {
        primary: '#a4c63a',
        secondary: '#4CAF50',
        background: '#f8f9fa',
        surface: '#ffffff',
        text: '#333333',
        textSecondary: '#666666',
        border: '#e0e0e0'
      },
      dark: {
        primary: '#a4c63a',
        secondary: '#4CAF50',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        textSecondary: '#aaaaaa',
        border: '#333333'
      }
    },
    defaultTheme: 'light',
    sidebarWidth: 260,
    sidebarCollapsedWidth: 64,
    headerHeight: 64,
    footerHeight: 40,
    breakpoints: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200
    }
  },
  
  // Benutzer-Konfiguration
  user: {
    roles: [
      { id: 'admin', label: 'Administrator' },
      { id: 'editor', label: 'Redakteur' },
      { id: 'viewer', label: 'Betrachter' }
    ],
    defaultRole: 'viewer',
    sessionTimeout: 3600000 // 1 Stunde
  },
  
  // Ankaufsystem-Konfiguration (Beta)
  ankauf: {
    enabled: true,
    baseUrl: '/ankauf',
    categories: [
      { id: 'buecher', label: 'Bücher' },
      { id: 'elektronik', label: 'Elektronik' },
      { id: 'kleidung', label: 'Kleidung' },
      { id: 'moebel', label: 'Möbel' },
      { id: 'sonstiges', label: 'Sonstiges' }
    ],
    wareneingang: {
      status: [
        { id: 'neu', label: 'Neu', color: '#4CAF50' },
        { id: 'in_bearbeitung', label: 'In Bearbeitung', color: '#FFC107' },
        { id: 'abgeschlossen', label: 'Abgeschlossen', color: '#2196F3' },
        { id: 'abgelehnt', label: 'Abgelehnt', color: '#F44336' }
      ]
    }
  }
};

// Exportiere die Konfiguration
export default config;
