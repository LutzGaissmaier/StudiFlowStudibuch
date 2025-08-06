/**
 * UI-Layout für StudiFlow AI Enterprise
 * 
 * Implementiert das einheitliche Layout und die Navigation für die gesamte Anwendung.
 * 
 * @version 1.0.0
 */

import { colors, typography, spacing, shadows, borderRadius, transitions, breakpoints } from './theme';

// Hauptnavigationsstruktur
export const mainNavigation = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    path: '/dashboard',
    permission: 'view_dashboard'
  },
  {
    id: 'content',
    label: 'Content',
    icon: 'content_paste',
    path: '/content',
    permission: 'view_content',
    children: [
      {
        id: 'content-overview',
        label: 'Übersicht',
        path: '/content/overview',
        permission: 'view_content'
      },
      {
        id: 'content-create',
        label: 'Erstellen',
        path: '/content/create',
        permission: 'create_content'
      },
      {
        id: 'content-calendar',
        label: 'Kalender',
        path: '/content/calendar',
        permission: 'view_content_calendar'
      },
      {
        id: 'content-analytics',
        label: 'Analyse',
        path: '/content/analytics',
        permission: 'view_content_analytics'
      }
    ]
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'photo_camera',
    path: '/instagram',
    permission: 'view_instagram',
    children: [
      {
        id: 'instagram-accounts',
        label: 'Accounts',
        path: '/instagram/accounts',
        permission: 'view_instagram_accounts'
      },
      {
        id: 'instagram-posts',
        label: 'Posts',
        path: '/instagram/posts',
        permission: 'view_instagram_posts'
      },
      {
        id: 'instagram-reels',
        label: 'Reels',
        path: '/instagram/reels',
        permission: 'view_instagram_reels'
      },
      {
        id: 'instagram-stories',
        label: 'Stories',
        path: '/instagram/stories',
        permission: 'view_instagram_stories'
      },
      {
        id: 'instagram-analytics',
        label: 'Analyse',
        path: '/instagram/analytics',
        permission: 'view_instagram_analytics'
      }
    ]
  },
  {
    id: 'magazine',
    label: 'Magazin',
    icon: 'menu_book',
    path: '/magazine',
    permission: 'view_magazine',
    children: [
      {
        id: 'magazine-articles',
        label: 'Artikel',
        path: '/magazine/articles',
        permission: 'view_magazine_articles'
      },
      {
        id: 'magazine-scraping',
        label: 'Scraping',
        path: '/magazine/scraping',
        permission: 'manage_magazine_scraping'
      },
      {
        id: 'magazine-categories',
        label: 'Kategorien',
        path: '/magazine/categories',
        permission: 'manage_magazine_categories'
      }
    ]
  },
  {
    id: 'ai',
    label: 'KI-Tools',
    icon: 'smart_toy',
    path: '/ai',
    permission: 'view_ai_tools',
    children: [
      {
        id: 'ai-content-generation',
        label: 'Content-Generierung',
        path: '/ai/content-generation',
        permission: 'use_ai_content_generation'
      },
      {
        id: 'ai-image-generation',
        label: 'Bild-Generierung',
        path: '/ai/image-generation',
        permission: 'use_ai_image_generation'
      },
      {
        id: 'ai-reel-generation',
        label: 'Reel-Generierung',
        path: '/ai/reel-generation',
        permission: 'use_ai_reel_generation'
      }
    ]
  },
  {
    id: 'automation',
    label: 'Automatisierung',
    icon: 'auto_fix_high',
    path: '/automation',
    permission: 'view_automation',
    children: [
      {
        id: 'automation-workflows',
        label: 'Workflows',
        path: '/automation/workflows',
        permission: 'manage_automation_workflows'
      },
      {
        id: 'automation-schedules',
        label: 'Zeitpläne',
        path: '/automation/schedules',
        permission: 'manage_automation_schedules'
      },
      {
        id: 'automation-logs',
        label: 'Logs',
        path: '/automation/logs',
        permission: 'view_automation_logs'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Einstellungen',
    icon: 'settings',
    path: '/settings',
    permission: 'view_settings',
    children: [
      {
        id: 'settings-general',
        label: 'Allgemein',
        path: '/settings/general',
        permission: 'manage_general_settings'
      },
      {
        id: 'settings-api',
        label: 'API-Verbindungen',
        path: '/settings/api',
        permission: 'manage_api_settings'
      },
      {
        id: 'settings-users',
        label: 'Benutzer',
        path: '/settings/users',
        permission: 'manage_users'
      },
      {
        id: 'settings-roles',
        label: 'Rollen',
        path: '/settings/roles',
        permission: 'manage_roles'
      }
    ]
  }
];

// Layout-Struktur
export const layoutStructure = {
  header: {
    height: '64px',
    backgroundColor: colors.card,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,
    zIndex: 1000
  },
  sidebar: {
    width: '260px',
    collapsedWidth: '64px',
    backgroundColor: colors.card,
    borderRight: `1px solid ${colors.border}`,
    zIndex: 900
  },
  content: {
    padding: spacing.lg,
    backgroundColor: colors.background
  },
  footer: {
    height: '40px',
    backgroundColor: colors.card,
    borderTop: `1px solid ${colors.border}`,
    padding: `0 ${spacing.lg}`
  }
};

// Header-Komponente HTML
export const headerTemplate = `
  <header class="app-header">
    <div class="header-left">
      <button class="sidebar-toggle" id="sidebar-toggle">
        <i class="material-icons">menu</i>
      </button>
      <div class="app-logo">
        <img src="/assets/images/logo.png" alt="StudiFlow AI Enterprise" />
        <span class="app-title">StudiFlow AI Enterprise</span>
      </div>
    </div>
    <div class="header-center">
      <div class="search-bar">
        <i class="material-icons">search</i>
        <input type="text" placeholder="Suchen..." />
      </div>
    </div>
    <div class="header-right">
      <div class="header-actions">
        <button class="action-button" title="Benachrichtigungen">
          <i class="material-icons">notifications</i>
          <span class="badge">3</span>
        </button>
        <button class="action-button" title="Hilfe">
          <i class="material-icons">help_outline</i>
        </button>
        <div class="user-menu dropdown">
          <button class="dropdown-toggle user-button">
            <div class="user-avatar">
              <img src="/assets/images/avatar.png" alt="Benutzer" />
            </div>
            <span class="user-name">Max Mustermann</span>
            <i class="material-icons">arrow_drop_down</i>
          </button>
          <div class="dropdown-menu">
            <a href="/profile" class="dropdown-item">
              <i class="material-icons">person</i>
              Profil
            </a>
            <a href="/settings/account" class="dropdown-item">
              <i class="material-icons">settings</i>
              Einstellungen
            </a>
            <div class="dropdown-divider"></div>
            <a href="/logout" class="dropdown-item">
              <i class="material-icons">exit_to_app</i>
              Abmelden
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
`;

// Sidebar-Komponente HTML
export const sidebarTemplate = `
  <aside class="app-sidebar" id="app-sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <img src="/assets/images/logo-icon.png" alt="StudiFlow" class="logo-icon" />
        <span class="logo-text">StudiFlow</span>
      </div>
    </div>
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <!-- Wird dynamisch gefüllt -->
        </ul>
      </nav>
    </div>
    <div class="sidebar-footer">
      <div class="sidebar-footer-content">
        <span class="version">v1.0.0</span>
        <a href="https://studibuch.de" target="_blank" class="company-link">
          <img src="/assets/images/studibuch-logo.png" alt="StudiBuch" />
        </a>
      </div>
    </div>
  </aside>
`;

// Content-Bereich HTML
export const contentTemplate = `
  <main class="app-content">
    <div class="content-header">
      <h1 class="content-title">Dashboard</h1>
      <div class="content-breadcrumb">
        <ul class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">Home</a></li>
          <li class="breadcrumb-item active">Dashboard</li>
        </ul>
      </div>
    </div>
    <div class="content-body">
      <!-- Wird dynamisch gefüllt -->
    </div>
  </main>
`;

// Footer-Komponente HTML
export const footerTemplate = `
  <footer class="app-footer">
    <div class="footer-content">
      <div class="copyright">
        &copy; ${new Date().getFullYear()} StudiBuch. Alle Rechte vorbehalten.
      </div>
      <div class="footer-links">
        <a href="/datenschutz">Datenschutz</a>
        <a href="/impressum">Impressum</a>
        <a href="/kontakt">Kontakt</a>
      </div>
    </div>
  </footer>
`;

// Hauptlayout HTML
export const mainLayoutTemplate = `
  <div class="app-container">
    ${headerTemplate}
    <div class="app-body">
      ${sidebarTemplate}
      ${contentTemplate}
    </div>
    ${footerTemplate}
  </div>
`;

// CSS für das Layout
export const layoutStyles = `
  /* Layout-Grundstruktur */
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }

  .app-header {
    height: ${layoutStructure.header.height};
    background-color: ${layoutStructure.header.backgroundColor};
    border-bottom: ${layoutStructure.header.borderBottom};
    box-shadow: ${layoutStructure.header.boxShadow};
    z-index: ${layoutStructure.header.zIndex};
    display: flex;
    align-items: center;
    padding: 0 ${spacing.lg};
  }

  .app-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .app-sidebar {
    width: ${layoutStructure.sidebar.width};
    background-color: ${layoutStructure.sidebar.backgroundColor};
    border-right: ${layoutStructure.sidebar.borderRight};
    z-index: ${layoutStructure.sidebar.zIndex};
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
  }

  .app-sidebar.collapsed {
    width: ${layoutStructure.sidebar.collapsedWidth};
  }

  .app-content {
    flex: 1;
    overflow-y: auto;
    padding: ${layoutStructure.content.padding};
    background-color: ${layoutStructure.content.backgroundColor};
    display: flex;
    flex-direction: column;
  }

  .app-footer {
    height: ${layoutStructure.footer.height};
    background-color: ${layoutStructure.footer.backgroundColor};
    border-top: ${layoutStructure.footer.borderTop};
    padding: ${layoutStructure.footer.padding};
    display: flex;
    align-items: center;
  }

  /* Header-Komponenten */
  .header-left,
  .header-center,
  .header-right {
    display: flex;
    align-items: center;
  }

  .header-left {
    flex: 0 0 auto;
    margin-right: ${spacing.lg};
  }

  .header-center {
    flex: 1;
  }

  .header-right {
    flex: 0 0 auto;
    margin-left: ${spacing.lg};
  }

  .sidebar-toggle {
    background: none;
    border: none;
    color: ${colors.text.primary};
    cursor: pointer;
    padding: ${spacing.sm};
    margin-right: ${spacing.sm};
    border-radius: ${borderRadius.md};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-toggle:hover {
    background-color: ${colors.background};
  }

  .app-logo {
    display: flex;
    align-items: center;
  }

  .app-logo img {
    height: 32px;
    margin-right: ${spacing.sm};
  }

  .app-title {
    font-size: ${typography.fontSize.lg};
    font-weight: ${typography.fontWeight.semibold};
    color: ${colors.primary};
    display: flex;
    align-items: center;
  }

  .search-bar {
    display: flex;
    align-items: center;
    background-color: ${colors.background};
    border-radius: ${borderRadius.full};
    padding: ${spacing.xs} ${spacing.md};
    width: 100%;
    max-width: 400px;
  }

  .search-bar i {
    color: ${colors.text.light};
    margin-right: ${spacing.sm};
  }

  .search-bar input {
    border: none;
    background: transparent;
    flex: 1;
    outline: none;
    color: ${colors.text.primary};
    font-size: ${typography.fontSize.md};
  }

  .header-actions {
    display: flex;
    align-items: center;
  }

  .action-button {
    background: none;
    border: none;
    color: ${colors.text.primary};
    cursor: pointer;
    padding: ${spacing.sm};
    margin-left: ${spacing.sm};
    border-radius: ${borderRadius.md};
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-button:hover {
    background-color: ${colors.background};
  }

  .action-button .badge {
    position: absolute;
    top: 0;
    right: 0;
    background-color: ${colors.error};
    color: ${colors.text.inverted};
    font-size: ${typography.fontSize.xs};
    min-width: 18px;
    height: 18px;
    border-radius: ${borderRadius.full};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 ${spacing.xs};
  }

  .user-button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: ${spacing.sm} ${spacing.md};
    margin-left: ${spacing.md};
    border-radius: ${borderRadius.md};
    cursor: pointer;
  }

  .user-button:hover {
    background-color: ${colors.background};
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: ${borderRadius.full};
    overflow: hidden;
    margin-right: ${spacing.sm};
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-name {
    font-size: ${typography.fontSize.md};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.primary};
    margin-right: ${spacing.xs};
  }

  /* Sidebar-Komponenten */
  .sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 ${spacing.md};
    border-bottom: 1px solid ${colors.border};
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
  }

  .logo-icon {
    height: 32px;
    width: 32px;
  }

  .logo-text {
    font-size: ${typography.fontSize.lg};
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.primary};
    margin-left: ${spacing.sm};
    white-space: nowrap;
    overflow: hidden;
    transition: opacity 0.3s ease;
  }

  .collapsed .logo-text {
    opacity: 0;
    width: 0;
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: ${spacing.md} 0;
  }

  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .nav-item {
    margin-bottom: ${spacing.xs};
  }

  .nav-link {
    display: flex;
    align-items: center;
    padding: ${spacing.sm} ${spacing.md};
    color: ${colors.text.primary};
    text-decoration: none;
    border-radius: ${borderRadius.md};
    transition: ${transitions.default};
  }

  .nav-link:hover {
    background-color: ${colors.background};
  }

  .nav-link.active {
    background-color: ${colors.primary}1a;
    color: ${colors.primary};
    font-weight: ${typography.fontWeight.medium};
  }

  .nav-icon {
    margin-right: ${spacing.md};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  .nav-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: opacity 0.3s ease;
  }

  .collapsed .nav-text {
    opacity: 0;
    width: 0;
  }

  .nav-arrow {
    margin-left: ${spacing.sm};
    transition: transform 0.3s ease;
  }

  .nav-item.expanded .nav-arrow {
    transform: rotate(180deg);
  }

  .nav-children {
    list-style: none;
    padding-left: ${spacing.xl};
    margin: 0;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease;
  }

  .nav-item.expanded .nav-children {
    max-height: 500px;
  }

  .sidebar-footer {
    padding: ${spacing.sm} ${spacing.md};
    border-top: 1px solid ${colors.border};
  }

  .sidebar-footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .version {
    font-size: ${typography.fontSize.xs};
    color: ${colors.text.light};
  }

  .company-link {
    display: flex;
    align-items: center;
  }

  .company-link img {
    height: 20px;
  }

  /* Content-Komponenten */
  .content-header {
    margin-bottom: ${spacing.lg};
  }

  .content-title {
    font-size: ${typography.fontSize['2xl']};
    font-weight: ${typography.fontWeight.semibold};
    color: ${colors.text.primary};
    margin-bottom: ${spacing.sm};
  }

  .content-breadcrumb {
    margin-bottom: ${spacing.md};
  }

  .breadcrumb {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    color: ${colors.text.light};
    font-size: ${typography.fontSize.sm};
  }

  .breadcrumb-item:not(:last-child)::after {
    content: '/';
    margin: 0 ${spacing.xs};
    color: ${colors.text.light};
  }

  .breadcrumb-item a {
    color: ${colors.text.secondary};
    text-decoration: none;
  }

  .breadcrumb-item a:hover {
    color: ${colors.primary};
    text-decoration: underline;
  }

  .breadcrumb-item.active {
    color: ${colors.text.primary};
    font-weight: ${typography.fontWeight.medium};
  }

  .content-body {
    flex: 1;
  }

  /* Footer-Komponenten */
  .footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .copyright {
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.light};
  }

  .footer-links {
    display: flex;
  }

  .footer-links a {
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.light};
    text-decoration: none;
    margin-left: ${spacing.md};
  }

  .footer-links a:hover {
    color: ${colors.primary};
    text-decoration: underline;
  }

  /* Responsive Anpassungen */
  @media (max-width: ${breakpoints.lg}) {
    .app-sidebar {
      position: fixed;
      top: ${layoutStructure.header.height};
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }

    .app-sidebar.open {
      transform: translateX(0);
    }

    .sidebar-overlay {
      position: fixed;
      top: ${layoutStructure.header.height};
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 800;
      display: none;
    }

    .sidebar-overlay.active {
      display: block;
    }
  }

  @media (max-width: ${breakpoints.md}) {
    .header-center {
      display: none;
    }

    .user-name {
      display: none;
    }

    .content-header {
      flex-direction: column;
    }

    .content-actions {
      margin-top: ${spacing.sm};
    }
  }
`;

// JavaScript für das Layout
export const layoutScript = `
  // Sidebar-Toggle-Funktionalität
  function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');
    
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        
        // Speichere den Zustand im localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebar_collapsed', isCollapsed);
      });
      
      // Stelle den gespeicherten Zustand wieder her
      const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
      if (isCollapsed) {
        sidebar.classList.add('collapsed');
      }
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
  
  // Dropdown-Menü-Funktionalität
  function initDropdowns() {
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
  
  // Navigation-Funktionalität
  function initNavigation() {
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
  
  // Initialisiere alle Layout-Funktionen
  function initLayout() {
    initSidebar();
    initDropdowns();
    initNavigation();
  }
  
  // Führe Initialisierung aus, wenn DOM geladen ist
  document.addEventListener('DOMContentLoaded', initLayout);
`;

// Exportiere alle Layout-Komponenten
export default {
  mainNavigation,
  layoutStructure,
  headerTemplate,
  sidebarTemplate,
  contentTemplate,
  footerTemplate,
  mainLayoutTemplate,
  layoutStyles,
  layoutScript
};
