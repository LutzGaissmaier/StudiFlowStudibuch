/**
 * Testskript für StudiFlow AI Enterprise
 * 
 * Automatisierte Tests für die Kernfunktionen des Systems.
 * 
 * @version 1.0.0
 */

// Import der Module
const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Konfiguration
const config = {
  baseUrl: 'http://localhost:3000',
  apiBaseUrl: 'http://localhost:3000/api',
  username: process.env.TEST_USERNAME || 'admin',
  password: process.env.TEST_PASSWORD || 'password',
  timeout: 10000, // 10 Sekunden
  screenshotDir: path.join(__dirname, 'test-screenshots')
};

// Erstelle Screenshot-Verzeichnis, falls es nicht existiert
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

// Hilfsfunktionen
async function takeScreenshot(driver, name) {
  const screenshot = await driver.takeScreenshot();
  const filename = `${Date.now()}_${name}.png`;
  fs.writeFileSync(path.join(config.screenshotDir, filename), screenshot, 'base64');
  console.log(`Screenshot gespeichert: ${filename}`);
  return filename;
}

async function login(driver) {
  await driver.get(`${config.baseUrl}/login`);
  await driver.findElement(By.id('username')).sendKeys(config.username);
  await driver.findElement(By.id('password')).sendKeys(config.password);
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains('/dashboard'), config.timeout);
}

// Testfälle

// 1. Funktionale Tests

// 1.1 Instagram-API Integration
async function testInstagramAuthentication() {
  console.log('Test INST-001: Überprüfung der Instagram-Authentifizierung');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Navigation zu Instagram-Einstellungen
    await driver.findElement(By.css('a[href*="settings"]')).click();
    await driver.wait(until.elementLocated(By.css('a[href*="api-connections"]')), config.timeout);
    await driver.findElement(By.css('a[href*="api-connections"]')).click();
    
    // Überprüfen, ob Instagram-Verbindung angezeigt wird
    await driver.wait(until.elementLocated(By.css('.instagram-connection')), config.timeout);
    const connectionStatus = await driver.findElement(By.css('.instagram-connection .status')).getText();
    
    // Screenshot erstellen
    await takeScreenshot(driver, 'instagram_authentication');
    
    // Ergebnis überprüfen
    assert.strictEqual(connectionStatus.includes('Verbunden'), true, 'Instagram-Verbindung sollte angezeigt werden');
    
    console.log('Test INST-001: Bestanden');
    return true;
  } catch (error) {
    console.error('Test INST-001: Nicht bestanden', error);
    await takeScreenshot(driver, 'instagram_authentication_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 1.2 Instagram-Content Veröffentlichung
async function testInstagramContentPublishing() {
  console.log('Test INST-002: Überprüfung der Content-Veröffentlichung auf Instagram');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Navigation zum Content-Bereich
    await driver.findElement(By.css('a[href*="content"]')).click();
    await driver.wait(until.elementLocated(By.css('button.create-content')), config.timeout);
    await driver.findElement(By.css('button.create-content')).click();
    
    // Content erstellen
    await driver.wait(until.elementLocated(By.id('content-title')), config.timeout);
    await driver.findElement(By.id('content-title')).sendKeys('Testbeitrag');
    await driver.findElement(By.id('content-type')).click();
    await driver.findElement(By.css('option[value="instagram_post"]')).click();
    await driver.findElement(By.id('account-select')).click();
    await driver.findElement(By.css('option[value="1"]')).click(); // Erstes Konto auswählen
    
    // Bild hochladen
    const fileInput = await driver.findElement(By.css('input[type="file"]'));
    await fileInput.sendKeys(path.join(__dirname, 'test-assets', 'test-image.jpg'));
    
    // Caption eingeben
    await driver.findElement(By.id('caption')).sendKeys('Dies ist ein Testbeitrag #test');
    
    // Vorschau anzeigen
    await driver.findElement(By.css('button.preview')).click();
    await driver.wait(until.elementLocated(By.css('.preview-container')), config.timeout);
    
    // Screenshot der Vorschau erstellen
    await takeScreenshot(driver, 'instagram_content_preview');
    
    // Veröffentlichen
    await driver.findElement(By.css('button.publish')).click();
    
    // Bestätigung abwarten
    await driver.wait(until.elementLocated(By.css('.success-message')), config.timeout);
    const successMessage = await driver.findElement(By.css('.success-message')).getText();
    
    // Screenshot erstellen
    await takeScreenshot(driver, 'instagram_content_published');
    
    // Ergebnis überprüfen
    assert.strictEqual(successMessage.includes('erfolgreich'), true, 'Erfolgsmeldung sollte angezeigt werden');
    
    console.log('Test INST-002: Bestanden');
    return true;
  } catch (error) {
    console.error('Test INST-002: Nicht bestanden', error);
    await takeScreenshot(driver, 'instagram_content_publishing_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 1.3 Magazin-Scraping
async function testMagazineScraping() {
  console.log('Test MAG-001: Überprüfung des Magazin-Scrapings');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Navigation zum Magazin-Bereich
    await driver.findElement(By.css('a[href*="magazine"]')).click();
    await driver.wait(until.elementLocated(By.css('button.scrape')), config.timeout);
    
    // Scraping starten
    await driver.findElement(By.css('button.scrape')).click();
    
    // Bestätigung abwarten
    await driver.wait(until.elementLocated(By.css('.scraping-status')), config.timeout);
    
    // Warten auf Abschluss des Scrapings
    await driver.wait(until.elementTextContains(driver.findElement(By.css('.scraping-status')), 'abgeschlossen'), 30000);
    
    // Screenshot erstellen
    await takeScreenshot(driver, 'magazine_scraping_completed');
    
    // Überprüfen, ob Artikel angezeigt werden
    const articles = await driver.findElements(By.css('.magazine-item'));
    
    // Ergebnis überprüfen
    assert.strictEqual(articles.length > 0, true, 'Es sollten Artikel angezeigt werden');
    
    console.log('Test MAG-001: Bestanden');
    return true;
  } catch (error) {
    console.error('Test MAG-001: Nicht bestanden', error);
    await takeScreenshot(driver, 'magazine_scraping_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 1.4 Bildvorschau
async function testImagePreview() {
  console.log('Test PREV-001: Überprüfung der Bildvorschau für Instagram-Posts');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Navigation zum Content-Bereich
    await driver.findElement(By.css('a[href*="content"]')).click();
    await driver.wait(until.elementLocated(By.css('button.create-content')), config.timeout);
    await driver.findElement(By.css('button.create-content')).click();
    
    // Content erstellen
    await driver.wait(until.elementLocated(By.id('content-title')), config.timeout);
    await driver.findElement(By.id('content-title')).sendKeys('Vorschau-Test');
    await driver.findElement(By.id('content-type')).click();
    await driver.findElement(By.css('option[value="instagram_post"]')).click();
    await driver.findElement(By.id('account-select')).click();
    await driver.findElement(By.css('option[value="1"]')).click(); // Erstes Konto auswählen
    
    // Bild hochladen
    const fileInput = await driver.findElement(By.css('input[type="file"]'));
    await fileInput.sendKeys(path.join(__dirname, 'test-assets', 'test-image.jpg'));
    
    // Caption eingeben
    await driver.findElement(By.id('caption')).sendKeys('Dies ist ein Vorschau-Test #test');
    
    // Vorschau anzeigen
    await driver.findElement(By.css('button.preview')).click();
    await driver.wait(until.elementLocated(By.css('.preview-container')), config.timeout);
    
    // Screenshot der Vorschau erstellen
    await takeScreenshot(driver, 'image_preview');
    
    // Überprüfen, ob das Bild in der Vorschau angezeigt wird
    const previewImage = await driver.findElement(By.css('.preview-container img'));
    const isDisplayed = await previewImage.isDisplayed();
    
    // Ergebnis überprüfen
    assert.strictEqual(isDisplayed, true, 'Das Bild sollte in der Vorschau angezeigt werden');
    
    console.log('Test PREV-001: Bestanden');
    return true;
  } catch (error) {
    console.error('Test PREV-001: Nicht bestanden', error);
    await takeScreenshot(driver, 'image_preview_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 1.5 Reel-Generierung
async function testReelGeneration() {
  console.log('Test REEL-001: Überprüfung der Reel-Generierung mit Creatomate');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Navigation zum Content-Bereich
    await driver.findElement(By.css('a[href*="content"]')).click();
    await driver.wait(until.elementLocated(By.css('button.create-content')), config.timeout);
    await driver.findElement(By.css('button.create-content')).click();
    
    // Content erstellen
    await driver.wait(until.elementLocated(By.id('content-title')), config.timeout);
    await driver.findElement(By.id('content-title')).sendKeys('Reel-Test');
    await driver.findElement(By.id('content-type')).click();
    await driver.findElement(By.css('option[value="instagram_reel"]')).click();
    await driver.findElement(By.id('account-select')).click();
    await driver.findElement(By.css('option[value="1"]')).click(); // Erstes Konto auswählen
    
    // Template auswählen
    await driver.findElement(By.css('.template-selector')).click();
    await driver.findElement(By.css('.template-item[data-id="social_media_reel"]')).click();
    
    // Text eingeben
    await driver.findElement(By.id('reel-title')).sendKeys('Reel-Titel');
    await driver.findElement(By.id('reel-description')).sendKeys('Reel-Beschreibung');
    
    // Generierung starten
    await driver.findElement(By.css('button.generate')).click();
    
    // Warten auf Abschluss der Generierung
    await driver.wait(until.elementLocated(By.css('.generation-status')), config.timeout);
    await driver.wait(until.elementTextContains(driver.findElement(By.css('.generation-status')), 'abgeschlossen'), 60000);
    
    // Screenshot erstellen
    await takeScreenshot(driver, 'reel_generation_completed');
    
    // Überprüfen, ob die Vorschau angezeigt wird
    const previewVideo = await driver.findElement(By.css('.preview-container video'));
    const isDisplayed = await previewVideo.isDisplayed();
    
    // Ergebnis überprüfen
    assert.strictEqual(isDisplayed, true, 'Das generierte Reel sollte in der Vorschau angezeigt werden');
    
    console.log('Test REEL-001: Bestanden');
    return true;
  } catch (error) {
    console.error('Test REEL-001: Nicht bestanden', error);
    await takeScreenshot(driver, 'reel_generation_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 2. UI-Tests

// 2.1 Konsistenz der Benutzeroberfläche
async function testUIConsistency() {
  console.log('Test UI-001: Überprüfung der UI-Konsistenz über alle Bereiche');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Liste der zu überprüfenden Bereiche
    const areas = [
      { name: 'dashboard', selector: 'a[href*="dashboard"]' },
      { name: 'content', selector: 'a[href*="content"]' },
      { name: 'instagram', selector: 'a[href*="instagram"]' },
      { name: 'magazine', selector: 'a[href*="magazine"]' },
      { name: 'ai', selector: 'a[href*="ai"]' },
      { name: 'settings', selector: 'a[href*="settings"]' }
    ];
    
    // Durch alle Bereiche navigieren und Screenshots erstellen
    for (const area of areas) {
      await driver.findElement(By.css(area.selector)).click();
      await driver.wait(until.urlContains(area.name), config.timeout);
      await takeScreenshot(driver, `ui_consistency_${area.name}`);
    }
    
    // Ergebnis überprüfen (hier nur visuell, keine automatische Prüfung)
    console.log('Test UI-001: Bestanden (visuelle Überprüfung erforderlich)');
    return true;
  } catch (error) {
    console.error('Test UI-001: Nicht bestanden', error);
    await takeScreenshot(driver, 'ui_consistency_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 2.2 Responsive Design
async function testResponsiveDesign() {
  console.log('Test UI-002: Überprüfung des responsiven Designs');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Liste der zu testenden Bildschirmgrößen
    const screenSizes = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet_landscape' },
      { width: 768, height: 1024, name: 'tablet_portrait' },
      { width: 375, height: 812, name: 'mobile' }
    ];
    
    // Für jede Bildschirmgröße testen
    for (const size of screenSizes) {
      await driver.manage().window().setRect({ width: size.width, height: size.height });
      await driver.get(`${config.baseUrl}/dashboard`);
      await driver.wait(until.elementLocated(By.css('.dashboard-page')), config.timeout);
      await takeScreenshot(driver, `responsive_design_${size.name}`);
    }
    
    // Ergebnis überprüfen (hier nur visuell, keine automatische Prüfung)
    console.log('Test UI-002: Bestanden (visuelle Überprüfung erforderlich)');
    return true;
  } catch (error) {
    console.error('Test UI-002: Nicht bestanden', error);
    await takeScreenshot(driver, 'responsive_design_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 2.3 Navigation und Bedienbarkeit
async function testNavigation() {
  console.log('Test UI-003: Überprüfung der Navigation und Bedienbarkeit');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Typischer Workflow: Dashboard -> Content erstellen -> Vorschau -> Speichern
    
    // 1. Dashboard
    await driver.wait(until.elementLocated(By.css('.dashboard-page')), config.timeout);
    await takeScreenshot(driver, 'navigation_dashboard');
    
    // 2. Content-Bereich
    await driver.findElement(By.css('a[href*="content"]')).click();
    await driver.wait(until.elementLocated(By.css('button.create-content')), config.timeout);
    await takeScreenshot(driver, 'navigation_content');
    
    // 3. Content erstellen
    await driver.findElement(By.css('button.create-content')).click();
    await driver.wait(until.elementLocated(By.id('content-title')), config.timeout);
    await takeScreenshot(driver, 'navigation_create_content');
    
    // 4. Formular ausfüllen
    await driver.findElement(By.id('content-title')).sendKeys('Navigations-Test');
    await driver.findElement(By.id('content-type')).click();
    await driver.findElement(By.css('option[value="instagram_post"]')).click();
    await driver.findElement(By.id('account-select')).click();
    await driver.findElement(By.css('option[value="1"]')).click();
    
    // 5. Bild hochladen
    const fileInput = await driver.findElement(By.css('input[type="file"]'));
    await fileInput.sendKeys(path.join(__dirname, 'test-assets', 'test-image.jpg'));
    
    // 6. Caption eingeben
    await driver.findElement(By.id('caption')).sendKeys('Dies ist ein Navigations-Test #test');
    
    // 7. Vorschau anzeigen
    await driver.findElement(By.css('button.preview')).click();
    await driver.wait(until.elementLocated(By.css('.preview-container')), config.timeout);
    await takeScreenshot(driver, 'navigation_preview');
    
    // 8. Speichern
    await driver.findElement(By.css('button.save')).click();
    await driver.wait(until.elementLocated(By.css('.success-message')), config.timeout);
    await takeScreenshot(driver, 'navigation_saved');
    
    // 9. Zurück zur Content-Übersicht
    await driver.findElement(By.css('a[href*="content"]')).click();
    await driver.wait(until.elementLocated(By.css('.content-list')), config.timeout);
    await takeScreenshot(driver, 'navigation_content_list');
    
    // Ergebnis überprüfen
    const contentItems = await driver.findElements(By.css('.content-item'));
    assert.strictEqual(contentItems.length > 0, true, 'Es sollten Content-Items angezeigt werden');
    
    console.log('Test UI-003: Bestanden');
    return true;
  } catch (error) {
    console.error('Test UI-003: Nicht bestanden', error);
    await takeScreenshot(driver, 'navigation_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 3. Integrationstests

// 3.1 Integration aller Module
async function testModuleIntegration() {
  console.log('Test INT-001: Überprüfung der Integration aller Module');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // End-to-End-Workflow: Magazin-Artikel scrapen -> Content generieren -> Reel erstellen -> Veröffentlichen
    
    // 1. Magazin-Bereich
    await driver.findElement(By.css('a[href*="magazine"]')).click();
    await driver.wait(until.elementLocated(By.css('.magazine-list')), config.timeout);
    await takeScreenshot(driver, 'integration_magazine');
    
    // 2. Artikel auswählen
    const articles = await driver.findElements(By.css('.magazine-item'));
    assert.strictEqual(articles.length > 0, true, 'Es sollten Artikel angezeigt werden');
    
    // 3. Content erstellen
    await driver.findElement(By.css('.magazine-item:first-child .btn[data-action="create-content"]')).click();
    await driver.wait(until.elementLocated(By.css('.content-generation-options')), config.timeout);
    await takeScreenshot(driver, 'integration_content_generation');
    
    // 4. Reel als Content-Typ auswählen
    await driver.findElement(By.css('input[value="instagram_reel"]')).click();
    
    // 5. Generierung starten
    await driver.findElement(By.css('button.generate')).click();
    
    // 6. Warten auf Abschluss der Generierung
    await driver.wait(until.elementLocated(By.css('.generation-status')), config.timeout);
    await driver.wait(until.elementTextContains(driver.findElement(By.css('.generation-status')), 'abgeschlossen'), 60000);
    await takeScreenshot(driver, 'integration_generation_completed');
    
    // 7. Vorschau anzeigen
    await driver.findElement(By.css('button.preview')).click();
    await driver.wait(until.elementLocated(By.css('.preview-container')), config.timeout);
    await takeScreenshot(driver, 'integration_preview');
    
    // 8. Veröffentlichen
    await driver.findElement(By.css('button.publish')).click();
    
    // 9. Bestätigung abwarten
    await driver.wait(until.elementLocated(By.css('.success-message')), config.timeout);
    await takeScreenshot(driver, 'integration_published');
    
    // Ergebnis überprüfen
    const successMessage = await driver.findElement(By.css('.success-message')).getText();
    assert.strictEqual(successMessage.includes('erfolgreich'), true, 'Erfolgsmeldung sollte angezeigt werden');
    
    console.log('Test INT-001: Bestanden');
    return true;
  } catch (error) {
    console.error('Test INT-001: Nicht bestanden', error);
    await takeScreenshot(driver, 'integration_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 3.2 Ankaufsystem-Integration
async function testAnkaufIntegration() {
  console.log('Test INT-002: Überprüfung der Integration des Ankaufsystems');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Navigation zum Ankaufsystem
    await driver.findElement(By.css('a[href*="ankauf"]')).click();
    await driver.wait(until.elementLocated(By.css('.ankauf-dashboard')), config.timeout);
    await takeScreenshot(driver, 'ankauf_dashboard');
    
    // Wareneingang öffnen
    await driver.findElement(By.css('a[href*="wareneingang"]')).click();
    await driver.wait(until.elementLocated(By.css('.wareneingang-list')), config.timeout);
    await takeScreenshot(driver, 'ankauf_wareneingang');
    
    // Neuen Wareneingang erstellen
    await driver.findElement(By.css('button.create-wareneingang')).click();
    await driver.wait(until.elementLocated(By.css('.wareneingang-form')), config.timeout);
    await takeScreenshot(driver, 'ankauf_create_wareneingang');
    
    // Formular ausfüllen
    await driver.findElement(By.id('lieferant')).sendKeys('Test-Lieferant');
    await driver.findElement(By.id('kategorie')).click();
    await driver.findElement(By.css('option[value="buecher"]')).click();
    await driver.findElement(By.id('anzahl')).clear();
    await driver.findElement(By.id('anzahl')).sendKeys('10');
    await driver.findElement(By.id('beschreibung')).sendKeys('Test-Beschreibung');
    
    // Speichern
    await driver.findElement(By.css('button.save')).click();
    await driver.wait(until.elementLocated(By.css('.success-message')), config.timeout);
    await takeScreenshot(driver, 'ankauf_saved');
    
    // Zurück zur Wareneingang-Liste
    await driver.findElement(By.css('a[href*="wareneingang"]')).click();
    await driver.wait(until.elementLocated(By.css('.wareneingang-list')), config.timeout);
    await takeScreenshot(driver, 'ankauf_wareneingang_updated');
    
    // Ergebnis überprüfen
    const wareneingangItems = await driver.findElements(By.css('.wareneingang-item'));
    assert.strictEqual(wareneingangItems.length > 0, true, 'Es sollten Wareneingang-Items angezeigt werden');
    
    console.log('Test INT-002: Bestanden');
    return true;
  } catch (error) {
    console.error('Test INT-002: Nicht bestanden', error);
    await takeScreenshot(driver, 'ankauf_integration_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 4. Sicherheitstests

// 4.1 Authentifizierung und Autorisierung
async function testAuthentication() {
  console.log('Test SEC-001: Überprüfung der Authentifizierung und Autorisierung');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // 1. Zugriff ohne Anmeldung
    await driver.get(`${config.baseUrl}/dashboard`);
    await driver.wait(until.urlContains('/login'), config.timeout);
    await takeScreenshot(driver, 'security_redirect_to_login');
    
    // 2. Anmeldung mit falschen Zugangsdaten
    await driver.findElement(By.id('username')).sendKeys('falscherbenutzer');
    await driver.findElement(By.id('password')).sendKeys('falschespasswort');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Warten auf Fehlermeldung
    await driver.wait(until.elementLocated(By.css('.error-message')), config.timeout);
    await takeScreenshot(driver, 'security_login_error');
    
    // 3. Anmeldung mit korrekten Zugangsdaten
    await driver.findElement(By.id('username')).clear();
    await driver.findElement(By.id('password')).clear();
    await driver.findElement(By.id('username')).sendKeys(config.username);
    await driver.findElement(By.id('password')).sendKeys(config.password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/dashboard'), config.timeout);
    await takeScreenshot(driver, 'security_login_success');
    
    // 4. Überprüfen der Benutzerrolle
    const userRole = await driver.findElement(By.css('.user-role')).getText();
    assert.strictEqual(userRole, 'Administrator', 'Die Benutzerrolle sollte korrekt angezeigt werden');
    
    // 5. Abmelden
    await driver.findElement(By.css('.user-menu')).click();
    await driver.findElement(By.css('a[href*="logout"]')).click();
    await driver.wait(until.urlContains('/login'), config.timeout);
    await takeScreenshot(driver, 'security_logout');
    
    console.log('Test SEC-001: Bestanden');
    return true;
  } catch (error) {
    console.error('Test SEC-001: Nicht bestanden', error);
    await takeScreenshot(driver, 'security_authentication_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 4.2 API-Sicherheit
async function testAPISecurity() {
  console.log('Test SEC-002: Überprüfung der API-Sicherheit');
  
  try {
    // 1. Zugriff ohne Token
    try {
      await axios.get(`${config.apiBaseUrl}/users/me`);
      assert.fail('Der Zugriff ohne Token sollte fehlschlagen');
    } catch (error) {
      assert.strictEqual(error.response.status, 401, 'Der Statuscode sollte 401 sein');
    }
    
    // 2. Anmeldung, um Token zu erhalten
    const loginResponse = await axios.post(`${config.apiBaseUrl}/auth/login`, {
      username: config.username,
      password: config.password
    });
    
    assert.strictEqual(loginResponse.data.success, true, 'Die Anmeldung sollte erfolgreich sein');
    assert.strictEqual(typeof loginResponse.data.token, 'string', 'Ein Token sollte zurückgegeben werden');
    
    const token = loginResponse.data.token;
    
    // 3. Zugriff mit Token
    const userResponse = await axios.get(`${config.apiBaseUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    assert.strictEqual(userResponse.data.success, true, 'Der Zugriff mit Token sollte erfolgreich sein');
    assert.strictEqual(userResponse.data.user.username, config.username, 'Der Benutzername sollte korrekt sein');
    
    // 4. Zugriff mit ungültigem Token
    try {
      await axios.get(`${config.apiBaseUrl}/users/me`, {
        headers: {
          Authorization: 'Bearer ungueltigertoken'
        }
      });
      assert.fail('Der Zugriff mit ungültigem Token sollte fehlschlagen');
    } catch (error) {
      assert.strictEqual(error.response.status, 403, 'Der Statuscode sollte 403 sein');
    }
    
    console.log('Test SEC-002: Bestanden');
    return true;
  } catch (error) {
    console.error('Test SEC-002: Nicht bestanden', error);
    return false;
  }
}

// 5. Performance-Tests

// 5.1 Ladezeiten
async function testLoadTimes() {
  console.log('Test PERF-001: Überprüfung der Ladezeiten');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    const loginStart = Date.now();
    await login(driver);
    const loginTime = Date.now() - loginStart;
    console.log(`Login-Zeit: ${loginTime}ms`);
    
    // Liste der zu testenden Seiten
    const pages = [
      { name: 'dashboard', url: '/dashboard' },
      { name: 'content', url: '/content' },
      { name: 'instagram', url: '/instagram' },
      { name: 'magazine', url: '/magazine' },
      { name: 'settings', url: '/settings' }
    ];
    
    const loadTimes = {};
    
    // Für jede Seite die Ladezeit messen
    for (const page of pages) {
      const start = Date.now();
      await driver.get(`${config.baseUrl}${page.url}`);
      await driver.wait(until.elementLocated(By.css(`.${page.name}-page`)), config.timeout);
      const loadTime = Date.now() - start;
      loadTimes[page.name] = loadTime;
      console.log(`Ladezeit für ${page.name}: ${loadTime}ms`);
      
      // Screenshot erstellen
      await takeScreenshot(driver, `load_time_${page.name}`);
      
      // Ergebnis überprüfen
      assert.strictEqual(loadTime < 3000, true, `Die Ladezeit für ${page.name} sollte unter 3 Sekunden liegen`);
    }
    
    console.log('Test PERF-001: Bestanden');
    return true;
  } catch (error) {
    console.error('Test PERF-001: Nicht bestanden', error);
    await takeScreenshot(driver, 'load_times_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// 5.2 Ressourcenverbrauch
async function testResourceUsage() {
  console.log('Test PERF-002: Überprüfung des Ressourcenverbrauchs');
  
  const driver = await new Builder().forBrowser('chrome').build();
  try {
    // Login
    await login(driver);
    
    // Liste der zu testenden Seiten
    const pages = [
      { name: 'dashboard', url: '/dashboard' },
      { name: 'content', url: '/content' },
      { name: 'instagram', url: '/instagram' },
      { name: 'magazine', url: '/magazine' },
      { name: 'settings', url: '/settings' }
    ];
    
    // Für jede Seite den Ressourcenverbrauch messen
    for (const page of pages) {
      await driver.get(`${config.baseUrl}${page.url}`);
      await driver.wait(until.elementLocated(By.css(`.${page.name}-page`)), config.timeout);
      
      // Ressourcenverbrauch messen
      const performanceEntries = await driver.executeScript('return window.performance.getEntries()');
      const resources = performanceEntries.filter(entry => entry.entryType === 'resource');
      
      // Anzahl der Ressourcen
      const resourceCount = resources.length;
      console.log(`Anzahl der Ressourcen für ${page.name}: ${resourceCount}`);
      
      // Gesamtgröße der Ressourcen
      const totalSize = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
      const totalSizeInKB = Math.round(totalSize / 1024);
      console.log(`Gesamtgröße der Ressourcen für ${page.name}: ${totalSizeInKB}KB`);
      
      // Screenshot erstellen
      await takeScreenshot(driver, `resource_usage_${page.name}`);
      
      // Ergebnis überprüfen
      assert.strictEqual(totalSizeInKB < 5000, true, `Die Gesamtgröße der Ressourcen für ${page.name} sollte unter 5MB liegen`);
    }
    
    console.log('Test PERF-002: Bestanden');
    return true;
  } catch (error) {
    console.error('Test PERF-002: Nicht bestanden', error);
    await takeScreenshot(driver, 'resource_usage_error');
    return false;
  } finally {
    await driver.quit();
  }
}

// Hauptfunktion zum Ausführen aller Tests
async function runAllTests() {
  console.log('Starte alle Tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: {}
  };
  
  // Funktionale Tests
  results.tests.INST001 = await testInstagramAuthentication();
  results.tests.INST002 = await testInstagramContentPublishing();
  results.tests.MAG001 = await testMagazineScraping();
  results.tests.PREV001 = await testImagePreview();
  results.tests.REEL001 = await testReelGeneration();
  
  // UI-Tests
  results.tests.UI001 = await testUIConsistency();
  results.tests.UI002 = await testResponsiveDesign();
  results.tests.UI003 = await testNavigation();
  
  // Integrationstests
  results.tests.INT001 = await testModuleIntegration();
  results.tests.INT002 = await testAnkaufIntegration();
  
  // Sicherheitstests
  results.tests.SEC001 = await testAuthentication();
  results.tests.SEC002 = await testAPISecurity();
  
  // Performance-Tests
  results.tests.PERF001 = await testLoadTimes();
  results.tests.PERF002 = await testResourceUsage();
  
  // Ergebnisse zusammenfassen
  for (const [test, result] of Object.entries(results.tests)) {
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  console.log('\nTestergebnisse:');
  console.log(`Bestanden: ${results.passed}`);
  console.log(`Nicht bestanden: ${results.failed}`);
  console.log(`Gesamtergebnis: ${results.failed === 0 ? 'BESTANDEN' : 'NICHT BESTANDEN'}`);
  
  // Detaillierte Ergebnisse
  console.log('\nDetaillierte Ergebnisse:');
  for (const [test, result] of Object.entries(results.tests)) {
    console.log(`${test}: ${result ? 'Bestanden' : 'Nicht bestanden'}`);
  }
  
  // Ergebnisse in Datei speichern
  const resultJson = JSON.stringify(results, null, 2);
  fs.writeFileSync(path.join(__dirname, 'test-results.json'), resultJson);
  console.log('\nTestergebnisse wurden in test-results.json gespeichert.');
  
  return results;
}

// Ausführen der Tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fehler beim Ausführen der Tests:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testInstagramAuthentication,
  testInstagramContentPublishing,
  testMagazineScraping,
  testImagePreview,
  testReelGeneration,
  testUIConsistency,
  testResponsiveDesign,
  testNavigation,
  testModuleIntegration,
  testAnkaufIntegration,
  testAuthentication,
  testAPISecurity,
  testLoadTimes,
  testResourceUsage
};
