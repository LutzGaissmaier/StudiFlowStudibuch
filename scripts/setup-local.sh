#!/bin/bash


echo "🚀 StudiFlow AI - Lokales Setup wird gestartet..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installieren Sie Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "✅ Node.js Version: $NODE_VERSION"

if ! command -v npm &> /dev/null; then
    echo "❌ npm ist nicht installiert"
    exit 1
fi

echo "✅ npm Version: $(npm -v)"

echo "📦 Installiere Dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install fehlgeschlagen"
    exit 1
fi

if [ ! -f .env ]; then
    echo "📝 Erstelle .env Datei aus Template..."
    cp .env.example .env
    echo "✅ .env Datei erstellt"
else
    echo "✅ .env Datei bereits vorhanden"
fi

mkdir -p logs
echo "✅ Logs Verzeichnis erstellt"

echo "🔍 Prüfe TypeScript Compilation..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo "⚠️ TypeScript Compilation Warnungen - System läuft trotzdem"
fi

echo "🔍 Führe Code Quality Check durch..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️ Lint Warnungen gefunden - System läuft trotzdem"
fi

echo ""
echo "🎉 ====================================="
echo "🎉 StudiFlow AI Setup abgeschlossen!"
echo "🎉 ====================================="
echo ""
echo "📋 Nächste Schritte:"
echo "1. Backend starten:     npm run dev"
echo "2. Enterprise Dashboard: http://localhost:3000/"
echo "3. Marketing Dashboard:  http://localhost:3000/marketing-dashboard.html"
echo "4. API Health Check:     http://localhost:3000/health"
echo ""
echo "📖 Weitere Informationen: SETUP_LOCAL.md"
echo ""
