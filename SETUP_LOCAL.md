# StudiFlow AI - Lokale Entwicklungsumgebung

## 🚀 Schnellstart

Das StudiFlow AI System ist so konfiguriert, dass es **sofort lokal läuft** - auch ohne externe Services wie MongoDB, Redis oder API-Keys.

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Umgebungskonfiguration
```bash
# .env Datei aus Template erstellen
cp .env.example .env

# Optional: Für lokalen Betrieb sind keine Änderungen nötig
# Das System läuft sofort mit den Standard-Einstellungen
```

### 3. System starten
```bash
# Backend starten
npm run dev
# oder
npx ts-node src/index.ts

# In separatem Terminal: Frontend Development (optional)
npm run build  # Für Produktions-Build
```

### 4. System testen
- **Enterprise Dashboard**: http://localhost:3000/
- **Marketing Dashboard**: http://localhost:3000/marketing-dashboard.html
- **API Health Check**: http://localhost:3000/health
- **API Status**: http://localhost:3000/api/status

## 🔧 Erweiterte Konfiguration

### MongoDB (Optional)
```bash
# MongoDB lokal installieren (Ubuntu/Debian)
sudo apt update
sudo apt install -y mongodb

# MongoDB starten
sudo systemctl start mongodb
sudo systemctl enable mongodb

# In .env konfigurieren:
MONGODB_URI=mongodb://localhost:27017/studiflow-ai
```

### Redis (Optional)
```bash
# Redis lokal installieren
sudo apt install -y redis-server

# Redis starten
sudo systemctl start redis-server
sudo systemctl enable redis-server

# In .env konfigurieren:
REDIS_URL=redis://localhost:6379
```

### AI Services (Optional)
1. **Gemini API Keys** von Google AI Studio holen
2. In `.env` eintragen:
```env
GEMINI_API_KEY_1=your-gemini-api-key-here
```

### Instagram Integration (Optional)
1. **Instagram Developer Account** erstellen
2. **App registrieren** bei Meta for Developers
3. Credentials in `.env` eintragen

## 📊 System-Features

### ✅ Funktioniert ohne externe Dependencies:
- ✅ Frontend Dashboards (Enterprise + Marketing)
- ✅ API Endpunkte mit Mock-Daten
- ✅ StudiBuch Magazine Scraping
- ✅ Content Pipeline Management
- ✅ System Health Monitoring
- ✅ Graceful Degradation bei fehlenden Services

### 🔌 Erweitert mit externen Services:
- 🤖 AI Content Generation (mit Gemini API)
- 📱 Instagram Automation (mit Instagram API)
- 💾 Persistente Datenspeicherung (mit MongoDB)
- ⚡ Caching & Sessions (mit Redis)

## 🛠️ Entwicklung

### Lint & Code Quality
```bash
npm run lint          # ESLint prüfen
npm run lint:fix       # ESLint Fehler automatisch beheben
```

### Debugging
```bash
# Debug-Modus mit erweiterten Logs
LOG_LEVEL=debug npm run dev

# Nur Backend ohne Frontend
npx ts-node src/index.ts
```

### Testing
```bash
# API Endpoints testen
curl http://localhost:3000/health
curl http://localhost:3000/api/status
curl http://localhost:3000/api/ai/status
curl http://localhost:3000/api/instagram/status
```

## 🔍 Troubleshooting

### Port bereits belegt
```bash
# Anderen Port verwenden
PORT=3001 npm run dev
```

### Permissions Fehler
```bash
# Node.js Berechtigungen prüfen
sudo chown -R $USER:$USER ~/.npm
```

### Service Fehler
Das System ist so designed, dass es auch bei Service-Fehlern weiterläuft:
- ❌ MongoDB nicht verfügbar → System läuft mit In-Memory Storage
- ❌ Redis nicht verfügbar → System läuft ohne Caching
- ❌ API Keys fehlen → System läuft mit Mock-Daten

## 📈 Produktionsbereitschaft

Für Produktionseinsatz zusätzlich konfigurieren:
1. ✅ Echte Datenbank-Verbindung (MongoDB)
2. ✅ Redis für Performance
3. ✅ AI API Keys für Content-Generation
4. ✅ Instagram API Credentials
5. ✅ Sichere JWT/Session Secrets
6. ✅ HTTPS/SSL Zertifikate
7. ✅ Process Manager (PM2)
8. ✅ Reverse Proxy (Nginx)

Das System ist **jetzt schon voll funktionsfähig** für lokale Entwicklung und Tests! 🎉
