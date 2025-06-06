/**
 * UI-Seiten für StudiFlow AI Enterprise
 * 
 * Implementiert die Hauptseiten der Anwendung mit einheitlichem Design und Funktionalität.
 * 
 * @version 1.0.0
 */

import { colors, typography, spacing } from './components';

// Dashboard-Seite
export const dashboardTemplate = `
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1 class="page-title">Dashboard</h1>
      <div class="dashboard-actions">
        <button class="btn btn-primary">
          <i class="material-icons">add</i>
          Neuer Content
        </button>
      </div>
    </div>
    
    <div class="dashboard-stats">
      <div class="row">
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="material-icons">photo_camera</i>
            </div>
            <div class="stat-content">
              <div class="stat-value">24</div>
              <div class="stat-label">Instagram Posts</div>
            </div>
            <div class="stat-footer">
              <span class="stat-change positive">+12% </span>
              <span class="stat-period">diese Woche</span>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="material-icons">movie</i>
            </div>
            <div class="stat-content">
              <div class="stat-value">8</div>
              <div class="stat-label">Reels generiert</div>
            </div>
            <div class="stat-footer">
              <span class="stat-change positive">+50% </span>
              <span class="stat-period">diese Woche</span>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="material-icons">menu_book</i>
            </div>
            <div class="stat-content">
              <div class="stat-value">42</div>
              <div class="stat-label">Magazin-Artikel</div>
            </div>
            <div class="stat-footer">
              <span class="stat-change positive">+8% </span>
              <span class="stat-period">diesen Monat</span>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="material-icons">thumb_up</i>
            </div>
            <div class="stat-content">
              <div class="stat-value">1.2k</div>
              <div class="stat-label">Engagement</div>
            </div>
            <div class="stat-footer">
              <span class="stat-change positive">+18% </span>
              <span class="stat-period">diesen Monat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="row">
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header">
              <h2 class="card-title">Content-Übersicht</h2>
              <div class="card-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">filter_list</i>
                  Filter
                </button>
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">refresh</i>
                  Aktualisieren
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="content-list">
                <div class="content-item">
                  <div class="content-thumbnail">
                    <img src="/assets/images/content-1.jpg" alt="Content Thumbnail" />
                  </div>
                  <div class="content-details">
                    <h3 class="content-title">10 Tipps für effektives Lernen</h3>
                    <div class="content-meta">
                      <span class="content-type">Instagram Post</span>
                      <span class="content-date">Vor 2 Stunden</span>
                    </div>
                    <div class="content-stats">
                      <span class="content-stat"><i class="material-icons">thumb_up</i> 45</span>
                      <span class="content-stat"><i class="material-icons">comment</i> 12</span>
                      <span class="content-stat"><i class="material-icons">share</i> 8</span>
                    </div>
                  </div>
                  <div class="content-actions">
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">edit</i>
                    </button>
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">delete</i>
                    </button>
                  </div>
                </div>
                <div class="content-item">
                  <div class="content-thumbnail">
                    <img src="/assets/images/content-2.jpg" alt="Content Thumbnail" />
                  </div>
                  <div class="content-details">
                    <h3 class="content-title">Studieren im Ausland: Erfahrungsbericht</h3>
                    <div class="content-meta">
                      <span class="content-type">Instagram Carousel</span>
                      <span class="content-date">Gestern</span>
                    </div>
                    <div class="content-stats">
                      <span class="content-stat"><i class="material-icons">thumb_up</i> 87</span>
                      <span class="content-stat"><i class="material-icons">comment</i> 23</span>
                      <span class="content-stat"><i class="material-icons">share</i> 15</span>
                    </div>
                  </div>
                  <div class="content-actions">
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">edit</i>
                    </button>
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">delete</i>
                    </button>
                  </div>
                </div>
                <div class="content-item">
                  <div class="content-thumbnail video-thumbnail">
                    <img src="/assets/images/content-3.jpg" alt="Content Thumbnail" />
                    <div class="video-indicator">
                      <i class="material-icons">play_arrow</i>
                    </div>
                  </div>
                  <div class="content-details">
                    <h3 class="content-title">Prüfungsvorbereitung in 5 Schritten</h3>
                    <div class="content-meta">
                      <span class="content-type">Instagram Reel</span>
                      <span class="content-date">Vor 3 Tagen</span>
                    </div>
                    <div class="content-stats">
                      <span class="content-stat"><i class="material-icons">thumb_up</i> 156</span>
                      <span class="content-stat"><i class="material-icons">comment</i> 34</span>
                      <span class="content-stat"><i class="material-icons">share</i> 42</span>
                    </div>
                  </div>
                  <div class="content-actions">
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">edit</i>
                    </button>
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">delete</i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="content-pagination">
                <button class="btn btn-sm btn-text">Mehr laden</button>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Aktuelle Magazin-Artikel</h2>
              <div class="card-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">sync</i>
                  Scraping starten
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="magazine-list">
                <div class="magazine-item">
                  <div class="magazine-thumbnail">
                    <img src="/assets/images/magazine-1.jpg" alt="Magazin Thumbnail" />
                  </div>
                  <div class="magazine-details">
                    <h3 class="magazine-title">Die besten Lernmethoden für verschiedene Fachbereiche</h3>
                    <div class="magazine-meta">
                      <span class="magazine-category">Lernstrategien</span>
                      <span class="magazine-date">15. Mai 2025</span>
                    </div>
                    <p class="magazine-excerpt">
                      Jeder Fachbereich erfordert unterschiedliche Lernansätze. In diesem Artikel stellen wir die effektivsten Methoden vor...
                    </p>
                  </div>
                  <div class="magazine-actions">
                    <button class="btn btn-sm btn-primary">
                      <i class="material-icons">auto_awesome</i>
                      Content erstellen
                    </button>
                  </div>
                </div>
                <div class="magazine-item">
                  <div class="magazine-thumbnail">
                    <img src="/assets/images/magazine-2.jpg" alt="Magazin Thumbnail" />
                  </div>
                  <div class="magazine-details">
                    <h3 class="magazine-title">Finanzierung des Studiums: Stipendien und Fördermöglichkeiten</h3>
                    <div class="magazine-meta">
                      <span class="magazine-category">Finanzen</span>
                      <span class="magazine-date">12. Mai 2025</span>
                    </div>
                    <p class="magazine-excerpt">
                      Ein Überblick über die verschiedenen Finanzierungsmöglichkeiten für Studierende, von BAföG bis zu privaten Stipendien...
                    </p>
                  </div>
                  <div class="magazine-actions">
                    <button class="btn btn-sm btn-primary">
                      <i class="material-icons">auto_awesome</i>
                      Content erstellen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="card mb-4">
            <div class="card-header">
              <h2 class="card-title">Instagram-Konten</h2>
            </div>
            <div class="card-body">
              <div class="account-list">
                <div class="account-item">
                  <div class="account-avatar">
                    <img src="/assets/images/account-1.jpg" alt="Account Avatar" />
                  </div>
                  <div class="account-details">
                    <h3 class="account-name">studibuch_official</h3>
                    <div class="account-stats">
                      <span class="account-stat">12.5k Follower</span>
                      <span class="account-stat">245 Posts</span>
                    </div>
                  </div>
                  <div class="account-status connected">
                    <i class="material-icons">check_circle</i>
                  </div>
                </div>
                <div class="account-item">
                  <div class="account-avatar">
                    <img src="/assets/images/account-2.jpg" alt="Account Avatar" />
                  </div>
                  <div class="account-details">
                    <h3 class="account-name">studibuch_tipps</h3>
                    <div class="account-stats">
                      <span class="account-stat">8.3k Follower</span>
                      <span class="account-stat">178 Posts</span>
                    </div>
                  </div>
                  <div class="account-status connected">
                    <i class="material-icons">check_circle</i>
                  </div>
                </div>
                <div class="account-item">
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
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mb-4">
            <div class="card-header">
              <h2 class="card-title">Geplante Posts</h2>
            </div>
            <div class="card-body">
              <div class="schedule-list">
                <div class="schedule-item">
                  <div class="schedule-time">
                    <div class="schedule-date">Heute</div>
                    <div class="schedule-hour">14:30</div>
                  </div>
                  <div class="schedule-content">
                    <div class="schedule-thumbnail">
                      <img src="/assets/images/schedule-1.jpg" alt="Scheduled Post" />
                    </div>
                    <div class="schedule-details">
                      <h3 class="schedule-title">Zeitmanagement im Studium</h3>
                      <div class="schedule-account">@studibuch_tipps</div>
                    </div>
                  </div>
                  <div class="schedule-actions">
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">edit</i>
                    </button>
                  </div>
                </div>
                <div class="schedule-item">
                  <div class="schedule-time">
                    <div class="schedule-date">Morgen</div>
                    <div class="schedule-hour">10:00</div>
                  </div>
                  <div class="schedule-content">
                    <div class="schedule-thumbnail">
                      <img src="/assets/images/schedule-2.jpg" alt="Scheduled Post" />
                    </div>
                    <div class="schedule-details">
                      <h3 class="schedule-title">Bücher für das Sommersemester</h3>
                      <div class="schedule-account">@studibuch_official</div>
                    </div>
                  </div>
                  <div class="schedule-actions">
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">edit</i>
                    </button>
                  </div>
                </div>
                <div class="schedule-item">
                  <div class="schedule-time">
                    <div class="schedule-date">27. Mai</div>
                    <div class="schedule-hour">16:45</div>
                  </div>
                  <div class="schedule-content">
                    <div class="schedule-thumbnail video-thumbnail">
                      <img src="/assets/images/schedule-3.jpg" alt="Scheduled Post" />
                      <div class="video-indicator">
                        <i class="material-icons">play_arrow</i>
                      </div>
                    </div>
                    <div class="schedule-details">
                      <h3 class="schedule-title">Motivationstipps für die Prüfungsphase</h3>
                      <div class="schedule-account">@studibuch_tipps</div>
                    </div>
                  </div>
                  <div class="schedule-actions">
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">edit</i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="schedule-more">
                <a href="/content/calendar" class="btn btn-text">Alle geplanten Posts anzeigen</a>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">KI-Aktivitäten</h2>
            </div>
            <div class="card-body">
              <div class="ai-activity-list">
                <div class="ai-activity-item">
                  <div class="ai-activity-icon">
                    <i class="material-icons">auto_awesome</i>
                  </div>
                  <div class="ai-activity-details">
                    <div class="ai-activity-title">Content-Generierung abgeschlossen</div>
                    <div class="ai-activity-meta">5 Posts aus 2 Artikeln</div>
                    <div class="ai-activity-time">Vor 35 Minuten</div>
                  </div>
                  <div class="ai-activity-actions">
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">visibility</i>
                    </button>
                  </div>
                </div>
                <div class="ai-activity-item">
                  <div class="ai-activity-icon">
                    <i class="material-icons">movie</i>
                  </div>
                  <div class="ai-activity-details">
                    <div class="ai-activity-title">Reel-Generierung abgeschlossen</div>
                    <div class="ai-activity-meta">Prüfungsvorbereitung in 5 Schritten</div>
                    <div class="ai-activity-time">Vor 2 Stunden</div>
                  </div>
                  <div class="ai-activity-actions">
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">visibility</i>
                    </button>
                  </div>
                </div>
                <div class="ai-activity-item">
                  <div class="ai-activity-icon">
                    <i class="material-icons">sync</i>
                  </div>
                  <div class="ai-activity-details">
                    <div class="ai-activity-title">Magazin-Scraping abgeschlossen</div>
                    <div class="ai-activity-meta">12 neue Artikel gefunden</div>
                    <div class="ai-activity-time">Vor 4 Stunden</div>
                  </div>
                  <div class="ai-activity-actions">
                    <button class="btn btn-sm btn-text">
                      <i class="material-icons">visibility</i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Instagram-Seite
export const instagramTemplate = `
  <div class="instagram-page">
    <div class="page-header">
      <h1 class="page-title">Instagram</h1>
      <div class="page-actions">
        <button class="btn btn-primary">
          <i class="material-icons">add</i>
          Neuer Post
        </button>
      </div>
    </div>
    
    <div class="instagram-tabs">
      <div class="tabs">
        <div class="tab active" data-tab="posts">Posts</div>
        <div class="tab" data-tab="reels">Reels</div>
        <div class="tab" data-tab="stories">Stories</div>
        <div class="tab" data-tab="carousel">Carousels</div>
        <div class="tab" data-tab="analytics">Analyse</div>
      </div>
      
      <div class="tab-content">
        <div class="tab-pane active" id="posts">
          <div class="instagram-filters">
            <div class="filter-group">
              <label class="filter-label">Konto:</label>
              <select class="form-control">
                <option value="all">Alle Konten</option>
                <option value="studibuch_official">studibuch_official</option>
                <option value="studibuch_tipps">studibuch_tipps</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Status:</label>
              <select class="form-control">
                <option value="all">Alle</option>
                <option value="published">Veröffentlicht</option>
                <option value="scheduled">Geplant</option>
                <option value="draft">Entwurf</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Zeitraum:</label>
              <select class="form-control">
                <option value="all">Alle Zeit</option>
                <option value="week">Letzte Woche</option>
                <option value="month">Letzter Monat</option>
                <option value="quarter">Letztes Quartal</option>
              </select>
            </div>
            <button class="btn btn-outline">
              <i class="material-icons">filter_list</i>
              Filter anwenden
            </button>
          </div>
          
          <div class="instagram-grid">
            <div class="row">
              <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="instagram-card">
                  <div class="instagram-card-image">
                    <img src="/assets/images/instagram-1.jpg" alt="Instagram Post" />
                    <div class="instagram-card-overlay">
                      <div class="instagram-card-actions">
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">edit</i>
                        </button>
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">content_copy</i>
                        </button>
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">delete</i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="instagram-card-content">
                    <h3 class="instagram-card-title">10 Tipps für effektives Lernen</h3>
                    <div class="instagram-card-meta">
                      <span class="instagram-card-account">@studibuch_tipps</span>
                      <span class="instagram-card-date">Vor 2 Stunden</span>
                    </div>
                    <div class="instagram-card-stats">
                      <span class="instagram-card-stat"><i class="material-icons">thumb_up</i> 45</span>
                      <span class="instagram-card-stat"><i class="material-icons">comment</i> 12</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="instagram-card">
                  <div class="instagram-card-image">
                    <img src="/assets/images/instagram-2.jpg" alt="Instagram Post" />
                    <div class="instagram-card-overlay">
                      <div class="instagram-card-actions">
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">edit</i>
                        </button>
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">content_copy</i>
                        </button>
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">delete</i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="instagram-card-content">
                    <h3 class="instagram-card-title">Bücher für das Sommersemester</h3>
                    <div class="instagram-card-meta">
                      <span class="instagram-card-account">@studibuch_official</span>
                      <span class="instagram-card-date">Gestern</span>
                    </div>
                    <div class="instagram-card-stats">
                      <span class="instagram-card-stat"><i class="material-icons">thumb_up</i> 78</span>
                      <span class="instagram-card-stat"><i class="material-icons">comment</i> 23</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="instagram-card">
                  <div class="instagram-card-image">
                    <img src="/assets/images/instagram-3.jpg" alt="Instagram Post" />
                    <div class="instagram-card-badge">Geplant</div>
                    <div class="instagram-card-overlay">
                      <div class="instagram-card-actions">
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">edit</i>
                        </button>
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">content_copy</i>
                        </button>
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">delete</i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="instagram-card-content">
                    <h3 class="instagram-card-title">Zeitmanagement im Studium</h3>
                    <div class="instagram-card-meta">
                      <span class="instagram-card-account">@studibuch_tipps</span>
                      <span class="instagram-card-date">Heute, 14:30</span>
                    </div>
                    <div class="instagram-card-stats">
                      <span class="instagram-card-stat"><i class="material-icons">schedule</i> Geplant</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="instagram-card">
                  <div class="instagram-card-image">
                    <img src="/assets/images/instagram-4.jpg" alt="Instagram Post" />
                    <div class="instagram-card-badge">Entwurf</div>
                    <div class="instagram-card-overlay">
                      <div class="instagram-card-actions">
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">edit</i>
                        </button>
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">content_copy</i>
                        </button>
                        <button class="btn btn-icon btn-light">
                          <i class="material-icons">delete</i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="instagram-card-content">
                    <h3 class="instagram-card-title">Stipendien für Auslandssemester</h3>
                    <div class="instagram-card-meta">
                      <span class="instagram-card-account">@studibuch_official</span>
                      <span class="instagram-card-date">Entwurf</span>
                    </div>
                    <div class="instagram-card-stats">
                      <span class="instagram-card-stat"><i class="material-icons">edit</i> Entwurf</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pagination">
            <button class="pagination-item">
              <i class="material-icons">chevron_left</i>
            </button>
            <button class="pagination-item active">1</button>
            <button class="pagination-item">2</button>
            <button class="pagination-item">3</button>
            <button class="pagination-item">
              <i class="material-icons">chevron_right</i>
            </button>
          </div>
        </div>
        
        <div class="tab-pane" id="reels">
          <!-- Reels-Inhalt hier -->
        </div>
        
        <div class="tab-pane" id="stories">
          <!-- Stories-Inhalt hier -->
        </div>
        
        <div class="tab-pane" id="carousel">
          <!-- Carousel-Inhalt hier -->
        </div>
        
        <div class="tab-pane" id="analytics">
          <!-- Analytics-Inhalt hier -->
        </div>
      </div>
    </div>
  </div>
`;

// Magazin-Seite
export const magazineTemplate = `
  <div class="magazine-page">
    <div class="page-header">
      <h1 class="page-title">Magazin</h1>
      <div class="page-actions">
        <button class="btn btn-outline mr-2">
          <i class="material-icons">sync</i>
          Scraping starten
        </button>
        <button class="btn btn-primary">
          <i class="material-icons">auto_awesome</i>
          Content generieren
        </button>
      </div>
    </div>
    
    <div class="magazine-filters">
      <div class="filter-group">
        <label class="filter-label">Kategorie:</label>
        <select class="form-control">
          <option value="all">Alle Kategorien</option>
          <option value="learning">Lernstrategien</option>
          <option value="finance">Finanzen</option>
          <option value="career">Karriere</option>
          <option value="lifestyle">Lifestyle</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Sortieren nach:</label>
        <select class="form-control">
          <option value="date_desc">Neueste zuerst</option>
          <option value="date_asc">Älteste zuerst</option>
          <option value="title_asc">Titel A-Z</option>
          <option value="title_desc">Titel Z-A</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Status:</label>
        <select class="form-control">
          <option value="all">Alle</option>
          <option value="used">Verwendet</option>
          <option value="unused">Ungenutzt</option>
        </select>
      </div>
      <button class="btn btn-outline">
        <i class="material-icons">filter_list</i>
        Filter anwenden
      </button>
    </div>
    
    <div class="magazine-grid">
      <div class="row">
        <div class="col-lg-4 col-md-6">
          <div class="magazine-card">
            <div class="magazine-card-image">
              <img src="/assets/images/magazine-1.jpg" alt="Magazin Artikel" />
              <div class="magazine-card-category">Lernstrategien</div>
            </div>
            <div class="magazine-card-content">
              <h3 class="magazine-card-title">Die besten Lernmethoden für verschiedene Fachbereiche</h3>
              <div class="magazine-card-meta">
                <span class="magazine-card-date">15. Mai 2025</span>
                <span class="magazine-card-source">StudiBuch Magazin</span>
              </div>
              <p class="magazine-card-excerpt">
                Jeder Fachbereich erfordert unterschiedliche Lernansätze. In diesem Artikel stellen wir die effektivsten Methoden vor...
              </p>
              <div class="magazine-card-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">visibility</i>
                  Vorschau
                </button>
                <button class="btn btn-sm btn-primary">
                  <i class="material-icons">auto_awesome</i>
                  Content erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 col-md-6">
          <div class="magazine-card">
            <div class="magazine-card-image">
              <img src="/assets/images/magazine-2.jpg" alt="Magazin Artikel" />
              <div class="magazine-card-category">Finanzen</div>
            </div>
            <div class="magazine-card-content">
              <h3 class="magazine-card-title">Finanzierung des Studiums: Stipendien und Fördermöglichkeiten</h3>
              <div class="magazine-card-meta">
                <span class="magazine-card-date">12. Mai 2025</span>
                <span class="magazine-card-source">StudiBuch Magazin</span>
              </div>
              <p class="magazine-card-excerpt">
                Ein Überblick über die verschiedenen Finanzierungsmöglichkeiten für Studierende, von BAföG bis zu privaten Stipendien...
              </p>
              <div class="magazine-card-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">visibility</i>
                  Vorschau
                </button>
                <button class="btn btn-sm btn-primary">
                  <i class="material-icons">auto_awesome</i>
                  Content erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 col-md-6">
          <div class="magazine-card">
            <div class="magazine-card-image">
              <img src="/assets/images/magazine-3.jpg" alt="Magazin Artikel" />
              <div class="magazine-card-category">Karriere</div>
              <div class="magazine-card-badge">Verwendet</div>
            </div>
            <div class="magazine-card-content">
              <h3 class="magazine-card-title">Praktikum finden: Tipps für die erfolgreiche Bewerbung</h3>
              <div class="magazine-card-meta">
                <span class="magazine-card-date">8. Mai 2025</span>
                <span class="magazine-card-source">StudiBuch Magazin</span>
              </div>
              <p class="magazine-card-excerpt">
                Ein gutes Praktikum kann der Türöffner für den Berufseinstieg sein. Wir zeigen, worauf es bei der Bewerbung ankommt...
              </p>
              <div class="magazine-card-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">visibility</i>
                  Vorschau
                </button>
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">auto_awesome</i>
                  Erneut erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 col-md-6">
          <div class="magazine-card">
            <div class="magazine-card-image">
              <img src="/assets/images/magazine-4.jpg" alt="Magazin Artikel" />
              <div class="magazine-card-category">Lifestyle</div>
            </div>
            <div class="magazine-card-content">
              <h3 class="magazine-card-title">Work-Life-Balance im Studium: So gelingt's</h3>
              <div class="magazine-card-meta">
                <span class="magazine-card-date">5. Mai 2025</span>
                <span class="magazine-card-source">StudiBuch Magazin</span>
              </div>
              <p class="magazine-card-excerpt">
                Zwischen Vorlesungen, Lernstress und Nebenjob bleibt oft wenig Zeit für Erholung. Diese Strategien helfen bei der Balance...
              </p>
              <div class="magazine-card-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">visibility</i>
                  Vorschau
                </button>
                <button class="btn btn-sm btn-primary">
                  <i class="material-icons">auto_awesome</i>
                  Content erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 col-md-6">
          <div class="magazine-card">
            <div class="magazine-card-image">
              <img src="/assets/images/magazine-5.jpg" alt="Magazin Artikel" />
              <div class="magazine-card-category">Lernstrategien</div>
              <div class="magazine-card-badge">Verwendet</div>
            </div>
            <div class="magazine-card-content">
              <h3 class="magazine-card-title">Digitale Tools für effizientes Lernen</h3>
              <div class="magazine-card-meta">
                <span class="magazine-card-date">1. Mai 2025</span>
                <span class="magazine-card-source">StudiBuch Magazin</span>
              </div>
              <p class="magazine-card-excerpt">
                Von Lern-Apps bis zu Zeitmanagement-Tools: Diese digitalen Helfer unterstützen dich beim effizienten Lernen...
              </p>
              <div class="magazine-card-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">visibility</i>
                  Vorschau
                </button>
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">auto_awesome</i>
                  Erneut erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 col-md-6">
          <div class="magazine-card">
            <div class="magazine-card-image">
              <img src="/assets/images/magazine-6.jpg" alt="Magazin Artikel" />
              <div class="magazine-card-category">Karriere</div>
            </div>
            <div class="magazine-card-content">
              <h3 class="magazine-card-title">Nebenjobs für Studierende: Vor- und Nachteile</h3>
              <div class="magazine-card-meta">
                <span class="magazine-card-date">28. April 2025</span>
                <span class="magazine-card-source">StudiBuch Magazin</span>
              </div>
              <p class="magazine-card-excerpt">
                Welche Nebenjobs eignen sich besonders für Studierende? Wir vergleichen verschiedene Optionen und ihre Auswirkungen...
              </p>
              <div class="magazine-card-actions">
                <button class="btn btn-sm btn-outline">
                  <i class="material-icons">visibility</i>
                  Vorschau
                </button>
                <button class="btn btn-sm btn-primary">
                  <i class="material-icons">auto_awesome</i>
                  Content erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="pagination">
      <button class="pagination-item">
        <i class="material-icons">chevron_left</i>
      </button>
      <button class="pagination-item active">1</button>
      <button class="pagination-item">2</button>
      <button class="pagination-item">3</button>
      <button class="pagination-item">
        <i class="material-icons">chevron_right</i>
      </button>
    </div>
  </div>
`;

// KI-Tools-Seite
export const aiToolsTemplate = `
  <div class="ai-tools-page">
    <div class="page-header">
      <h1 class="page-title">KI-Tools</h1>
    </div>
    
    <div class="ai-tools-tabs">
      <div class="tabs">
        <div class="tab active" data-tab="content-generation">Content-Generierung</div>
        <div class="tab" data-tab="image-generation">Bild-Generierung</div>
        <div class="tab" data-tab="reel-generation">Reel-Generierung</div>
      </div>
      
      <div class="tab-content">
        <div class="tab-pane active" id="content-generation">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Content-Generierung</h2>
            </div>
            <div class="card-body">
              <div class="ai-form">
                <div class="form-group">
                  <label class="form-label">Quelle auswählen</label>
                  <select class="form-control">
                    <option value="">-- Quelle auswählen --</option>
                    <option value="magazine">Magazin-Artikel</option>
                    <option value="custom">Eigener Text</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Magazin-Artikel</label>
                  <select class="form-control">
                    <option value="">-- Artikel auswählen --</option>
                    <option value="1">Die besten Lernmethoden für verschiedene Fachbereiche</option>
                    <option value="2">Finanzierung des Studiums: Stipendien und Fördermöglichkeiten</option>
                    <option value="3">Praktikum finden: Tipps für die erfolgreiche Bewerbung</option>
                    <option value="4">Work-Life-Balance im Studium: So gelingt's</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Content-Typ</label>
                  <div class="content-type-selector">
                    <div class="content-type-option">
                      <input type="radio" name="content-type" id="type-post" value="post" checked />
                      <label for="type-post">
                        <i class="material-icons">photo</i>
                        <span>Post</span>
                      </label>
                    </div>
                    <div class="content-type-option">
                      <input type="radio" name="content-type" id="type-carousel" value="carousel" />
                      <label for="type-carousel">
                        <i class="material-icons">view_carousel</i>
                        <span>Carousel</span>
                      </label>
                    </div>
                    <div class="content-type-option">
                      <input type="radio" name="content-type" id="type-reel" value="reel" />
                      <label for="type-reel">
                        <i class="material-icons">movie</i>
                        <span>Reel</span>
                      </label>
                    </div>
                    <div class="content-type-option">
                      <input type="radio" name="content-type" id="type-story" value="story" />
                      <label for="type-story">
                        <i class="material-icons">auto_stories</i>
                        <span>Story</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Ton</label>
                  <select class="form-control">
                    <option value="casual">Locker & freundlich</option>
                    <option value="professional">Professionell & sachlich</option>
                    <option value="motivational">Motivierend & inspirierend</option>
                    <option value="educational">Lehrreich & informativ</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Hashtags einbeziehen</label>
                  <div class="toggle-switch">
                    <input type="checkbox" id="include-hashtags" checked />
                    <label for="include-hashtags"></label>
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Call-to-Action einbeziehen</label>
                  <div class="toggle-switch">
                    <input type="checkbox" id="include-cta" checked />
                    <label for="include-cta"></label>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button class="btn btn-primary">
                    <i class="material-icons">auto_awesome</i>
                    Content generieren
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tab-pane" id="image-generation">
          <!-- Bild-Generierung-Inhalt hier -->
        </div>
        
        <div class="tab-pane" id="reel-generation">
          <!-- Reel-Generierung-Inhalt hier -->
        </div>
      </div>
    </div>
  </div>
`;

// Content-Erstellungs-Seite
export const contentCreationTemplate = `
  <div class="content-creation-page">
    <div class="page-header">
      <h1 class="page-title">Content erstellen</h1>
      <div class="page-actions">
        <button class="btn btn-outline mr-2">
          <i class="material-icons">save</i>
          Als Entwurf speichern
        </button>
        <button class="btn btn-primary">
          <i class="material-icons">schedule</i>
          Planen & Veröffentlichen
        </button>
      </div>
    </div>
    
    <div class="content-creation-layout">
      <div class="content-editor">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Content bearbeiten</h2>
            <div class="card-actions">
              <button class="btn btn-sm btn-outline">
                <i class="material-icons">refresh</i>
                Neu generieren
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Instagram-Konto</label>
              <select class="form-control">
                <option value="studibuch_official">studibuch_official</option>
                <option value="studibuch_tipps">studibuch_tipps</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Content-Typ</label>
              <div class="content-type-selector">
                <div class="content-type-option">
                  <input type="radio" name="content-type" id="type-post" value="post" checked />
                  <label for="type-post">
                    <i class="material-icons">photo</i>
                    <span>Post</span>
                  </label>
                </div>
                <div class="content-type-option">
                  <input type="radio" name="content-type" id="type-carousel" value="carousel" />
                  <label for="type-carousel">
                    <i class="material-icons">view_carousel</i>
                    <span>Carousel</span>
                  </label>
                </div>
                <div class="content-type-option">
                  <input type="radio" name="content-type" id="type-reel" value="reel" />
                  <label for="type-reel">
                    <i class="material-icons">movie</i>
                    <span>Reel</span>
                  </label>
                </div>
                <div class="content-type-option">
                  <input type="radio" name="content-type" id="type-story" value="story" />
                  <label for="type-story">
                    <i class="material-icons">auto_stories</i>
                    <span>Story</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Caption</label>
              <textarea class="form-control" rows="8">📚 10 Tipps für effektives Lernen

Wusstest du, dass die richtige Lernmethode deinen Lernerfolg verdoppeln kann? Hier sind unsere Top-Tipps:

1️⃣ Setze dir klare, erreichbare Ziele
2️⃣ Nutze die Pomodoro-Technik: 25 Min. lernen, 5 Min. Pause
3️⃣ Erstelle Mind-Maps für komplexe Themen
4️⃣ Erkläre den Stoff anderen (oder einem Gummientchen!)
5️⃣ Wiederhole regelmäßig mit Karteikarten
6️⃣ Finde deine produktivste Tageszeit
7️⃣ Gestalte deinen Lernort ablenkungsfrei
8️⃣ Belohne dich für erreichte Meilensteine
9️⃣ Nutze verschiedene Lernkanäle (visuell, auditiv, etc.)
🔟 Plane regelmäßige Bewegungspausen ein

Welche Methode funktioniert bei dir am besten? Teile deine Erfahrungen in den Kommentaren!

#studibuch #lernmethoden #studium #lerntipps #studentenleben #klausurphase #studieren #lernmotivation</textarea>
            </div>
            
            <div class="form-group">
              <label class="form-label">Bilder</label>
              <div class="image-uploader">
                <div class="image-preview">
                  <img src="/assets/images/content-1.jpg" alt="Bild-Vorschau" />
                  <div class="image-actions">
                    <button class="btn btn-icon btn-light">
                      <i class="material-icons">delete</i>
                    </button>
                  </div>
                </div>
                <div class="image-upload-button">
                  <i class="material-icons">add_photo_alternate</i>
                  <span>Bild hinzufügen</span>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Hashtags</label>
              <div class="hashtag-editor">
                <div class="hashtag-list">
                  <span class="hashtag-item">
                    #studibuch
                    <button class="hashtag-remove">×</button>
                  </span>
                  <span class="hashtag-item">
                    #lernmethoden
                    <button class="hashtag-remove">×</button>
                  </span>
                  <span class="hashtag-item">
                    #studium
                    <button class="hashtag-remove">×</button>
                  </span>
                  <span class="hashtag-item">
                    #lerntipps
                    <button class="hashtag-remove">×</button>
                  </span>
                  <span class="hashtag-item">
                    #studentenleben
                    <button class="hashtag-remove">×</button>
                  </span>
                  <span class="hashtag-item">
                    #klausurphase
                    <button class="hashtag-remove">×</button>
                  </span>
                  <span class="hashtag-item">
                    #studieren
                    <button class="hashtag-remove">×</button>
                  </span>
                  <span class="hashtag-item">
                    #lernmotivation
                    <button class="hashtag-remove">×</button>
                  </span>
                </div>
                <div class="hashtag-input-container">
                  <input type="text" class="hashtag-input" placeholder="Neuer Hashtag..." />
                  <button class="btn btn-sm btn-outline">Hinzufügen</button>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Veröffentlichung</label>
              <div class="publishing-options">
                <div class="publishing-option">
                  <input type="radio" name="publishing" id="publish-now" value="now" />
                  <label for="publish-now">Jetzt veröffentlichen</label>
                </div>
                <div class="publishing-option">
                  <input type="radio" name="publishing" id="publish-schedule" value="schedule" checked />
                  <label for="publish-schedule">Zeitplan festlegen</label>
                </div>
              </div>
              <div class="schedule-picker">
                <div class="form-group">
                  <label class="form-label">Datum</label>
                  <input type="date" class="form-control" value="2025-05-26" />
                </div>
                <div class="form-group">
                  <label class="form-label">Uhrzeit</label>
                  <input type="time" class="form-control" value="14:30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content-preview">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Vorschau</h2>
            <div class="card-actions">
              <button class="btn btn-sm btn-outline">
                <i class="material-icons">refresh</i>
                Aktualisieren
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="preview-container">
              <div class="instagram-preview">
                <div class="instagram-header">
                  <div class="profile-image"></div>
                  <div class="profile-info">
                    <div class="username">studibuch_tipps</div>
                    <div class="location">StudiBuch Magazin</div>
                  </div>
                  <div class="options">⋮</div>
                </div>
                <div class="instagram-image">
                  <img src="/assets/images/content-1.jpg" alt="Instagram post image" />
                </div>
                <div class="instagram-actions">
                  <div class="action-buttons">
                    <span class="like">♥</span>
                    <span class="comment">💬</span>
                    <span class="share">📤</span>
                    <span class="save">🔖</span>
                  </div>
                  <div class="likes">Gefällt 0 Mal</div>
                  <div class="caption">
                    <span class="username">studibuch_tipps</span>
                    <span class="text">📚 10 Tipps für effektives Lernen

Wusstest du, dass die richtige Lernmethode deinen Lernerfolg verdoppeln kann? Hier sind unsere Top-Tipps:

1️⃣ Setze dir klare, erreichbare Ziele
2️⃣ Nutze die Pomodoro-Technik: 25 Min. lernen, 5 Min. Pause
3️⃣ Erstelle Mind-Maps für komplexe Themen
4️⃣ Erkläre den Stoff anderen (oder einem Gummientchen!)
5️⃣ Wiederhole regelmäßig mit Karteikarten
6️⃣ Finde deine produktivste Tageszeit
7️⃣ Gestalte deinen Lernort ablenkungsfrei
8️⃣ Belohne dich für erreichte Meilensteine
9️⃣ Nutze verschiedene Lernkanäle (visuell, auditiv, etc.)
🔟 Plane regelmäßige Bewegungspausen ein

Welche Methode funktioniert bei dir am besten? Teile deine Erfahrungen in den Kommentaren!

#studibuch #lernmethoden #studium #lerntipps #studentenleben #klausurphase #studieren #lernmotivation</span>
                  </div>
                  <div class="timestamp">GEPLANT FÜR 26. MAI 2025, 14:30</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// CSS für die Seiten
export const pagesStyles = `
  /* Gemeinsame Seitenstile */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing.lg};
  }
  
  .page-title {
    font-size: ${typography.fontSize['2xl']};
    font-weight: ${typography.fontWeight.semibold};
    color: ${colors.text.primary};
    margin: 0;
  }
  
  .page-actions {
    display: flex;
    align-items: center;
  }
  
  /* Dashboard-Seite */
  .dashboard-stats {
    margin-bottom: ${spacing.xl};
  }
  
  .stat-card {
    background-color: ${colors.card};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.md};
    padding: ${spacing.md};
    height: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: ${spacing.md};
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: ${borderRadius.md};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${spacing.sm};
  }
  
  .stat-icon i {
    font-size: 24px;
    color: ${colors.text.inverted};
  }
  
  .bg-primary {
    background-color: ${colors.primary};
  }
  
  .bg-success {
    background-color: ${colors.success};
  }
  
  .bg-warning {
    background-color: ${colors.warning};
  }
  
  .bg-info {
    background-color: ${colors.accent};
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-value {
    font-size: ${typography.fontSize['3xl']};
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.text.primary};
    line-height: 1.2;
  }
  
  .stat-label {
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
    margin-top: ${spacing.xs};
  }
  
  .stat-footer {
    margin-top: ${spacing.sm};
    font-size: ${typography.fontSize.xs};
    color: ${colors.text.light};
  }
  
  .stat-change {
    font-weight: ${typography.fontWeight.medium};
  }
  
  .stat-change.positive {
    color: ${colors.success};
  }
  
  .stat-change.negative {
    color: ${colors.error};
  }
  
  .content-list {
    margin-bottom: ${spacing.md};
  }
  
  .content-item {
    display: flex;
    align-items: center;
    padding: ${spacing.md} 0;
    border-bottom: 1px solid ${colors.border};
  }
  
  .content-item:last-child {
    border-bottom: none;
  }
  
  .content-thumbnail {
    width: 80px;
    height: 80px;
    border-radius: ${borderRadius.md};
    overflow: hidden;
    margin-right: ${spacing.md};
    position: relative;
  }
  
  .content-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .video-thumbnail {
    position: relative;
  }
  
  .video-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .video-indicator i {
    color: white;
    font-size: 24px;
  }
  
  .content-details {
    flex: 1;
  }
  
  .content-title {
    font-size: ${typography.fontSize.md};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.primary};
    margin: 0 0 ${spacing.xs} 0;
  }
  
  .content-meta {
    display: flex;
    align-items: center;
    margin-bottom: ${spacing.xs};
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
  }
  
  .content-type {
    margin-right: ${spacing.md};
  }
  
  .content-date {
    color: ${colors.text.light};
  }
  
  .content-stats {
    display: flex;
    align-items: center;
  }
  
  .content-stat {
    display: flex;
    align-items: center;
    margin-right: ${spacing.md};
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
  }
  
  .content-stat i {
    font-size: 16px;
    margin-right: ${spacing.xs};
  }
  
  .content-actions {
    display: flex;
  }
  
  .content-pagination {
    text-align: center;
    margin-top: ${spacing.md};
  }
  
  .magazine-list {
    margin-bottom: ${spacing.md};
  }
  
  .magazine-item {
    display: flex;
    align-items: flex-start;
    padding: ${spacing.md} 0;
    border-bottom: 1px solid ${colors.border};
  }
  
  .magazine-item:last-child {
    border-bottom: none;
  }
  
  .magazine-thumbnail {
    width: 120px;
    height: 80px;
    border-radius: ${borderRadius.md};
    overflow: hidden;
    margin-right: ${spacing.md};
  }
  
  .magazine-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .magazine-details {
    flex: 1;
  }
  
  .magazine-title {
    font-size: ${typography.fontSize.md};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.primary};
    margin: 0 0 ${spacing.xs} 0;
  }
  
  .magazine-meta {
    display: flex;
    align-items: center;
    margin-bottom: ${spacing.xs};
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
  }
  
  .magazine-category {
    margin-right: ${spacing.md};
    padding: ${spacing.xs} ${spacing.sm};
    background-color: ${colors.primary}1a;
    color: ${colors.primary};
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.xs};
    font-weight: ${typography.fontWeight.medium};
  }
  
  .magazine-date {
    color: ${colors.text.light};
  }
  
  .magazine-excerpt {
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
    margin-bottom: ${spacing.sm};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .magazine-actions {
    margin-top: ${spacing.sm};
  }
  
  .account-list {
    margin-bottom: ${spacing.md};
  }
  
  .account-item {
    display: flex;
    align-items: center;
    padding: ${spacing.md} 0;
    border-bottom: 1px solid ${colors.border};
  }
  
  .account-item:last-child {
    border-bottom: none;
  }
  
  .account-avatar {
    width: 48px;
    height: 48px;
    border-radius: ${borderRadius.full};
    overflow: hidden;
    margin-right: ${spacing.md};
  }
  
  .account-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .account-avatar.placeholder {
    background-color: ${colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.text.light};
  }
  
  .account-details {
    flex: 1;
  }
  
  .account-name {
    font-size: ${typography.fontSize.md};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.primary};
    margin: 0 0 ${spacing.xs} 0;
  }
  
  .account-stats {
    display: flex;
    align-items: center;
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
  }
  
  .account-stat {
    margin-right: ${spacing.md};
  }
  
  .account-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
  }
  
  .account-status.connected i {
    color: ${colors.success};
  }
  
  .schedule-list {
    margin-bottom: ${spacing.md};
  }
  
  .schedule-item {
    display: flex;
    align-items: center;
    padding: ${spacing.md} 0;
    border-bottom: 1px solid ${colors.border};
  }
  
  .schedule-item:last-child {
    border-bottom: none;
  }
  
  .schedule-time {
    width: 80px;
    margin-right: ${spacing.md};
    text-align: center;
  }
  
  .schedule-date {
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.primary};
  }
  
  .schedule-hour {
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
  }
  
  .schedule-content {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .schedule-thumbnail {
    width: 60px;
    height: 60px;
    border-radius: ${borderRadius.md};
    overflow: hidden;
    margin-right: ${spacing.md};
    position: relative;
  }
  
  .schedule-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .schedule-details {
    flex: 1;
  }
  
  .schedule-title {
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.primary};
    margin: 0 0 ${spacing.xs} 0;
  }
  
  .schedule-account {
    font-size: ${typography.fontSize.xs};
    color: ${colors.text.secondary};
  }
  
  .schedule-actions {
    display: flex;
  }
  
  .schedule-more {
    text-align: center;
    margin-top: ${spacing.md};
  }
  
  .ai-activity-list {
    margin-bottom: ${spacing.md};
  }
  
  .ai-activity-item {
    display: flex;
    align-items: center;
    padding: ${spacing.md} 0;
    border-bottom: 1px solid ${colors.border};
  }
  
  .ai-activity-item:last-child {
    border-bottom: none;
  }
  
  .ai-activity-icon {
    width: 40px;
    height: 40px;
    border-radius: ${borderRadius.md};
    background-color: ${colors.primary}1a;
    color: ${colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${spacing.md};
  }
  
  .ai-activity-details {
    flex: 1;
  }
  
  .ai-activity-title {
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.primary};
    margin: 0 0 ${spacing.xs} 0;
  }
  
  .ai-activity-meta {
    font-size: ${typography.fontSize.xs};
    color: ${colors.text.secondary};
    margin-bottom: ${spacing.xs};
  }
  
  .ai-activity-time {
    font-size: ${typography.fontSize.xs};
    color: ${colors.text.light};
  }
  
  .ai-activity-actions {
    display: flex;
  }
  
  /* Instagram-Seite */
  .instagram-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: ${spacing.lg};
    padding: ${spacing.md};
    background-color: ${colors.card};
    border-radius: ${borderRadius.md};
    box-shadow: ${shadows.sm};
  }
  
  .filter-group {
    margin-right: ${spacing.md};
    margin-bottom: ${spacing.sm};
  }
  
  .filter-label {
    display: block;
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
    margin-bottom: ${spacing.xs};
  }
  
  .instagram-grid {
    margin-bottom: ${spacing.lg};
  }
  
  .instagram-card {
    background-color: ${colors.card};
    border-radius: ${borderRadius.md};
    box-shadow: ${shadows.md};
    overflow: hidden;
    margin-bottom: ${spacing.lg};
    height: 100%;
  }
  
  .instagram-card-image {
    position: relative;
    padding-bottom: 100%; /* 1:1 Aspect Ratio */
    overflow: hidden;
  }
  
  .instagram-card-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .instagram-card-badge {
    position: absolute;
    top: ${spacing.sm};
    right: ${spacing.sm};
    padding: ${spacing.xs} ${spacing.sm};
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.xs};
    font-weight: ${typography.fontWeight.medium};
  }
  
  .instagram-card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .instagram-card:hover .instagram-card-overlay {
    opacity: 1;
  }
  
  .instagram-card-actions {
    display: flex;
  }
  
  .instagram-card-actions .btn {
    margin: 0 ${spacing.xs};
  }
  
  .instagram-card-content {
    padding: ${spacing.md};
  }
  
  .instagram-card-title {
    font-size: ${typography.fontSize.md};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.primary};
    margin: 0 0 ${spacing.xs} 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .instagram-card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing.xs};
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
  }
  
  .instagram-card-account {
    color: ${colors.primary};
  }
  
  .instagram-card-date {
    color: ${colors.text.light};
  }
  
  .instagram-card-stats {
    display: flex;
    align-items: center;
  }
  
  .instagram-card-stat {
    display: flex;
    align-items: center;
    margin-right: ${spacing.md};
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
  }
  
  .instagram-card-stat i {
    font-size: 16px;
    margin-right: ${spacing.xs};
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: ${spacing.lg};
  }
  
  .pagination-item {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 ${spacing.xs};
    border-radius: ${borderRadius.md};
    background-color: ${colors.card};
    color: ${colors.text.primary};
    font-size: ${typography.fontSize.md};
    border: 1px solid ${colors.border};
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .pagination-item:hover {
    background-color: ${colors.background};
  }
  
  .pagination-item.active {
    background-color: ${colors.primary};
    color: ${colors.text.inverted};
    border-color: ${colors.primary};
  }
  
  /* Magazin-Seite */
  .magazine-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: ${spacing.lg};
    padding: ${spacing.md};
    background-color: ${colors.card};
    border-radius: ${borderRadius.md};
    box-shadow: ${shadows.sm};
  }
  
  .magazine-grid {
    margin-bottom: ${spacing.lg};
  }
  
  .magazine-card {
    background-color: ${colors.card};
    border-radius: ${borderRadius.md};
    box-shadow: ${shadows.md};
    overflow: hidden;
    margin-bottom: ${spacing.lg};
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .magazine-card-image {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    overflow: hidden;
  }
  
  .magazine-card-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .magazine-card-category {
    position: absolute;
    top: ${spacing.sm};
    left: ${spacing.sm};
    padding: ${spacing.xs} ${spacing.sm};
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.xs};
    font-weight: ${typography.fontWeight.medium};
  }
  
  .magazine-card-badge {
    position: absolute;
    top: ${spacing.sm};
    right: ${spacing.sm};
    padding: ${spacing.xs} ${spacing.sm};
    background-color: ${colors.primary};
    color: white;
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.xs};
    font-weight: ${typography.fontWeight.medium};
  }
  
  .magazine-card-content {
    padding: ${spacing.md};
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .magazine-card-title {
    font-size: ${typography.fontSize.lg};
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.text.primary};
    margin: 0 0 ${spacing.xs} 0;
    line-height: 1.4;
  }
  
  .magazine-card-meta {
    display: flex;
    align-items: center;
    margin-bottom: ${spacing.sm};
    font-size: ${typography.fontSize.sm};
    color: ${colors.text.secondary};
  }
  
  .magazine-card-date {
    margin-right: ${spacing.md};
  }
  
  .magazine-card-source {
    color: ${colors.primary};
  }
  
  .magazine-card-excerpt {
    font-size: ${typography.fontSize.md};
    color: ${colors.text.secondary};
    margin-bottom: ${spacing.md};
    flex: 1;
  }
  
  .magazine-card-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: ${spacing.sm};
  }
  
  .magazine-card-actions .btn {
    margin-left: ${spacing.sm};
  }
  
  /* KI-Tools-Seite */
  .ai-form {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .content-type-selector {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -${spacing.xs};
  }
  
  .content-type-option {
    flex: 1;
    min-width: 120px;
    margin: ${spacing.xs};
  }
  
  .content-type-option input[type="radio"] {
    display: none;
  }
  
  .content-type-option label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${spacing.md};
    background-color: ${colors.background};
    border: 2px solid ${colors.border};
    border-radius: ${borderRadius.md};
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .content-type-option input[type="radio"]:checked + label {
    background-color: ${colors.primary}1a;
    border-color: ${colors.primary};
    color: ${colors.primary};
  }
  
  .content-type-option label i {
    font-size: 24px;
    margin-bottom: ${spacing.sm};
  }
  
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }
  
  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-switch label {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${colors.border};
    transition: .4s;
    border-radius: 34px;
  }
  
  .toggle-switch label:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  .toggle-switch input:checked + label {
    background-color: ${colors.primary};
  }
  
  .toggle-switch input:checked + label:before {
    transform: translateX(26px);
  }
  
  .form-actions {
    margin-top: ${spacing.lg};
    text-align: center;
  }
  
  /* Content-Erstellungs-Seite */
  .content-creation-layout {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -${spacing.md};
  }
  
  .content-editor {
    flex: 0 0 60%;
    max-width: 60%;
    padding: 0 ${spacing.md};
  }
  
  .content-preview {
    flex: 0 0 40%;
    max-width: 40%;
    padding: 0 ${spacing.md};
  }
  
  .image-uploader {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -${spacing.xs};
  }
  
  .image-preview {
    width: 120px;
    height: 120px;
    margin: ${spacing.xs};
    border-radius: ${borderRadius.md};
    overflow: hidden;
    position: relative;
  }
  
  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-actions {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .image-preview:hover .image-actions {
    opacity: 1;
  }
  
  .image-upload-button {
    width: 120px;
    height: 120px;
    margin: ${spacing.xs};
    border-radius: ${borderRadius.md};
    border: 2px dashed ${colors.border};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: ${colors.text.light};
    transition: all 0.3s ease;
  }
  
  .image-upload-button:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
  }
  
  .image-upload-button i {
    font-size: 24px;
    margin-bottom: ${spacing.xs};
  }
  
  .hashtag-editor {
    margin-bottom: ${spacing.md};
  }
  
  .hashtag-list {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: ${spacing.sm};
  }
  
  .hashtag-item {
    display: inline-flex;
    align-items: center;
    padding: ${spacing.xs} ${spacing.sm};
    background-color: ${colors.primary}1a;
    color: ${colors.primary};
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.sm};
    margin-right: ${spacing.xs};
    margin-bottom: ${spacing.xs};
  }
  
  .hashtag-remove {
    background: none;
    border: none;
    color: ${colors.primary};
    font-size: ${typography.fontSize.md};
    cursor: pointer;
    margin-left: ${spacing.xs};
    padding: 0;
    line-height: 1;
  }
  
  .hashtag-input-container {
    display: flex;
    align-items: center;
  }
  
  .hashtag-input {
    flex: 1;
    padding: ${spacing.sm} ${spacing.md};
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    font-size: ${typography.fontSize.md};
    margin-right: ${spacing.sm};
  }
  
  .publishing-options {
    margin-bottom: ${spacing.md};
  }
  
  .publishing-option {
    margin-bottom: ${spacing.sm};
  }
  
  .publishing-option label {
    margin-left: ${spacing.xs};
    cursor: pointer;
  }
  
  .schedule-picker {
    display: flex;
    margin: 0 -${spacing.sm};
  }
  
  .schedule-picker .form-group {
    flex: 1;
    padding: 0 ${spacing.sm};
  }
  
  .preview-container {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .instagram-preview {
    border: 1px solid ${colors.border};
    border-radius: ${borderRadius.md};
    overflow: hidden;
    background-color: white;
  }
  
  .instagram-header {
    display: flex;
    align-items: center;
    padding: ${spacing.sm} ${spacing.md};
    border-bottom: 1px solid ${colors.border};
  }
  
  .profile-image {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${colors.primary};
    margin-right: ${spacing.sm};
    background-image: url('https://via.placeholder.com/32');
    background-size: cover;
  }
  
  .profile-info {
    flex: 1;
  }
  
  .username {
    font-weight: ${typography.fontWeight.semibold};
    font-size: ${typography.fontSize.sm};
  }
  
  .location {
    font-size: ${typography.fontSize.xs};
    color: ${colors.text.secondary};
  }
  
  .options {
    font-weight: bold;
  }
  
  .instagram-image {
    width: 100%;
  }
  
  .instagram-image img {
    width: 100%;
    display: block;
  }
  
  .instagram-actions {
    padding: ${spacing.sm} ${spacing.md};
  }
  
  .action-buttons {
    display: flex;
    margin-bottom: ${spacing.sm};
  }
  
  .action-buttons span {
    margin-right: ${spacing.md};
    font-size: 24px;
  }
  
  .likes {
    font-weight: ${typography.fontWeight.semibold};
    margin-bottom: ${spacing.sm};
    font-size: ${typography.fontSize.sm};
  }
  
  .caption {
    font-size: ${typography.fontSize.sm};
    margin-bottom: ${spacing.sm};
    word-break: break-word;
  }
  
  .caption .username {
    font-weight: ${typography.fontWeight.semibold};
    margin-right: ${spacing.xs};
  }
  
  .timestamp {
    font-size: ${typography.fontSize.xs};
    color: ${colors.text.light};
    text-transform: uppercase;
  }
  
  /* Responsive Anpassungen */
  @media (max-width: ${breakpoints.lg}) {
    .content-editor,
    .content-preview {
      flex: 0 0 100%;
      max-width: 100%;
    }
    
    .content-preview {
      margin-top: ${spacing.lg};
    }
  }
  
  @media (max-width: ${breakpoints.md}) {
    .filter-group {
      flex: 0 0 100%;
      margin-right: 0;
    }
    
    .instagram-card-title,
    .magazine-card-title {
      font-size: ${typography.fontSize.md};
    }
    
    .magazine-card-excerpt {
      font-size: ${typography.fontSize.sm};
    }
  }
`;

// JavaScript für die Seiten
export const pagesScript = `
  // Tab-Funktionalität
  function initTabs() {
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
  
  // Content-Typ-Auswahl-Funktionalität
  function initContentTypeSelector() {
    const contentTypeOptions = document.querySelectorAll('.content-type-option input[type="radio"]');
    
    contentTypeOptions.forEach(option => {
      option.addEventListener('change', () => {
        // Aktualisiere die Vorschau basierend auf dem ausgewählten Content-Typ
        updatePreview();
      });
    });
  }
  
  // Vorschau-Aktualisierung
  function updatePreview() {
    // Diese Funktion würde die Vorschau basierend auf den aktuellen Eingaben aktualisieren
    console.log('Vorschau aktualisiert');
  }
  
  // Hashtag-Funktionalität
  function initHashtagEditor() {
    const hashtagInput = document.querySelector('.hashtag-input');
    const hashtagAddButton = document.querySelector('.hashtag-input-container .btn');
    const hashtagList = document.querySelector('.hashtag-list');
    
    if (hashtagInput && hashtagAddButton && hashtagList) {
      // Hashtag hinzufügen
      hashtagAddButton.addEventListener('click', () => {
        const hashtag = hashtagInput.value.trim();
        
        if (hashtag && !hashtag.includes(' ')) {
          const formattedHashtag = hashtag.startsWith('#') ? hashtag : '#' + hashtag;
          
          // Erstelle neues Hashtag-Element
          const hashtagItem = document.createElement('span');
          hashtagItem.className = 'hashtag-item';
          hashtagItem.innerHTML = \`
            \${formattedHashtag}
            <button class="hashtag-remove">×</button>
          \`;
          
          // Füge Hashtag zur Liste hinzu
          hashtagList.appendChild(hashtagItem);
          
          // Lösche Input
          hashtagInput.value = '';
          
          // Füge Event-Listener für Entfernen-Button hinzu
          const removeButton = hashtagItem.querySelector('.hashtag-remove');
          removeButton.addEventListener('click', () => {
            hashtagList.removeChild(hashtagItem);
            updatePreview();
          });
          
          // Aktualisiere Vorschau
          updatePreview();
        }
      });
      
      // Hashtag mit Enter-Taste hinzufügen
      hashtagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          hashtagAddButton.click();
        }
      });
      
      // Event-Listener für bestehende Entfernen-Buttons
      const removeButtons = document.querySelectorAll('.hashtag-remove');
      removeButtons.forEach(button => {
        button.addEventListener('click', () => {
          const hashtagItem = button.parentElement;
          hashtagList.removeChild(hashtagItem);
          updatePreview();
        });
      });
    }
  }
  
  // Veröffentlichungs-Optionen-Funktionalität
  function initPublishingOptions() {
    const publishingOptions = document.querySelectorAll('.publishing-option input[type="radio"]');
    const schedulePicker = document.querySelector('.schedule-picker');
    
    if (publishingOptions.length && schedulePicker) {
      publishingOptions.forEach(option => {
        option.addEventListener('change', () => {
          if (option.value === 'schedule') {
            schedulePicker.style.display = 'flex';
          } else {
            schedulePicker.style.display = 'none';
          }
        });
      });
      
      // Initialisiere den Zustand
      const scheduleOption = document.querySelector('#publish-schedule');
      if (scheduleOption && scheduleOption.checked) {
        schedulePicker.style.display = 'flex';
      } else {
        schedulePicker.style.display = 'none';
      }
    }
  }
  
  // Initialisiere alle Seiten-Funktionen
  function initPages() {
    initTabs();
    initContentTypeSelector();
    initHashtagEditor();
    initPublishingOptions();
  }
  
  // Führe Initialisierung aus, wenn DOM geladen ist
  document.addEventListener('DOMContentLoaded', initPages);
`;

// Exportiere alle Seiten-Komponenten
export default {
  dashboardTemplate,
  instagramTemplate,
  magazineTemplate,
  aiToolsTemplate,
  contentCreationTemplate,
  pagesStyles,
  pagesScript
};
