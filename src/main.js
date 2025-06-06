/**
 * Main JavaScript für StudiFlow AI Enterprise
 * 
 * Implementiert die Hauptfunktionalität der Anwendung.
 * 
 * @version 1.0.0
 */

// Import der Module
import theme from './ui/theme';
import layout from './ui/layout';
import pages from './ui/pages';
import { InstagramService } from './services/instagram';
import { MagazineService } from './services/magazine/scraper';
import { ContentService } from './services/content/preview';
import { CreatomateService } from './services/creatomate/generator';

// Globale Variablen
let currentPage = 'dashboard';
let currentUser = null;
let apiConnections = {};
let contentCache = {};

// Initialisierung der Services
const instagramService = new InstagramService();
const magazineService = new MagazineService();
const contentService = new ContentService();
const creatomateService = new CreatomateService();

// DOM-Ready Event
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

/**
 * Initialisiert die Anwendung
 */
function initializeApp() {
  // Lade Benutzereinstellungen
  loadUserSettings();
  
  // Initialisiere UI-Komponenten
  initializeUI();
  
  // Initialisiere Services
  initializeServices();
  
  // Lade Dashboard-Daten
  loadDashboardData();
  
  // Event-Listener für Navigation
  setupNavigation();
  
  // Prüfe API-Verbindungen
  checkApiConnections();
  
  console.log('StudiFlow AI Enterprise wurde erfolgreich initialisiert.');
}

/**
 * Lädt die Benutzereinstellungen
 */
function loadUserSettings() {
  // Lade Benutzereinstellungen aus localStorage oder Server
  const savedSettings = localStorage.getItem('user_settings');
  
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      applyTheme(settings.theme || 'light');
      applySidebarState(settings.sidebarCollapsed || false);
      
      console.log('Benutzereinstellungen wurden geladen.');
    } catch (error) {
      console.error('Fehler beim Laden der Benutzereinstellungen:', error);
      // Fallback zu Standardeinstellungen
      applyTheme('light');
      applySidebarState(false);
    }
  } else {
    // Standardeinstellungen
    applyTheme('light');
    applySidebarState(false);
  }
}

/**
 * Wendet das ausgewählte Theme an
 * @param {string} themeName - Name des Themes (light/dark)
 */
function applyTheme(themeName) {
  const body = document.body;
  
  if (themeName === 'dark') {
    body.classList.add('dark-theme');
  } else {
    body.classList.remove('dark-theme');
  }
  
  // Speichere Theme-Einstellung
  const settings = JSON.parse(localStorage.getItem('user_settings') || '{}');
  settings.theme = themeName;
  localStorage.setItem('user_settings', JSON.stringify(settings));
  
  console.log(`Theme "${themeName}" wurde angewendet.`);
}

/**
 * Wendet den Sidebar-Zustand an
 * @param {boolean} collapsed - Ob die Sidebar eingeklappt sein soll
 */
function applySidebarState(collapsed) {
  const sidebar = document.getElementById('app-sidebar');
  
  if (sidebar) {
    if (collapsed) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }
    
    // Speichere Sidebar-Einstellung
    const settings = JSON.parse(localStorage.getItem('user_settings') || '{}');
    settings.sidebarCollapsed = collapsed;
    localStorage.setItem('user_settings', JSON.stringify(settings));
    
    console.log(`Sidebar-Zustand wurde auf ${collapsed ? 'eingeklappt' : 'ausgeklappt'} gesetzt.`);
  }
}

/**
 * Initialisiert die UI-Komponenten
 */
function initializeUI() {
  // Initialisiere Layout
  initializeLayout();
  
  // Initialisiere Sidebar
  initializeSidebar();
  
  // Initialisiere Dropdown-Menüs
  initializeDropdowns();
  
  // Initialisiere Tabs
  initializeTabs();
  
  console.log('UI-Komponenten wurden initialisiert.');
}

/**
 * Initialisiert das Layout
 */
function initializeLayout() {
  // Sidebar-Toggle-Funktionalität
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('app-sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      
      // Speichere den Zustand
      const isCollapsed = sidebar.classList.contains('collapsed');
      applySidebarState(isCollapsed);
    });
  }
  
  // Responsive Sidebar
  function handleResponsiveSidebar() {
    if (window.innerWidth <= 1024) {
      sidebar.classList.remove('collapsed');
      sidebar.classList.add('mobile');
      
      // Erstelle Overlay für mobile Ansicht
      let overlay = document.querySelector('.sidebar-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        });
      }
      
      sidebarToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      });
    } else {
      sidebar.classList.remove('mobile');
      sidebar.classList.remove('open');
      
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        overlay.classList.remove('active');
      }
    }
  }
  
  // Initialisiere responsive Sidebar
  handleResponsiveSidebar();
  
  // Aktualisiere bei Größenänderung
  window.addEventListener('resize', handleResponsiveSidebar);
}

/**
 * Initialisiert die Sidebar
 */
function initializeSidebar() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    const children = item.querySelector('.nav-children');
    
    if (link && children) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        item.classList.toggle('expanded');
      });
    }
  });
}

/**
 * Initialisiert Dropdown-Menüs
 */
function initializeDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (toggle && menu) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
      });
      
      // Schließe Dropdown bei Klick außerhalb
      document.addEventListener('click', () => {
        menu.classList.remove('show');
      });
      
      // Verhindere Schließen bei Klick innerhalb des Menüs
      menu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  });
}

/**
 * Initialisiert Tabs
 */
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Entferne aktive Klasse von allen Tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Füge aktive Klasse zum geklickten Tab hinzu
      tab.classList.add('active');
      
      // Zeige den entsprechenden Tab-Inhalt an
      const tabId = tab.getAttribute('data-tab');
      const tabPanes = document.querySelectorAll('.tab-pane');
      
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === tabId) {
          pane.classList.add('active');
        }
      });
    });
  });
}

/**
 * Initialisiert die Services
 */
function initializeServices() {
  // Initialisiere Instagram-Service
  instagramService.initialize()
    .then(() => {
      console.log('Instagram-Service wurde initialisiert.');
      // Lade Instagram-Daten
      loadInstagramData();
    })
    .catch(error => {
      console.error('Fehler bei der Initialisierung des Instagram-Service:', error);
      showErrorNotification('Instagram-Service konnte nicht initialisiert werden.');
    });
  
  // Initialisiere Magazin-Service
  magazineService.initialize()
    .then(() => {
      console.log('Magazin-Service wurde initialisiert.');
      // Lade Magazin-Daten
      loadMagazineData();
    })
    .catch(error => {
      console.error('Fehler bei der Initialisierung des Magazin-Service:', error);
      showErrorNotification('Magazin-Service konnte nicht initialisiert werden.');
    });
  
  // Initialisiere Content-Service
  contentService.initialize()
    .then(() => {
      console.log('Content-Service wurde initialisiert.');
    })
    .catch(error => {
      console.error('Fehler bei der Initialisierung des Content-Service:', error);
      showErrorNotification('Content-Service konnte nicht initialisiert werden.');
    });
  
  // Initialisiere Creatomate-Service
  creatomateService.initialize()
    .then(() => {
      console.log('Creatomate-Service wurde initialisiert.');
    })
    .catch(error => {
      console.error('Fehler bei der Initialisierung des Creatomate-Service:', error);
      showErrorNotification('Creatomate-Service konnte nicht initialisiert werden.');
    });
}

/**
 * Lädt die Dashboard-Daten
 */
function loadDashboardData() {
  // Lade Statistiken
  loadDashboardStats();
  
  // Lade Content-Übersicht
  loadContentOverview();
  
  // Lade Magazin-Artikel
  loadMagazineArticles();
  
  // Lade Instagram-Konten
  loadInstagramAccounts();
  
  // Lade geplante Posts
  loadScheduledPosts();
  
  // Lade KI-Aktivitäten
  loadAIActivities();
  
  console.log('Dashboard-Daten wurden geladen.');
}

/**
 * Lädt die Dashboard-Statistiken
 */
function loadDashboardStats() {
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const stats = {
    instagramPosts: {
      value: 24,
      change: 12,
      period: 'diese Woche'
    },
    reelsGenerated: {
      value: 8,
      change: 50,
      period: 'diese Woche'
    },
    magazineArticles: {
      value: 42,
      change: 8,
      period: 'diesen Monat'
    },
    engagement: {
      value: '1.2k',
      change: 18,
      period: 'diesen Monat'
    }
  };
  
  // Aktualisiere die UI mit den Statistiken
  updateDashboardStats(stats);
}

/**
 * Aktualisiert die Dashboard-Statistiken in der UI
 * @param {Object} stats - Die Statistikdaten
 */
function updateDashboardStats(stats) {
  // Aktualisiere Instagram-Posts
  const instagramPostsValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
  const instagramPostsChange = document.querySelector('.stat-card:nth-child(1) .stat-change');
  const instagramPostsPeriod = document.querySelector('.stat-card:nth-child(1) .stat-period');
  
  if (instagramPostsValue && instagramPostsChange && instagramPostsPeriod) {
    instagramPostsValue.textContent = stats.instagramPosts.value;
    instagramPostsChange.textContent = `+${stats.instagramPosts.change}% `;
    instagramPostsPeriod.textContent = stats.instagramPosts.period;
  }
  
  // Aktualisiere Reels generiert
  const reelsGeneratedValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
  const reelsGeneratedChange = document.querySelector('.stat-card:nth-child(2) .stat-change');
  const reelsGeneratedPeriod = document.querySelector('.stat-card:nth-child(2) .stat-period');
  
  if (reelsGeneratedValue && reelsGeneratedChange && reelsGeneratedPeriod) {
    reelsGeneratedValue.textContent = stats.reelsGenerated.value;
    reelsGeneratedChange.textContent = `+${stats.reelsGenerated.change}% `;
    reelsGeneratedPeriod.textContent = stats.reelsGenerated.period;
  }
  
  // Aktualisiere Magazin-Artikel
  const magazineArticlesValue = document.querySelector('.stat-card:nth-child(3) .stat-value');
  const magazineArticlesChange = document.querySelector('.stat-card:nth-child(3) .stat-change');
  const magazineArticlesPeriod = document.querySelector('.stat-card:nth-child(3) .stat-period');
  
  if (magazineArticlesValue && magazineArticlesChange && magazineArticlesPeriod) {
    magazineArticlesValue.textContent = stats.magazineArticles.value;
    magazineArticlesChange.textContent = `+${stats.magazineArticles.change}% `;
    magazineArticlesPeriod.textContent = stats.magazineArticles.period;
  }
  
  // Aktualisiere Engagement
  const engagementValue = document.querySelector('.stat-card:nth-child(4) .stat-value');
  const engagementChange = document.querySelector('.stat-card:nth-child(4) .stat-change');
  const engagementPeriod = document.querySelector('.stat-card:nth-child(4) .stat-period');
  
  if (engagementValue && engagementChange && engagementPeriod) {
    engagementValue.textContent = stats.engagement.value;
    engagementChange.textContent = `+${stats.engagement.change}% `;
    engagementPeriod.textContent = stats.engagement.period;
  }
}

/**
 * Lädt die Content-Übersicht
 */
function loadContentOverview() {
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const contentItems = [
    {
      id: 1,
      title: '10 Tipps für effektives Lernen',
      type: 'Instagram Post',
      date: 'Vor 2 Stunden',
      thumbnail: 'assets/images/content-1.jpg',
      stats: {
        likes: 45,
        comments: 12,
        shares: 8
      }
    },
    {
      id: 2,
      title: 'Studieren im Ausland: Erfahrungsbericht',
      type: 'Instagram Carousel',
      date: 'Gestern',
      thumbnail: 'assets/images/content-2.jpg',
      stats: {
        likes: 87,
        comments: 23,
        shares: 15
      }
    },
    {
      id: 3,
      title: 'Prüfungsvorbereitung in 5 Schritten',
      type: 'Instagram Reel',
      date: 'Vor 3 Tagen',
      thumbnail: 'assets/images/content-3.jpg',
      stats: {
        likes: 156,
        comments: 34,
        shares: 42
      },
      isVideo: true
    }
  ];
  
  // Aktualisiere die UI mit den Content-Items
  updateContentOverview(contentItems);
}

/**
 * Aktualisiert die Content-Übersicht in der UI
 * @param {Array} contentItems - Die Content-Items
 */
function updateContentOverview(contentItems) {
  const contentList = document.querySelector('.content-list');
  
  if (contentList) {
    // Leere die Liste
    contentList.innerHTML = '';
    
    // Füge die Content-Items hinzu
    contentItems.forEach(item => {
      const contentItem = document.createElement('div');
      contentItem.className = 'content-item';
      
      contentItem.innerHTML = `
        <div class="content-thumbnail${item.isVideo ? ' video-thumbnail' : ''}">
          <img src="${item.thumbnail}" alt="${item.title}" />
          ${item.isVideo ? '<div class="video-indicator"><i class="material-icons">play_arrow</i></div>' : ''}
        </div>
        <div class="content-details">
          <h3 class="content-title">${item.title}</h3>
          <div class="content-meta">
            <span class="content-type">${item.type}</span>
            <span class="content-date">${item.date}</span>
          </div>
          <div class="content-stats">
            <span class="content-stat"><i class="material-icons">thumb_up</i> ${item.stats.likes}</span>
            <span class="content-stat"><i class="material-icons">comment</i> ${item.stats.comments}</span>
            <span class="content-stat"><i class="material-icons">share</i> ${item.stats.shares}</span>
          </div>
        </div>
        <div class="content-actions">
          <button class="btn btn-sm btn-text" data-id="${item.id}" data-action="edit">
            <i class="material-icons">edit</i>
          </button>
          <button class="btn btn-sm btn-text" data-id="${item.id}" data-action="delete">
            <i class="material-icons">delete</i>
          </button>
        </div>
      `;
      
      contentList.appendChild(contentItem);
    });
    
    // Füge Event-Listener für die Aktionen hinzu
    const editButtons = document.querySelectorAll('[data-action="edit"]');
    const deleteButtons = document.querySelectorAll('[data-action="delete"]');
    
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const contentId = button.getAttribute('data-id');
        editContent(contentId);
      });
    });
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const contentId = button.getAttribute('data-id');
        deleteContent(contentId);
      });
    });
  }
}

/**
 * Bearbeitet einen Content
 * @param {string} contentId - Die ID des Contents
 */
function editContent(contentId) {
  console.log(`Content mit ID ${contentId} wird bearbeitet.`);
  // Hier würde die Bearbeitungslogik implementiert werden
  // z.B. Öffnen eines Modals oder Navigieren zur Bearbeitungsseite
}

/**
 * Löscht einen Content
 * @param {string} contentId - Die ID des Contents
 */
function deleteContent(contentId) {
  console.log(`Content mit ID ${contentId} wird gelöscht.`);
  // Hier würde die Löschlogik implementiert werden
  // z.B. Anzeigen einer Bestätigungsdialog und dann Löschen
  
  if (confirm(`Möchten Sie den Content mit ID ${contentId} wirklich löschen?`)) {
    // Hier würde der tatsächliche API-Aufruf zum Löschen stattfinden
    console.log(`Content mit ID ${contentId} wurde gelöscht.`);
    showSuccessNotification('Content wurde erfolgreich gelöscht.');
    
    // Aktualisiere die Content-Übersicht
    loadContentOverview();
  }
}

/**
 * Lädt die Magazin-Artikel
 */
function loadMagazineArticles() {
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const magazineArticles = [
    {
      id: 1,
      title: 'Die besten Lernmethoden für verschiedene Fachbereiche',
      category: 'Lernstrategien',
      date: '15. Mai 2025',
      thumbnail: 'assets/images/magazine-1.jpg',
      excerpt: 'Jeder Fachbereich erfordert unterschiedliche Lernansätze. In diesem Artikel stellen wir die effektivsten Methoden vor...'
    },
    {
      id: 2,
      title: 'Finanzierung des Studiums: Stipendien und Fördermöglichkeiten',
      category: 'Finanzen',
      date: '12. Mai 2025',
      thumbnail: 'assets/images/magazine-2.jpg',
      excerpt: 'Ein Überblick über die verschiedenen Finanzierungsmöglichkeiten für Studierende, von BAföG bis zu privaten Stipendien...'
    }
  ];
  
  // Aktualisiere die UI mit den Magazin-Artikeln
  updateMagazineArticles(magazineArticles);
}

/**
 * Aktualisiert die Magazin-Artikel in der UI
 * @param {Array} magazineArticles - Die Magazin-Artikel
 */
function updateMagazineArticles(magazineArticles) {
  const magazineList = document.querySelector('.magazine-list');
  
  if (magazineList) {
    // Leere die Liste
    magazineList.innerHTML = '';
    
    // Füge die Magazin-Artikel hinzu
    magazineArticles.forEach(article => {
      const magazineItem = document.createElement('div');
      magazineItem.className = 'magazine-item';
      
      magazineItem.innerHTML = `
        <div class="magazine-thumbnail">
          <img src="${article.thumbnail}" alt="${article.title}" />
        </div>
        <div class="magazine-details">
          <h3 class="magazine-title">${article.title}</h3>
          <div class="magazine-meta">
            <span class="magazine-category">${article.category}</span>
            <span class="magazine-date">${article.date}</span>
          </div>
          <p class="magazine-excerpt">
            ${article.excerpt}
          </p>
        </div>
        <div class="magazine-actions">
          <button class="btn btn-sm btn-primary" data-id="${article.id}" data-action="create-content">
            <i class="material-icons">auto_awesome</i>
            Content erstellen
          </button>
        </div>
      `;
      
      magazineList.appendChild(magazineItem);
    });
    
    // Füge Event-Listener für die Aktionen hinzu
    const createContentButtons = document.querySelectorAll('[data-action="create-content"]');
    
    createContentButtons.forEach(button => {
      button.addEventListener('click', () => {
        const articleId = button.getAttribute('data-id');
        createContentFromArticle(articleId);
      });
    });
  }
}

/**
 * Erstellt Content aus einem Magazin-Artikel
 * @param {string} articleId - Die ID des Artikels
 */
function createContentFromArticle(articleId) {
  console.log(`Content wird aus Artikel mit ID ${articleId} erstellt.`);
  // Hier würde die Content-Erstellungslogik implementiert werden
  // z.B. Öffnen eines Modals oder Navigieren zur Content-Erstellungsseite
  
  // Zeige eine Erfolgsmeldung
  showSuccessNotification('Content-Erstellung wurde gestartet. Sie werden benachrichtigt, sobald der Prozess abgeschlossen ist.');
}

/**
 * Lädt die Instagram-Daten
 */
function loadInstagramData() {
  // Lade Instagram-Konten
  loadInstagramAccounts();
  
  // Lade geplante Posts
  loadScheduledPosts();
  
  console.log('Instagram-Daten wurden geladen.');
}

/**
 * Lädt die Instagram-Konten
 */
function loadInstagramAccounts() {
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const instagramAccounts = [
    {
      id: 1,
      name: 'studibuch_official',
      avatar: 'assets/images/account-1.jpg',
      followers: '12.5k',
      posts: 245,
      connected: true
    },
    {
      id: 2,
      name: 'studibuch_tipps',
      avatar: 'assets/images/account-2.jpg',
      followers: '8.3k',
      posts: 178,
      connected: true
    }
  ];
  
  // Aktualisiere die UI mit den Instagram-Konten
  updateInstagramAccounts(instagramAccounts);
}

/**
 * Aktualisiert die Instagram-Konten in der UI
 * @param {Array} instagramAccounts - Die Instagram-Konten
 */
function updateInstagramAccounts(instagramAccounts) {
  const accountList = document.querySelector('.account-list');
  
  if (accountList) {
    // Leere die Liste
    accountList.innerHTML = '';
    
    // Füge die Instagram-Konten hinzu
    instagramAccounts.forEach(account => {
      const accountItem = document.createElement('div');
      accountItem.className = 'account-item';
      
      accountItem.innerHTML = `
        <div class="account-avatar">
          <img src="${account.avatar}" alt="${account.name}" />
        </div>
        <div class="account-details">
          <h3 class="account-name">${account.name}</h3>
          <div class="account-stats">
            <span class="account-stat">${account.followers} Follower</span>
            <span class="account-stat">${account.posts} Posts</span>
          </div>
        </div>
        <div class="account-status ${account.connected ? 'connected' : ''}">
          <i class="material-icons">${account.connected ? 'check_circle' : 'error'}</i>
        </div>
      `;
      
      accountList.appendChild(accountItem);
    });
    
    // Füge "Neues Konto verbinden" hinzu
    const newAccountItem = document.createElement('div');
    newAccountItem.className = 'account-item';
    
    newAccountItem.innerHTML = `
      <div class="account-avatar placeholder">
        <i class="material-icons">add</i>
      </div>
      <div class="account-details">
        <h3 class="account-name">Neues Konto verbinden</h3>
        <div class="account-stats">
          <span class="account-stat">Instagram-Konto hinzufügen</span>
        </div>
      </div>
      <div class="account-status">
        <i class="material-icons">arrow_forward</i>
      </div>
    `;
    
    accountList.appendChild(newAccountItem);
    
    // Füge Event-Listener für "Neues Konto verbinden" hinzu
    newAccountItem.addEventListener('click', () => {
      connectNewInstagramAccount();
    });
  }
}

/**
 * Verbindet ein neues Instagram-Konto
 */
function connectNewInstagramAccount() {
  console.log('Neues Instagram-Konto wird verbunden.');
  // Hier würde die Verbindungslogik implementiert werden
  // z.B. Öffnen eines Modals oder Navigieren zur Verbindungsseite
  
  // Zeige eine Erfolgsmeldung
  showInfoNotification('Um ein neues Instagram-Konto zu verbinden, müssen Sie sich bei Instagram anmelden und die Berechtigung erteilen.');
}

/**
 * Lädt die geplanten Posts
 */
function loadScheduledPosts() {
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const scheduledPosts = [
    {
      id: 1,
      title: 'Zeitmanagement im Studium',
      account: '@studibuch_tipps',
      date: 'Heute',
      time: '14:30',
      thumbnail: 'assets/images/schedule-1.jpg'
    },
    {
      id: 2,
      title: 'Bücher für das Sommersemester',
      account: '@studibuch_official',
      date: 'Morgen',
      time: '10:00',
      thumbnail: 'assets/images/schedule-2.jpg'
    },
    {
      id: 3,
      title: 'Motivationstipps für die Prüfungsphase',
      account: '@studibuch_tipps',
      date: '27. Mai',
      time: '16:45',
      thumbnail: 'assets/images/schedule-3.jpg',
      isVideo: true
    }
  ];
  
  // Aktualisiere die UI mit den geplanten Posts
  updateScheduledPosts(scheduledPosts);
}

/**
 * Aktualisiert die geplanten Posts in der UI
 * @param {Array} scheduledPosts - Die geplanten Posts
 */
function updateScheduledPosts(scheduledPosts) {
  const scheduleList = document.querySelector('.schedule-list');
  
  if (scheduleList) {
    // Leere die Liste
    scheduleList.innerHTML = '';
    
    // Füge die geplanten Posts hinzu
    scheduledPosts.forEach(post => {
      const scheduleItem = document.createElement('div');
      scheduleItem.className = 'schedule-item';
      
      scheduleItem.innerHTML = `
        <div class="schedule-time">
          <div class="schedule-date">${post.date}</div>
          <div class="schedule-hour">${post.time}</div>
        </div>
        <div class="schedule-content">
          <div class="schedule-thumbnail${post.isVideo ? ' video-thumbnail' : ''}">
            <img src="${post.thumbnail}" alt="${post.title}" />
            ${post.isVideo ? '<div class="video-indicator"><i class="material-icons">play_arrow</i></div>' : ''}
          </div>
          <div class="schedule-details">
            <h3 class="schedule-title">${post.title}</h3>
            <div class="schedule-account">${post.account}</div>
          </div>
        </div>
        <div class="schedule-actions">
          <button class="btn btn-sm btn-text" data-id="${post.id}" data-action="edit-schedule">
            <i class="material-icons">edit</i>
          </button>
        </div>
      `;
      
      scheduleList.appendChild(scheduleItem);
    });
    
    // Füge Event-Listener für die Aktionen hinzu
    const editButtons = document.querySelectorAll('[data-action="edit-schedule"]');
    
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const postId = button.getAttribute('data-id');
        editScheduledPost(postId);
      });
    });
  }
}

/**
 * Bearbeitet einen geplanten Post
 * @param {string} postId - Die ID des Posts
 */
function editScheduledPost(postId) {
  console.log(`Geplanter Post mit ID ${postId} wird bearbeitet.`);
  // Hier würde die Bearbeitungslogik implementiert werden
  // z.B. Öffnen eines Modals oder Navigieren zur Bearbeitungsseite
}

/**
 * Lädt die Magazin-Daten
 */
function loadMagazineData() {
  // Lade Magazin-Artikel
  loadMagazineArticles();
  
  console.log('Magazin-Daten wurden geladen.');
}

/**
 * Lädt die KI-Aktivitäten
 */
function loadAIActivities() {
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const aiActivities = [
    {
      id: 1,
      title: 'Content-Generierung abgeschlossen',
      meta: '5 Posts aus 2 Artikeln',
      time: 'Vor 35 Minuten',
      icon: 'auto_awesome'
    },
    {
      id: 2,
      title: 'Reel-Generierung abgeschlossen',
      meta: 'Prüfungsvorbereitung in 5 Schritten',
      time: 'Vor 2 Stunden',
      icon: 'movie'
    },
    {
      id: 3,
      title: 'Magazin-Scraping abgeschlossen',
      meta: '12 neue Artikel gefunden',
      time: 'Vor 4 Stunden',
      icon: 'sync'
    }
  ];
  
  // Aktualisiere die UI mit den KI-Aktivitäten
  updateAIActivities(aiActivities);
}

/**
 * Aktualisiert die KI-Aktivitäten in der UI
 * @param {Array} aiActivities - Die KI-Aktivitäten
 */
function updateAIActivities(aiActivities) {
  const aiActivityList = document.querySelector('.ai-activity-list');
  
  if (aiActivityList) {
    // Leere die Liste
    aiActivityList.innerHTML = '';
    
    // Füge die KI-Aktivitäten hinzu
    aiActivities.forEach(activity => {
      const aiActivityItem = document.createElement('div');
      aiActivityItem.className = 'ai-activity-item';
      
      aiActivityItem.innerHTML = `
        <div class="ai-activity-icon">
          <i class="material-icons">${activity.icon}</i>
        </div>
        <div class="ai-activity-details">
          <div class="ai-activity-title">${activity.title}</div>
          <div class="ai-activity-meta">${activity.meta}</div>
          <div class="ai-activity-time">${activity.time}</div>
        </div>
        <div class="ai-activity-actions">
          <button class="btn btn-sm btn-text" data-id="${activity.id}" data-action="view-activity">
            <i class="material-icons">visibility</i>
          </button>
        </div>
      `;
      
      aiActivityList.appendChild(aiActivityItem);
    });
    
    // Füge Event-Listener für die Aktionen hinzu
    const viewButtons = document.querySelectorAll('[data-action="view-activity"]');
    
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const activityId = button.getAttribute('data-id');
        viewAIActivity(activityId);
      });
    });
  }
}

/**
 * Zeigt eine KI-Aktivität an
 * @param {string} activityId - Die ID der Aktivität
 */
function viewAIActivity(activityId) {
  console.log(`KI-Aktivität mit ID ${activityId} wird angezeigt.`);
  // Hier würde die Anzeigelogik implementiert werden
  // z.B. Öffnen eines Modals oder Navigieren zur Detailseite
}

/**
 * Richtet die Navigation ein
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const hasChildren = link.nextElementSibling && link.nextElementSibling.classList.contains('nav-children');
      
      if (!hasChildren) {
        e.preventDefault();
        
        // Entferne aktive Klasse von allen Links
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Füge aktive Klasse zum geklickten Link hinzu
        link.classList.add('active');
        
        // Navigiere zur entsprechenden Seite
        const pageName = link.getAttribute('href').replace('#', '');
        if (pageName) {
          navigateToPage(pageName);
        }
      }
    });
  });
}

/**
 * Navigiert zu einer Seite
 * @param {string} pageName - Der Name der Seite
 */
function navigateToPage(pageName) {
  console.log(`Navigiere zu Seite: ${pageName}`);
  // Hier würde die Navigationslogik implementiert werden
  
  // Aktualisiere die aktuelle Seite
  currentPage = pageName;
  
  // Aktualisiere den Seitentitel
  updatePageTitle(pageName);
  
  // Lade die Seitendaten
  loadPageData(pageName);
}

/**
 * Aktualisiert den Seitentitel
 * @param {string} pageName - Der Name der Seite
 */
function updatePageTitle(pageName) {
  const contentTitle = document.querySelector('.content-title');
  
  if (contentTitle) {
    // Setze den Seitentitel basierend auf dem Seitennamen
    switch (pageName) {
      case 'dashboard':
        contentTitle.textContent = 'Dashboard';
        break;
      case 'content':
        contentTitle.textContent = 'Content';
        break;
      case 'instagram':
        contentTitle.textContent = 'Instagram';
        break;
      case 'magazine':
        contentTitle.textContent = 'Magazin';
        break;
      case 'ai':
        contentTitle.textContent = 'KI-Tools';
        break;
      case 'automation':
        contentTitle.textContent = 'Automatisierung';
        break;
      case 'settings':
        contentTitle.textContent = 'Einstellungen';
        break;
      default:
        contentTitle.textContent = 'Dashboard';
        break;
    }
  }
}

/**
 * Lädt die Seitendaten
 * @param {string} pageName - Der Name der Seite
 */
function loadPageData(pageName) {
  // Lade die Seitendaten basierend auf dem Seitennamen
  switch (pageName) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'content':
      loadContentData();
      break;
    case 'instagram':
      loadInstagramData();
      break;
    case 'magazine':
      loadMagazineData();
      break;
    case 'ai':
      loadAIData();
      break;
    case 'automation':
      loadAutomationData();
      break;
    case 'settings':
      loadSettingsData();
      break;
    default:
      loadDashboardData();
      break;
  }
}

/**
 * Lädt die Content-Daten
 */
function loadContentData() {
  console.log('Content-Daten werden geladen...');
  // Hier würde die Logik zum Laden der Content-Daten implementiert werden
}

/**
 * Lädt die KI-Daten
 */
function loadAIData() {
  console.log('KI-Daten werden geladen...');
  // Hier würde die Logik zum Laden der KI-Daten implementiert werden
}

/**
 * Lädt die Automatisierungs-Daten
 */
function loadAutomationData() {
  console.log('Automatisierungs-Daten werden geladen...');
  // Hier würde die Logik zum Laden der Automatisierungs-Daten implementiert werden
}

/**
 * Lädt die Einstellungs-Daten
 */
function loadSettingsData() {
  console.log('Einstellungs-Daten werden geladen...');
  // Hier würde die Logik zum Laden der Einstellungs-Daten implementiert werden
}

/**
 * Prüft die API-Verbindungen
 */
function checkApiConnections() {
  // Prüfe Instagram API
  checkInstagramAPI();
  
  // Prüfe Creatomate API
  checkCreatomateAPI();
  
  console.log('API-Verbindungen wurden geprüft.');
}

/**
 * Prüft die Instagram API
 */
function checkInstagramAPI() {
  // Hier würde die tatsächliche API-Prüfung stattfinden
  // Für die Demo verwenden wir einen simulierten Status
  
  const isConnected = true;
  
  if (isConnected) {
    console.log('Instagram API ist verbunden.');
    apiConnections.instagram = true;
  } else {
    console.error('Instagram API ist nicht verbunden.');
    apiConnections.instagram = false;
    showErrorNotification('Instagram API ist nicht verbunden. Bitte überprüfen Sie Ihre API-Einstellungen.');
  }
}

/**
 * Prüft die Creatomate API
 */
function checkCreatomateAPI() {
  // Hier würde die tatsächliche API-Prüfung stattfinden
  // Für die Demo verwenden wir einen simulierten Status
  
  const isConnected = true;
  
  if (isConnected) {
    console.log('Creatomate API ist verbunden.');
    apiConnections.creatomate = true;
  } else {
    console.error('Creatomate API ist nicht verbunden.');
    apiConnections.creatomate = false;
    showErrorNotification('Creatomate API ist nicht verbunden. Bitte überprüfen Sie Ihre API-Einstellungen.');
  }
}

/**
 * Zeigt eine Erfolgs-Benachrichtigung an
 * @param {string} message - Die Nachricht
 */
function showSuccessNotification(message) {
  // Hier würde die Benachrichtigungslogik implementiert werden
  console.log(`Erfolg: ${message}`);
  
  // Erstelle eine Toast-Benachrichtigung
  createToast('success', 'Erfolg', message);
}

/**
 * Zeigt eine Info-Benachrichtigung an
 * @param {string} message - Die Nachricht
 */
function showInfoNotification(message) {
  // Hier würde die Benachrichtigungslogik implementiert werden
  console.log(`Info: ${message}`);
  
  // Erstelle eine Toast-Benachrichtigung
  createToast('info', 'Information', message);
}

/**
 * Zeigt eine Fehler-Benachrichtigung an
 * @param {string} message - Die Nachricht
 */
function showErrorNotification(message) {
  // Hier würde die Benachrichtigungslogik implementiert werden
  console.error(`Fehler: ${message}`);
  
  // Erstelle eine Toast-Benachrichtigung
  createToast('error', 'Fehler', message);
}

/**
 * Erstellt eine Toast-Benachrichtigung
 * @param {string} type - Der Typ der Benachrichtigung (success, info, error)
 * @param {string} title - Der Titel der Benachrichtigung
 * @param {string} message - Die Nachricht der Benachrichtigung
 */
function createToast(type, title, message) {
  // Prüfe, ob der Toast-Container existiert
  let toastContainer = document.querySelector('.toast-container');
  
  // Erstelle den Toast-Container, wenn er nicht existiert
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Erstelle den Toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Setze das Icon basierend auf dem Typ
  let icon = '';
  switch (type) {
    case 'success':
      icon = 'check_circle';
      break;
    case 'info':
      icon = 'info';
      break;
    case 'error':
      icon = 'error';
      break;
    default:
      icon = 'info';
      break;
  }
  
  // Setze den Toast-Inhalt
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="material-icons">${icon}</i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">
      <i class="material-icons">close</i>
    </button>
  `;
  
  // Füge den Toast zum Container hinzu
  toastContainer.appendChild(toast);
  
  // Füge Event-Listener für den Schließen-Button hinzu
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
  
  // Entferne den Toast nach 5 Sekunden
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// Exportiere die öffentlichen Funktionen
export {
  initializeApp,
  loadDashboardData,
  loadInstagramData,
  loadMagazineData,
  navigateToPage,
  showSuccessNotification,
  showInfoNotification,
  showErrorNotification
};
