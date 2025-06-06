/**
 * Server für StudiFlow AI Enterprise
 * 
 * Stellt die Backend-Funktionalität für die Anwendung bereit.
 * 
 * @version 1.0.0
 */

// Import der Module
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cron = require('node-cron');
const winston = require('winston');

// Lade Umgebungsvariablen
dotenv.config();

// Initialisiere Express-App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Statische Dateien
app.use(express.static(path.join(__dirname, 'public')));

// Logger konfigurieren
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'studiflow-ai-enterprise' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Wenn nicht in Produktion, auch in die Konsole loggen
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Multer für Datei-Uploads konfigurieren
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// API-Routen
const apiRouter = express.Router();

// Authentifizierung
apiRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Hier würde die tatsächliche Authentifizierung stattfinden
  // Für die Demo verwenden wir einen simulierten Benutzer
  
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign(
      { id: 1, username: 'admin', role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: 1,
        username: 'admin',
        role: 'admin',
        name: 'Administrator'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Ungültige Anmeldeinformationen'
    });
  }
});

// Middleware für JWT-Authentifizierung
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Instagram-Routen
apiRouter.get('/instagram/accounts', authenticateToken, (req, res) => {
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const accounts = [
    {
      id: 1,
      name: 'studibuch_official',
      username: 'studibuch_official',
      avatar: '/assets/images/account-1.jpg',
      followers: '12.5k',
      posts: 245,
      connected: true
    },
    {
      id: 2,
      name: 'studibuch_tipps',
      username: 'studibuch_tipps',
      avatar: '/assets/images/account-2.jpg',
      followers: '8.3k',
      posts: 178,
      connected: true
    }
  ];
  
  res.json({
    success: true,
    accounts
  });
});

apiRouter.post('/instagram/connect', authenticateToken, (req, res) => {
  const { code } = req.body;
  
  // Hier würde die tatsächliche API-Verbindung stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (code) {
    res.json({
      success: true,
      message: 'Instagram-Konto erfolgreich verbunden'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Fehlender Autorisierungscode'
    });
  }
});

apiRouter.get('/instagram/posts', authenticateToken, (req, res) => {
  const { accountId } = req.query;
  
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const posts = [
    {
      id: 1,
      accountId: accountId || 1,
      caption: '10 Tipps für effektives Lernen',
      mediaUrl: '/assets/images/content-1.jpg',
      permalink: 'https://instagram.com/p/123456',
      mediaType: 'IMAGE',
      timestamp: '2025-05-25T07:30:00Z',
      stats: {
        likes: 45,
        comments: 12,
        shares: 8
      }
    },
    {
      id: 2,
      accountId: accountId || 1,
      caption: 'Studieren im Ausland: Erfahrungsbericht',
      mediaUrl: '/assets/images/content-2.jpg',
      permalink: 'https://instagram.com/p/234567',
      mediaType: 'CAROUSEL_ALBUM',
      timestamp: '2025-05-24T10:15:00Z',
      stats: {
        likes: 87,
        comments: 23,
        shares: 15
      }
    },
    {
      id: 3,
      accountId: accountId || 2,
      caption: 'Prüfungsvorbereitung in 5 Schritten',
      mediaUrl: '/assets/images/content-3.jpg',
      permalink: 'https://instagram.com/p/345678',
      mediaType: 'VIDEO',
      timestamp: '2025-05-22T14:45:00Z',
      stats: {
        likes: 156,
        comments: 34,
        shares: 42
      }
    }
  ];
  
  res.json({
    success: true,
    posts
  });
});

apiRouter.post('/instagram/publish', authenticateToken, upload.single('media'), (req, res) => {
  const { accountId, caption, mediaType, scheduledTime } = req.body;
  const mediaFile = req.file;
  
  // Hier würde die tatsächliche API-Veröffentlichung stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (!accountId || !caption || !mediaType) {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Parameter'
    });
  }
  
  if (!mediaFile && mediaType !== 'TEXT') {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Mediendatei'
    });
  }
  
  // Simuliere verzögerte Antwort
  setTimeout(() => {
    res.json({
      success: true,
      message: scheduledTime ? 'Post erfolgreich geplant' : 'Post erfolgreich veröffentlicht',
      post: {
        id: Math.floor(Math.random() * 1000000),
        accountId: parseInt(accountId),
        caption,
        mediaUrl: mediaFile ? `/uploads/${mediaFile.filename}` : null,
        mediaType,
        scheduledTime: scheduledTime || null,
        timestamp: new Date().toISOString(),
        stats: {
          likes: 0,
          comments: 0,
          shares: 0
        }
      }
    });
  }, 1500);
});

// Magazin-Routen
apiRouter.get('/magazine/articles', authenticateToken, (req, res) => {
  const { category, limit } = req.query;
  
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const articles = [
    {
      id: 1,
      title: 'Die besten Lernmethoden für verschiedene Fachbereiche',
      category: 'Lernstrategien',
      date: '2025-05-15',
      author: 'Dr. Anna Schmidt',
      thumbnail: '/assets/images/magazine-1.jpg',
      excerpt: 'Jeder Fachbereich erfordert unterschiedliche Lernansätze. In diesem Artikel stellen wir die effektivsten Methoden vor...',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.',
      url: 'https://studibuch.de/magazin/lernmethoden-fachbereiche'
    },
    {
      id: 2,
      title: 'Finanzierung des Studiums: Stipendien und Fördermöglichkeiten',
      category: 'Finanzen',
      date: '2025-05-12',
      author: 'Max Müller',
      thumbnail: '/assets/images/magazine-2.jpg',
      excerpt: 'Ein Überblick über die verschiedenen Finanzierungsmöglichkeiten für Studierende, von BAföG bis zu privaten Stipendien...',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.',
      url: 'https://studibuch.de/magazin/finanzierung-studium'
    },
    {
      id: 3,
      title: 'Auslandssemester: Erfahrungsberichte und Tipps',
      category: 'Auslandsstudium',
      date: '2025-05-10',
      author: 'Lisa Wagner',
      thumbnail: '/assets/images/magazine-3.jpg',
      excerpt: 'Studierende berichten von ihren Erfahrungen im Ausland und geben wertvolle Tipps für die Planung und Durchführung...',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.',
      url: 'https://studibuch.de/magazin/auslandssemester-erfahrungen'
    }
  ];
  
  // Filtere nach Kategorie, wenn angegeben
  let filteredArticles = articles;
  if (category) {
    filteredArticles = articles.filter(article => article.category.toLowerCase() === category.toLowerCase());
  }
  
  // Begrenze die Anzahl der Artikel, wenn angegeben
  if (limit) {
    filteredArticles = filteredArticles.slice(0, parseInt(limit));
  }
  
  res.json({
    success: true,
    articles: filteredArticles
  });
});

apiRouter.post('/magazine/scrape', authenticateToken, (req, res) => {
  const { url } = req.body;
  
  // Hier würde das tatsächliche Scraping stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'Fehlende URL'
    });
  }
  
  // Simuliere verzögerte Antwort
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Scraping erfolgreich gestartet',
      job: {
        id: Math.floor(Math.random() * 1000000),
        status: 'running',
        url,
        startTime: new Date().toISOString()
      }
    });
  }, 1000);
});

apiRouter.get('/magazine/scrape/status', authenticateToken, (req, res) => {
  const { jobId } = req.query;
  
  // Hier würde die tatsächliche Statusabfrage stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (!jobId) {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Job-ID'
    });
  }
  
  res.json({
    success: true,
    job: {
      id: jobId,
      status: 'completed',
      url: 'https://studibuch.de/magazin',
      startTime: new Date(Date.now() - 60000).toISOString(),
      endTime: new Date().toISOString(),
      articlesFound: 12,
      articlesAdded: 5,
      articlesUpdated: 7
    }
  });
});

// Content-Routen
apiRouter.get('/content/items', authenticateToken, (req, res) => {
  const { type, status, limit } = req.query;
  
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const contentItems = [
    {
      id: 1,
      title: '10 Tipps für effektives Lernen',
      type: 'instagram_post',
      status: 'published',
      createdAt: '2025-05-25T07:30:00Z',
      publishedAt: '2025-05-25T07:30:00Z',
      accountId: 1,
      accountName: 'studibuch_official',
      mediaUrl: '/assets/images/content-1.jpg',
      caption: '10 Tipps für effektives Lernen\n\n1. Regelmäßige Pausen einlegen\n2. Verschiedene Lernmethoden kombinieren\n3. Eine ablenkungsfreie Umgebung schaffen\n4. Ausreichend schlafen\n5. Gesund ernähren\n6. Bewegung einbauen\n7. Lerngruppen bilden\n8. Realistische Ziele setzen\n9. Belohnungen einplanen\n10. Wiederholungen nutzen\n\n#studium #lernen #tipps #studibuch',
      stats: {
        likes: 45,
        comments: 12,
        shares: 8
      }
    },
    {
      id: 2,
      title: 'Studieren im Ausland: Erfahrungsbericht',
      type: 'instagram_carousel',
      status: 'published',
      createdAt: '2025-05-24T10:15:00Z',
      publishedAt: '2025-05-24T10:15:00Z',
      accountId: 1,
      accountName: 'studibuch_official',
      mediaUrl: '/assets/images/content-2.jpg',
      caption: 'Studieren im Ausland: Erfahrungsbericht\n\nUnsere Studentin Lisa berichtet von ihrem Auslandssemester in Barcelona. Swipe für mehr Eindrücke und Tipps!\n\n#auslandssemester #studium #barcelona #studibuch',
      stats: {
        likes: 87,
        comments: 23,
        shares: 15
      }
    },
    {
      id: 3,
      title: 'Prüfungsvorbereitung in 5 Schritten',
      type: 'instagram_reel',
      status: 'published',
      createdAt: '2025-05-22T14:45:00Z',
      publishedAt: '2025-05-22T14:45:00Z',
      accountId: 2,
      accountName: 'studibuch_tipps',
      mediaUrl: '/assets/images/content-3.jpg',
      caption: 'Prüfungsvorbereitung in 5 Schritten\n\n1. Frühzeitig beginnen\n2. Lernplan erstellen\n3. Altklausuren üben\n4. Lerngruppen bilden\n5. Ausreichend Pausen einplanen\n\n#prüfung #lernen #studium #studibuch',
      stats: {
        likes: 156,
        comments: 34,
        shares: 42
      }
    },
    {
      id: 4,
      title: 'Zeitmanagement im Studium',
      type: 'instagram_post',
      status: 'scheduled',
      createdAt: '2025-05-25T09:00:00Z',
      scheduledAt: '2025-05-25T14:30:00Z',
      accountId: 2,
      accountName: 'studibuch_tipps',
      mediaUrl: '/assets/images/schedule-1.jpg',
      caption: 'Zeitmanagement im Studium\n\nMit diesen Tipps behältst du den Überblick und schaffst mehr in weniger Zeit:\n\n1. Prioritäten setzen\n2. To-Do-Listen nutzen\n3. Pomodoro-Technik anwenden\n4. Ablenkungen minimieren\n5. Nein sagen lernen\n\n#zeitmanagement #studium #produktivität #studibuch',
      stats: null
    },
    {
      id: 5,
      title: 'Bücher für das Sommersemester',
      type: 'instagram_carousel',
      status: 'scheduled',
      createdAt: '2025-05-25T10:30:00Z',
      scheduledAt: '2025-05-26T10:00:00Z',
      accountId: 1,
      accountName: 'studibuch_official',
      mediaUrl: '/assets/images/schedule-2.jpg',
      caption: 'Bücher für das Sommersemester\n\nUnsere Top-Empfehlungen für verschiedene Studiengänge. Swipe für mehr!\n\n#bücher #studium #sommersemester #studibuch',
      stats: null
    }
  ];
  
  // Filtere nach Typ, wenn angegeben
  let filteredItems = contentItems;
  if (type) {
    filteredItems = contentItems.filter(item => item.type === type);
  }
  
  // Filtere nach Status, wenn angegeben
  if (status) {
    filteredItems = filteredItems.filter(item => item.status === status);
  }
  
  // Begrenze die Anzahl der Items, wenn angegeben
  if (limit) {
    filteredItems = filteredItems.slice(0, parseInt(limit));
  }
  
  res.json({
    success: true,
    items: filteredItems
  });
});

apiRouter.post('/content/create', authenticateToken, upload.single('media'), (req, res) => {
  const { title, type, accountId, caption, scheduledTime } = req.body;
  const mediaFile = req.file;
  
  // Hier würde die tatsächliche Content-Erstellung stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (!title || !type || !accountId || !caption) {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Parameter'
    });
  }
  
  if (!mediaFile && type !== 'text_only') {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Mediendatei'
    });
  }
  
  // Simuliere verzögerte Antwort
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Content erfolgreich erstellt',
      item: {
        id: Math.floor(Math.random() * 1000000),
        title,
        type,
        status: scheduledTime ? 'scheduled' : 'draft',
        createdAt: new Date().toISOString(),
        scheduledAt: scheduledTime || null,
        accountId: parseInt(accountId),
        accountName: parseInt(accountId) === 1 ? 'studibuch_official' : 'studibuch_tipps',
        mediaUrl: mediaFile ? `/uploads/${mediaFile.filename}` : null,
        caption,
        stats: null
      }
    });
  }, 1500);
});

apiRouter.post('/content/generate', authenticateToken, (req, res) => {
  const { articleId, type, accountId } = req.body;
  
  // Hier würde die tatsächliche Content-Generierung stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (!articleId || !type || !accountId) {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Parameter'
    });
  }
  
  // Simuliere verzögerte Antwort
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Content-Generierung erfolgreich gestartet',
      job: {
        id: Math.floor(Math.random() * 1000000),
        status: 'running',
        articleId: parseInt(articleId),
        type,
        accountId: parseInt(accountId),
        startTime: new Date().toISOString()
      }
    });
  }, 1000);
});

// Creatomate-Routen
apiRouter.post('/creatomate/generate', authenticateToken, (req, res) => {
  const { contentId, template, options } = req.body;
  
  // Hier würde die tatsächliche Reel-Generierung stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (!contentId || !template) {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Parameter'
    });
  }
  
  // Simuliere verzögerte Antwort
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Reel-Generierung erfolgreich gestartet',
      job: {
        id: Math.floor(Math.random() * 1000000),
        status: 'running',
        contentId: parseInt(contentId),
        template,
        options: options || {},
        startTime: new Date().toISOString()
      }
    });
  }, 1000);
});

apiRouter.get('/creatomate/status', authenticateToken, (req, res) => {
  const { jobId } = req.query;
  
  // Hier würde die tatsächliche Statusabfrage stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (!jobId) {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Job-ID'
    });
  }
  
  res.json({
    success: true,
    job: {
      id: jobId,
      status: 'completed',
      contentId: 123,
      template: 'social_media_reel',
      options: {},
      startTime: new Date(Date.now() - 120000).toISOString(),
      endTime: new Date().toISOString(),
      outputUrl: '/assets/videos/generated-reel.mp4'
    }
  });
});

// KI-Routen
apiRouter.post('/ai/generate', authenticateToken, (req, res) => {
  const { prompt, type, options } = req.body;
  
  // Hier würde die tatsächliche KI-Generierung stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (!prompt || !type) {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Parameter'
    });
  }
  
  // Simuliere verzögerte Antwort
  setTimeout(() => {
    let response;
    
    switch (type) {
      case 'text':
        response = {
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.'
        };
        break;
      case 'image':
        response = {
          imageUrl: '/assets/images/ai-generated-image.jpg'
        };
        break;
      case 'caption':
        response = {
          caption: 'Zeitmanagement im Studium\n\nMit diesen Tipps behältst du den Überblick und schaffst mehr in weniger Zeit:\n\n1. Prioritäten setzen\n2. To-Do-Listen nutzen\n3. Pomodoro-Technik anwenden\n4. Ablenkungen minimieren\n5. Nein sagen lernen\n\n#zeitmanagement #studium #produktivität #studibuch'
        };
        break;
      case 'hashtags':
        response = {
          hashtags: ['#studium', '#lernen', '#zeitmanagement', '#produktivität', '#studibuch', '#studentenleben', '#studieren', '#universität', '#hochschule', '#bildung']
        };
        break;
      default:
        response = {
          text: 'Generierter Inhalt'
        };
    }
    
    res.json({
      success: true,
      message: 'KI-Generierung erfolgreich',
      type,
      prompt,
      response
    });
  }, 2000);
});

// Statistik-Routen
apiRouter.get('/stats/dashboard', authenticateToken, (req, res) => {
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
  
  res.json({
    success: true,
    stats
  });
});

// Aktivitäts-Routen
apiRouter.get('/activities', authenticateToken, (req, res) => {
  const { type, limit } = req.query;
  
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  const activities = [
    {
      id: 1,
      type: 'content_generation',
      title: 'Content-Generierung abgeschlossen',
      meta: '5 Posts aus 2 Artikeln',
      time: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      icon: 'auto_awesome'
    },
    {
      id: 2,
      type: 'reel_generation',
      title: 'Reel-Generierung abgeschlossen',
      meta: 'Prüfungsvorbereitung in 5 Schritten',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: 'movie'
    },
    {
      id: 3,
      type: 'magazine_scraping',
      title: 'Magazin-Scraping abgeschlossen',
      meta: '12 neue Artikel gefunden',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      icon: 'sync'
    }
  ];
  
  // Filtere nach Typ, wenn angegeben
  let filteredActivities = activities;
  if (type) {
    filteredActivities = activities.filter(activity => activity.type === type);
  }
  
  // Begrenze die Anzahl der Aktivitäten, wenn angegeben
  if (limit) {
    filteredActivities = filteredActivities.slice(0, parseInt(limit));
  }
  
  res.json({
    success: true,
    activities: filteredActivities
  });
});

// Benutzer-Routen
apiRouter.get('/users/me', authenticateToken, (req, res) => {
  // Hier würden die tatsächlichen API-Aufrufe stattfinden
  // Für die Demo verwenden wir Beispieldaten
  
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      name: 'Administrator',
      email: 'admin@studibuch.de',
      avatar: '/assets/images/avatar.png',
      settings: {
        theme: 'light',
        sidebarCollapsed: false,
        notifications: {
          email: true,
          push: true
        }
      }
    }
  });
});

apiRouter.put('/users/settings', authenticateToken, (req, res) => {
  const { settings } = req.body;
  
  // Hier würde die tatsächliche Einstellungsaktualisierung stattfinden
  // Für die Demo verwenden wir eine simulierte Antwort
  
  if (!settings) {
    return res.status(400).json({
      success: false,
      message: 'Fehlende Einstellungen'
    });
  }
  
  res.json({
    success: true,
    message: 'Einstellungen erfolgreich aktualisiert',
    settings
  });
});

// Verwende den API-Router
app.use('/api', apiRouter);

// Fallback-Route für SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Geplante Aufgaben
cron.schedule('0 * * * *', () => {
  logger.info('Stündliche geplante Aufgabe ausgeführt');
  // Hier würden die tatsächlichen geplanten Aufgaben ausgeführt werden
});

// Starte den Server
app.listen(PORT, () => {
  logger.info(`Server läuft auf Port ${PORT}`);
  console.log(`Server läuft auf Port ${PORT}`);
});

module.exports = app;
