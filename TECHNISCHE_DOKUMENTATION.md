# StudiFlow AI Enterprise - Technische Dokumentation

## Übersicht

StudiFlow AI Enterprise ist eine integrierte Lösung für Content-Management und Social Media Automatisierung, die speziell für StudiBuch entwickelt wurde. Das System ermöglicht die nahtlose Integration mit Instagram, automatisches Scraping von Magazin-Artikeln, Vorschau von Content und automatische Generierung von Reels.

Diese Dokumentation beschreibt die technische Architektur, Komponenten und Funktionen des Systems sowie Installations- und Konfigurationsanweisungen.

## Systemarchitektur

### Überblick

StudiFlow AI Enterprise basiert auf einer modernen, modularen Architektur mit klarer Trennung von Frontend und Backend. Die Hauptkomponenten sind:

1. **Frontend**: React-basierte Single-Page-Application (SPA)
2. **Backend**: Node.js-Server mit Express
3. **Datenbank**: MongoDB für persistente Datenspeicherung
4. **Externe API-Integrationen**: Instagram Graph API, Creatomate API, OpenAI API

### Architekturdiagramm

```
+----------------------------------+
|           Frontend               |
|  +----------------------------+  |
|  |        React SPA          |  |
|  +----------------------------+  |
+----------------------------------+
              |
              | HTTP/HTTPS
              |
+----------------------------------+
|           Backend                |
|  +----------------------------+  |
|  |      Express Server       |  |
|  +----------------------------+  |
|  |                           |  |
|  |  +---------------------+  |  |
|  |  |  Service-Module    |  |  |
|  |  +---------------------+  |  |
|  |  | - Instagram        |  |  |
|  |  | - Magazine         |  |  |
|  |  | - Content          |  |  |
|  |  | - Creatomate       |  |  |
|  |  | - AI               |  |  |
|  |  +---------------------+  |  |
|  |                           |  |
+----------------------------------+
              |
              | Mongoose
              |
+----------------------------------+
|           Datenbank              |
|  +----------------------------+  |
|  |         MongoDB           |  |
|  +----------------------------+  |
+----------------------------------+
              |
              | HTTP/HTTPS
              |
+----------------------------------+
|        Externe APIs              |
|  +----------------------------+  |
|  | - Instagram Graph API     |  |
|  | - Creatomate API          |  |
|  | - OpenAI API              |  |
|  +----------------------------+  |
+----------------------------------+
```

## Komponenten

### Frontend

Das Frontend ist eine React-basierte Single-Page-Application (SPA) mit folgenden Hauptkomponenten:

- **UI-Komponenten**: Wiederverwendbare UI-Elemente wie Buttons, Cards, Forms, etc.
- **Layout-Komponenten**: Header, Sidebar, Footer, etc.
- **Seiten-Komponenten**: Dashboard, Content, Instagram, Magazine, Settings, etc.
- **Service-Module**: API-Client, Auth-Service, etc.

### Backend

Das Backend ist ein Node.js-Server mit Express und folgenden Hauptkomponenten:

- **API-Router**: Definiert die API-Endpunkte
- **Controller**: Implementiert die Geschäftslogik
- **Service-Module**: Kapselt die Funktionalität für verschiedene Bereiche
- **Middleware**: Authentifizierung, Fehlerbehandlung, Logging, etc.
- **Datenbank-Modelle**: Mongoose-Schemas für MongoDB

### Service-Module

#### Instagram-Service

Der Instagram-Service ist verantwortlich für die Integration mit der Instagram Graph API und bietet folgende Funktionen:

- Authentifizierung mit OAuth 2.0
- Abrufen von Account-Informationen
- Veröffentlichung von Posts, Carousels, Videos und Reels
- Abrufen von Insights und Statistiken

#### Magazin-Service

Der Magazin-Service ist verantwortlich für das Scraping von Magazin-Artikeln und bietet folgende Funktionen:

- Automatisches Scraping von StudiBuch-Magazin-Artikeln
- Filterung nach Kategorien und beliebten Artikeln
- Parsing und Aufbereitung der Artikel-Inhalte
- Caching zur Reduzierung von API-Anfragen

#### Content-Service

Der Content-Service ist verantwortlich für die Erstellung und Verwaltung von Content und bietet folgende Funktionen:

- Erstellung von Content-Items (Posts, Carousels, Videos, Reels)
- Vorschau von Content mit korrekter Darstellung
- Planung und Zeitsteuerung von Content
- Verwaltung von Content-Kategorien und Tags

#### Creatomate-Service

Der Creatomate-Service ist verantwortlich für die Integration mit der Creatomate API und bietet folgende Funktionen:

- Generierung von Reels und Videos
- Verwaltung von Templates und Vorlagen
- Anpassung von Parametern und Einstellungen
- Überwachung des Generierungsprozesses

#### AI-Service

Der AI-Service ist verantwortlich für die Integration mit KI-Diensten wie OpenAI und bietet folgende Funktionen:

- Generierung von Texten und Captions
- Analyse von Inhalten und Trends
- Vorschläge für Hashtags und Keywords
- Optimierung von Content-Strategien

## Datenmodelle

### User

```javascript
{
  id: String,
  username: String,
  password: String (hashed),
  email: String,
  role: String (enum: ['admin', 'editor', 'viewer']),
  settings: {
    theme: String,
    sidebarCollapsed: Boolean,
    notifications: {
      email: Boolean,
      push: Boolean
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### InstagramAccount

```javascript
{
  id: String,
  userId: String,
  name: String,
  username: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  profilePicture: String,
  followers: Number,
  posts: Number,
  connected: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### ContentItem

```javascript
{
  id: String,
  userId: String,
  accountId: String,
  title: String,
  type: String (enum: ['instagram_post', 'instagram_carousel', 'instagram_video', 'instagram_reel']),
  status: String (enum: ['draft', 'scheduled', 'published', 'failed']),
  mediaUrl: String,
  caption: String,
  hashtags: [String],
  scheduledAt: Date,
  publishedAt: Date,
  stats: {
    likes: Number,
    comments: Number,
    shares: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### MagazineArticle

```javascript
{
  id: String,
  title: String,
  category: String,
  author: String,
  date: Date,
  url: String,
  thumbnail: String,
  excerpt: String,
  content: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### ReelTemplate

```javascript
{
  id: String,
  name: String,
  description: String,
  thumbnail: String,
  creatomateId: String,
  parameters: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## API-Endpunkte

### Authentifizierung

- `POST /api/auth/login`: Benutzeranmeldung
- `POST /api/auth/logout`: Benutzerabmeldung
- `GET /api/auth/me`: Abrufen des aktuellen Benutzers

### Instagram

- `GET /api/instagram/accounts`: Abrufen aller Instagram-Konten
- `POST /api/instagram/connect`: Verbinden eines Instagram-Kontos
- `GET /api/instagram/posts`: Abrufen aller Instagram-Posts
- `POST /api/instagram/publish`: Veröffentlichen eines Instagram-Posts

### Magazin

- `GET /api/magazine/articles`: Abrufen aller Magazin-Artikel
- `POST /api/magazine/scrape`: Starten des Scraping-Prozesses
- `GET /api/magazine/scrape/status`: Abrufen des Scraping-Status

### Content

- `GET /api/content/items`: Abrufen aller Content-Items
- `POST /api/content/create`: Erstellen eines Content-Items
- `POST /api/content/generate`: Generieren von Content aus einem Artikel

### Creatomate

- `POST /api/creatomate/generate`: Generieren eines Reels
- `GET /api/creatomate/status`: Abrufen des Generierungsstatus

### KI

- `POST /api/ai/generate`: Generieren von Text oder Bildern mit KI

### Statistiken

- `GET /api/stats/dashboard`: Abrufen der Dashboard-Statistiken

### Aktivitäten

- `GET /api/activities`: Abrufen aller Aktivitäten

### Benutzer

- `GET /api/users/me`: Abrufen des aktuellen Benutzers
- `PUT /api/users/settings`: Aktualisieren der Benutzereinstellungen

## Installation und Konfiguration

### Voraussetzungen

- Node.js (v14 oder höher)
- MongoDB (v4 oder höher)
- npm oder yarn

### Installation

1. Repository klonen:
   ```
   git clone https://github.com/studibuch/studiflow-ai-enterprise.git
   cd studiflow-ai-enterprise
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Umgebungsvariablen konfigurieren:
   Erstellen Sie eine `.env`-Datei im Stammverzeichnis mit folgenden Variablen:
   ```
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Datenbank
   MONGODB_URI=mongodb://localhost:27017/studiflow
   
   # JWT
   JWT_SECRET=your-secret-key
   JWT_EXPIRY=1h
   
   # Instagram
   INSTAGRAM_APP_ID=your-app-id
   INSTAGRAM_APP_SECRET=your-app-secret
   INSTAGRAM_REDIRECT_URI=https://your-domain.com/auth/instagram/callback
   
   # Creatomate
   CREATOMATE_API_KEY=your-api-key
   
   # OpenAI
   OPENAI_API_KEY=your-api-key
   ```

4. Datenbank initialisieren:
   ```
   npm run init-db
   ```

5. Anwendung starten:
   ```
   npm start
   ```

### Entwicklung

1. Entwicklungsserver starten:
   ```
   npm run dev
   ```

2. Tests ausführen:
   ```
   npm test
   ```

3. Build erstellen:
   ```
   npm run build
   ```

## Sicherheit und Datenschutz

### Sicherheitsmaßnahmen

- JWT-Authentifizierung für API-Zugriff
- Bcrypt für Passwort-Hashing
- HTTPS für alle Kommunikation
- Rollenbasierte Zugriffskontrolle
- Sichere Speicherung von API-Schlüsseln

### Datenschutzmaßnahmen

- Einwilligungsmechanismus für die Verarbeitung personenbezogener Daten
- Datenschutzerklärung mit allen erforderlichen Informationen
- Mechanismen für die Ausübung der Betroffenenrechte (Auskunft, Löschung, etc.)
- Klare Informationen über die Datenverarbeitung durch Drittanbieter

## Bekannte Probleme und Einschränkungen

1. **Rate Limiting**: Es gibt kein Rate Limiting für API-Anfragen, was das System anfällig für Brute-Force- und DoS-Angriffe macht.
2. **Datenverschlüsselung**: Sensible Daten wie API-Schlüssel werden nicht verschlüsselt in der Datenbank gespeichert.
3. **Datenschutz**: Es fehlt eine explizite Einwilligung der Benutzer zur Datenverarbeitung gemäß DSGVO.
4. **Fehlerbehandlung**: Detaillierte Fehlermeldungen werden an Benutzer zurückgegeben, was potenziell sensible Informationen offenlegen könnte.

## Wartung und Support

### Logging

Das System verwendet Winston für strukturiertes Logging. Die Logs werden in folgenden Dateien gespeichert:

- `error.log`: Fehler-Logs
- `combined.log`: Alle Logs

### Monitoring

Das System bietet keine integrierten Monitoring-Funktionen. Es wird empfohlen, externe Monitoring-Tools wie PM2 oder New Relic zu verwenden.

### Backup und Wiederherstellung

Es wird empfohlen, regelmäßige Backups der MongoDB-Datenbank durchzuführen. Dies kann mit dem folgenden Befehl erfolgen:

```
mongodump --uri="mongodb://localhost:27017/studiflow" --out=/path/to/backup
```

Zur Wiederherstellung kann der folgende Befehl verwendet werden:

```
mongorestore --uri="mongodb://localhost:27017/studiflow" /path/to/backup
```

## Erweiterungen und Anpassungen

### Neue Service-Module hinzufügen

Um ein neues Service-Modul hinzuzufügen, erstellen Sie eine neue Datei im Verzeichnis `src/services` und exportieren Sie die Service-Funktionen:

```javascript
// src/services/new-service.js

/**
 * Neuer Service für StudiFlow AI Enterprise
 */
class NewService {
  /**
   * Initialisiert den Service
   */
  async initialize() {
    // Initialisierungscode
  }
  
  /**
   * Beispielfunktion
   */
  async exampleFunction() {
    // Funktionscode
  }
}

module.exports = new NewService();
```

### Neue API-Endpunkte hinzufügen

Um einen neuen API-Endpunkt hinzuzufügen, erstellen Sie eine neue Route im entsprechenden Router:

```javascript
// src/routes/api/new-route.js

const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/auth');
const newService = require('../../services/new-service');

/**
 * @route   GET /api/new-route
 * @desc    Beispiel-Endpunkt
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await newService.exampleFunction();
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Fehler:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfehler'
    });
  }
});

module.exports = router;
```

Und registrieren Sie den Router in der Hauptanwendung:

```javascript
// src/app.js

const newRoutes = require('./routes/api/new-route');
app.use('/api/new-route', newRoutes);
```

## Fazit

StudiFlow AI Enterprise ist eine leistungsstarke Lösung für Content-Management und Social Media Automatisierung, die speziell für StudiBuch entwickelt wurde. Mit seiner modularen Architektur und umfangreichen Funktionen bietet es eine solide Grundlage für die Verwaltung und Automatisierung von Social-Media-Inhalten.

Die Integration mit Instagram, das automatische Scraping von Magazin-Artikeln, die Vorschau von Content und die automatische Generierung von Reels machen es zu einem wertvollen Werkzeug für die Content-Erstellung und -Verwaltung.

Durch die Behebung der bekannten Probleme und die Implementierung der empfohlenen Sicherheits- und Datenschutzmaßnahmen wird das System ein hohes Maß an Sicherheit und Datenschutz bieten.
