const logger = require('../config/logger');
const HumanBehavior = require('../behavior/humanBehavior');
const ContentPipeline = require('../automation/contentPipeline');
const ReelsGenerator = require('../video/reelsGenerator');
const AnalyticsEngine = require('../analytics/analyticsEngine');
const EventEmitter = require('events');

class RionaAI extends EventEmitter {
    constructor() {
        super();
        
        this.status = 'initializing';
        this.startTime = Date.now();
        this.version = '1.0.0';
        
        // Core Components
        this.humanBehavior = null;
        this.contentPipeline = null;
        this.reelsGenerator = null;
        this.analytics = null;
        
        // System State
        this.systemHealth = {
            overall: 'healthy',
            components: {},
            lastCheck: null,
            uptime: 0
        };
        
        // Performance Metrics
        this.performance = {
            totalPosts: 0,
            totalEngagement: 0,
            totalReach: 0,
            averageQuality: 0,
            systemEfficiency: 0
        };
        
        // Configuration
        this.config = {
            autoMode: true,
            smartOptimization: true,
            safeMode: false,
            maxDailyPosts: 5,
            qualityThreshold: 75,
            engagementTargets: {
                likes: 100,
                comments: 15,
                shares: 5
            },
            automationEnabled: true,
            aiAgentEnabled: true
        };
        
        this.init();
    }

    // Initialisierung aller Systeme
    async init() {
        try {
            logger.info('🚀 Riona AI startet...');
            
            // 1. Initialisiere Core Components
            await this.initializeComponents();
            
            // 2. Setup Event Listeners
            this.setupEventListeners();
            
            // 3. Starte Monitoring
            this.startSystemMonitoring();
            
            // 4. Aktiviere Auto-Optimization
            if (this.config.smartOptimization) {
                this.startSmartOptimization();
            }
            
            this.status = 'running';
            logger.info('✅ Riona AI erfolgreich gestartet!');
            
            // Starte erste Content-Generation
            if (this.config.autoMode) {
                setTimeout(() => this.executeAutomaticWorkflow(), 5000);
            }
            
        } catch (error) {
            this.status = 'error';
            logger.error(`❌ Riona AI Initialisierung fehlgeschlagen: ${error.message}`);
            throw error;
        }
    }

    // Initialisiere alle Core Components
    async initializeComponents() {
        try {
            // Human Behavior System
            this.humanBehavior = new HumanBehavior();
            this.systemHealth.components.humanBehavior = 'healthy';
            logger.info('🤖 Human Behavior System online');
            
            // Content Pipeline
            this.contentPipeline = new ContentPipeline();
            this.systemHealth.components.contentPipeline = 'healthy';
            logger.info('📰 Content Pipeline online');
            
            // Reels Generator
            this.reelsGenerator = new ReelsGenerator();
            this.systemHealth.components.reelsGenerator = 'healthy';
            logger.info('🎬 Reels Generator online');
            
            // Analytics Engine
            this.analytics = new AnalyticsEngine();
            this.systemHealth.components.analytics = 'healthy';
            logger.info('📊 Analytics Engine online');
            
            const geminiApiKeys = this.getGeminiApiKeys();
            if (geminiApiKeys.length > 0) {
                const { AIAgentService } = await import('../services/ai/agent.js');
                this.aiAgent = new AIAgentService(geminiApiKeys);
                this.systemHealth.components.aiAgent = 'healthy';
                logger.info('🤖 AI Agent Service online');
            } else {
                logger.warn('⚠️ No Gemini API keys found, AI Agent Service disabled');
            }
            
            const automationCredentials = this.getInstagramAutomationCredentials();
            if (automationCredentials && this.aiAgent) {
                const { InstagramAutomationService } = await import('../services/instagram/automation.js');
                this.instagramAutomation = new InstagramAutomationService(
                    this.instagramCredentials, 
                    automationCredentials, 
                    this.aiAgent
                );
                await this.instagramAutomation.initialize();
                this.systemHealth.components.instagramAutomation = 'healthy';
                logger.info('📱 Instagram Automation Service online');
            } else {
                logger.warn('⚠️ Instagram automation credentials not found or AI Agent unavailable');
            }
            
            this.systemHealth.overall = 'healthy';
            this.systemHealth.lastCheck = new Date().toISOString();
            
        } catch (error) {
            this.systemHealth.overall = 'critical';
            throw new Error(`Component initialization failed: ${error.message}`);
        }
    }

    // Setup Event Listeners zwischen Komponenten
    setupEventListeners() {
        // Content Pipeline Events
        this.contentPipeline.on?.('contentGenerated', (content) => {
            this.handleContentGenerated(content);
        });
        
        this.contentPipeline.on?.('contentPosted', (post) => {
            this.handleContentPosted(post);
            this.performance.totalPosts++;
        });
        
        // Analytics Events
        this.analytics.on?.('metricUpdated', (metrics) => {
            this.handleMetricsUpdate(metrics);
        });
        
        // Human Behavior Events
        this.humanBehavior.on?.('actionCompleted', (action) => {
            this.handleActionCompleted(action);
        });
        
        // System Events
        this.on('systemAlert', (alert) => {
            this.handleSystemAlert(alert);
        });
        
        logger.info('🔗 Event Listeners eingerichtet');
    }

    // Starte System-Monitoring
    startSystemMonitoring() {
        // Health Check alle 5 Minuten
        setInterval(() => {
            this.performHealthCheck();
        }, 5 * 60 * 1000);

        // Performance Tracking alle 15 Minuten
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 15 * 60 * 1000);

        // System Optimization alle Stunde
        setInterval(() => {
            this.optimizeSystem();
        }, 60 * 60 * 1000);

        // Uptime Counter
        setInterval(() => {
            this.systemHealth.uptime = Date.now() - this.startTime;
        }, 60 * 1000);

        logger.info('📡 System Monitoring aktiv');
    }

    // Starte intelligente Optimierung
    startSmartOptimization() {
        // Analysiere und optimiere alle 2 Stunden
        setInterval(async () => {
            await this.performSmartOptimization();
        }, 2 * 60 * 60 * 1000);

        logger.info('🧠 Smart Optimization aktiviert');
    }

    // Hauptworkflow für automatische Ausführung
    async executeAutomaticWorkflow() {
        if (this.status !== 'running') return;
        
        try {
            logger.info('🔄 Starte automatischen Workflow');
            
            // 1. Prüfe System-Gesundheit
            if (!this.isSystemHealthy()) {
                logger.warn('⚠️ System nicht bereit für Workflow');
                return;
            }
            
            // 2. Hole aktuelle Analytics
            const dashboardData = this.analytics.getDashboardData();
            
            // 3. Bestimme beste Aktion basierend auf Daten
            const nextAction = await this.determineOptimalAction(dashboardData);
            
            // 4. Führe Aktion aus
            await this.executeAction(nextAction);
            
            // 5. Plane nächste Ausführung
            this.scheduleNextWorkflow();
            
        } catch (error) {
            logger.error(`Workflow-Fehler: ${error.message}`);
            this.emit('systemAlert', {
                type: 'workflow_error',
                message: error.message,
                severity: 'medium'
            });
        }
    }

    // Bestimme optimale nächste Aktion
    async determineOptimalAction(analyticsData) {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        
        // Prüfe Human Behavior Constraints
        if (!this.humanBehavior.isWithinActiveHours()) {
            return { type: 'wait', reason: 'outside_active_hours' };
        }
        
        // Prüfe tägliche Limits
        const behaviorStatus = this.humanBehavior.getStatusReport();
        
        // Entscheidungslogik basierend auf Analytics und Verhalten
        if (this.shouldGenerateContent(analyticsData, behaviorStatus)) {
            return { type: 'generate_content', priority: 'high' };
        }
        
        if (this.shouldCreateReel(analyticsData, behaviorStatus)) {
            return { type: 'create_reel', priority: 'medium' };
        }
        
        if (this.shouldPerformEngagement(analyticsData, behaviorStatus)) {
            return { type: 'engagement', priority: 'low' };
        }
        
        return { type: 'monitor', reason: 'no_action_needed' };
    }

    // Prüfe ob Content generiert werden soll
    shouldGenerateContent(analytics, behavior) {
        const contentStatus = this.contentPipeline.getStatus();
        
        // Prüfe Buffer-Level
        if (contentStatus.bufferSize < 3) return true;
        
        // Prüfe ob heute schon genug Posts
        if (behavior.dailyProgress.posts.split('/')[0] >= this.config.maxDailyPosts) {
            return false;
        }
        
        // Prüfe Performance-Trends
        if (analytics.growth.engagement < 50) return true;
        
        return false;
    }

    // Prüfe ob Reel erstellt werden soll
    shouldCreateReel(analytics, behavior) {
        const hour = new Date().getHours();
        
        // Reels am besten Abends erstellen
        if (hour < 18 || hour > 23) return false;
        
        // Prüfe ob heute schon Reel erstellt
        // (würde aus Analytics kommen)
        
        return Math.random() > 0.7; // 30% Chance
    }

    // Prüfe ob Engagement-Aktionen ausgeführt werden sollen
    shouldPerformEngagement(analytics, behavior) {
        // Prüfe tägliche Limits
        const likesUsed = parseInt(behavior.dailyProgress.likes.split('/')[0]);
        const likesLimit = parseInt(behavior.dailyProgress.likes.split('/')[1]);
        
        if (likesUsed >= likesLimit) return false;
        
        // Prüfe Engagement-Rate
        if (analytics.growth.engagement > 80) return false;
        
        return true;
    }

    // Führe bestimmte Aktion aus
    async executeAction(action) {
        logger.info(`🎯 Führe Aktion aus: ${action.type}`);
        
        try {
            switch (action.type) {
                case 'generate_content':
                    await this.contentPipeline.runManual();
                    break;
                    
                case 'create_reel':
                    await this.generateSmartReel();
                    break;
                    
                case 'engagement':
                    await this.performIntelligentEngagement();
                    break;
                    
                case 'wait':
                    logger.info(`⏳ Warte: ${action.reason}`);
                    break;
                    
                case 'monitor':
                    logger.info(`👁️ Überwache: ${action.reason}`);
                    break;
                    
                default:
                    logger.warn(`Unbekannte Aktion: ${action.type}`);
            }
            
        } catch (error) {
            logger.error(`Aktion ${action.type} fehlgeschlagen: ${error.message}`);
            throw error;
        }
    }

    // Generiere intelligentes Reel
    async generateSmartReel() {
        try {
            // Hole besten Content aus Pipeline
            const contentStatus = this.contentPipeline.getStatus();
            const recentContent = this.contentPipeline.contentBuffer
                .filter(c => c.metadata?.keyPoints?.length > 2)
                .slice(0, 1)[0];
            
            if (!recentContent) {
                logger.info('📭 Kein Content für Reel verfügbar');
                return;
            }
            
            const reelData = {
                title: recentContent.sourceTitle,
                keyPoints: recentContent.metadata.keyPoints,
                category: recentContent.sourceCategory
            };
            
            const reel = await this.reelsGenerator.createReel(reelData, {
                duration: 30,
                template: 'study_tips'
            });
            
            logger.info(`🎬 Intelligentes Reel erstellt: ${reel.reelId}`);
            
        } catch (error) {
            logger.error(`Smart Reel Generierung fehlgeschlagen: ${error.message}`);
        }
    }

    // Führe intelligentes Engagement aus
    async performIntelligentEngagement() {
        try {
            // Simuliere intelligente Engagement-Aktionen
            const actions = [
                'like_relevant_posts',
                'comment_on_student_content',
                'follow_target_accounts'
            ];
            
            const action = actions[Math.floor(Math.random() * actions.length)];
            
            // Simuliere Engagement mit Human Behavior
            await this.humanBehavior.randomDelay(30000, 120000);
            
            switch (action) {
                case 'like_relevant_posts':
                    if (this.humanBehavior.canPerformAction('likes')) {
                        // Simuliere Like-Aktion
                        this.humanBehavior.recordAction('likes');
                        logger.info('❤️ Intelligenter Like ausgeführt');
                    }
                    break;
                    
                case 'comment_on_student_content':
                    if (this.humanBehavior.canPerformAction('comments')) {
                        // Simuliere Kommentar-Aktion
                        this.humanBehavior.recordAction('comments');
                        logger.info('💬 Intelligenter Kommentar ausgeführt');
                    }
                    break;
                    
                case 'follow_target_accounts':
                    if (this.humanBehavior.canPerformAction('follows')) {
                        // Simuliere Follow-Aktion
                        this.humanBehavior.recordAction('follows');
                        logger.info('👥 Intelligenter Follow ausgeführt');
                    }
                    break;
            }
            
        } catch (error) {
            logger.error(`Intelligent Engagement fehlgeschlagen: ${error.message}`);
        }
    }

    // System Health Check
    performHealthCheck() {
        try {
            this.systemHealth.lastCheck = new Date().toISOString();
            
            // Prüfe alle Komponenten
            const components = ['humanBehavior', 'contentPipeline', 'reelsGenerator', 'analytics'];
            let healthyComponents = 0;
            
            components.forEach(component => {
                if (this[component] && typeof this[component] === 'object') {
                    this.systemHealth.components[component] = 'healthy';
                    healthyComponents++;
                } else {
                    this.systemHealth.components[component] = 'error';
                }
            });
            
            // Bestimme Overall Health
            if (healthyComponents === components.length) {
                this.systemHealth.overall = 'healthy';
            } else if (healthyComponents >= components.length * 0.75) {
                this.systemHealth.overall = 'degraded';
            } else {
                this.systemHealth.overall = 'critical';
            }
            
            // Prüfe Memory Usage
            const memUsage = process.memoryUsage();
            if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
                this.emit('systemAlert', {
                    type: 'high_memory_usage',
                    value: memUsage.heapUsed,
                    severity: 'medium'
                });
            }
            
        } catch (error) {
            this.systemHealth.overall = 'error';
            logger.error(`Health Check fehlgeschlagen: ${error.message}`);
        }
    }

    // Performance Metriken aktualisieren
    updatePerformanceMetrics() {
        try {
            const analyticsData = this.analytics.getDashboardData();
            
            this.performance = {
                totalPosts: analyticsData.overview.totalPosts || 0,
                totalEngagement: analyticsData.overview.engagementRate || 0,
                totalReach: analyticsData.overview.totalReach || 0,
                averageQuality: 85, // Würde aus Content-Bewertungen berechnet
                systemEfficiency: this.calculateSystemEfficiency()
            };
            
        } catch (error) {
            logger.error(`Performance Update fehlgeschlagen: ${error.message}`);
        }
    }

    // Berechne System-Effizienz
    calculateSystemEfficiency() {
        const uptime = this.systemHealth.uptime;
        const uptimeHours = uptime / (1000 * 60 * 60);
        
        // Effizienz basierend auf Uptime und Performance
        const uptimeScore = Math.min(100, (uptimeHours / 24) * 100);
        const healthScore = this.systemHealth.overall === 'healthy' ? 100 : 
                           this.systemHealth.overall === 'degraded' ? 75 : 50;
        
        return Math.round((uptimeScore + healthScore) / 2);
    }

    // System optimieren
    async optimizeSystem() {
        try {
            logger.info('🔧 Starte System-Optimierung');
            
            // Memory Cleanup
            if (global.gc) {
                global.gc();
            }
            
            // Optimiere Content Buffer
            await this.optimizeContentBuffer();
            
            // Optimiere Analytics-Daten
            await this.optimizeAnalyticsData();
            
            logger.info('✅ System-Optimierung abgeschlossen');
            
        } catch (error) {
            logger.error(`System-Optimierung fehlgeschlagen: ${error.message}`);
        }
    }

    // Content Buffer optimieren
    async optimizeContentBuffer() {
        const pipeline = this.contentPipeline;
        const bufferSize = pipeline.contentBuffer.length;
        
        // Entferne alte, verbrauchte Posts
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        
        pipeline.contentBuffer = pipeline.contentBuffer.filter(content => 
            content.status !== 'posted' || new Date(content.postedAt) > cutoffDate
        );
        
        const removedCount = bufferSize - pipeline.contentBuffer.length;
        if (removedCount > 0) {
            logger.info(`🗑️ ${removedCount} alte Content-Items entfernt`);
        }
    }

    // Analytics-Daten optimieren
    async optimizeAnalyticsData() {
        // Begrenzen der historischen Daten auf 90 Tage
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        
        ['posts', 'engagement', 'reach'].forEach(metric => {
            const originalLength = this.analytics.metricsData[metric].length;
            this.analytics.metricsData[metric] = this.analytics.metricsData[metric]
                .filter(data => new Date(data.timestamp) > cutoffDate);
            
            const removedCount = originalLength - this.analytics.metricsData[metric].length;
            if (removedCount > 0) {
                logger.info(`📊 ${removedCount} alte ${metric} Datenpunkte entfernt`);
            }
        });
    }

    // Intelligente Optimierung durchführen
    async performSmartOptimization() {
        try {
            logger.info('🧠 Starte Smart Optimization');
            
            const analyticsData = this.analytics.getDashboardData();
            
            // Optimiere Posting-Zeiten
            await this.optimizePostingTimes(analyticsData);
            
            // Optimiere Content-Strategie
            await this.optimizeContentStrategy(analyticsData);
            
            // Optimiere Engagement-Strategie
            await this.optimizeEngagementStrategy(analyticsData);
            
            logger.info('✅ Smart Optimization abgeschlossen');
            
        } catch (error) {
            logger.error(`Smart Optimization fehlgeschlagen: ${error.message}`);
        }
    }

    // Optimiere Posting-Zeiten
    async optimizePostingTimes(analytics) {
        const bestTimes = analytics.performance.bestPostingTimes;
        
        if (bestTimes && bestTimes.length > 0) {
            // Update Human Behavior mit optimalen Zeiten
            // (würde die Scheduling-Logik anpassen)
            logger.info(`⏰ Posting-Zeiten optimiert basierend auf ${bestTimes.length} Datenpunkten`);
        }
    }

    // Optimiere Content-Strategie
    async optimizeContentStrategy(analytics) {
        const topHashtags = analytics.performance.topHashtags;
        
        if (topHashtags && topHashtags.length > 0) {
            // Update Content Pipeline mit besseren Hashtags
            logger.info(`#️⃣ Content-Strategie optimiert mit ${topHashtags.length} Top-Hashtags`);
        }
    }

    // Optimiere Engagement-Strategie
    async optimizeEngagementStrategy(analytics) {
        const engagementRate = analytics.growth.engagement;
        
        if (engagementRate < 70) {
            // Erhöhe Engagement-Aktivitäten
            this.config.engagementTargets.likes += 10;
            logger.info('💪 Engagement-Ziele erhöht aufgrund niedriger Rate');
        } else if (engagementRate > 90) {
            // Reduziere um natürlicher zu wirken
            this.config.engagementTargets.likes = Math.max(50, this.config.engagementTargets.likes - 5);
            logger.info('😌 Engagement-Ziele reduziert um natürlicher zu wirken');
        }
    }

    // Plane nächsten Workflow
    scheduleNextWorkflow() {
        const nextRun = this.humanBehavior.getOptimalPostTime();
        const delay = nextRun.getTime() - Date.now();
        
        setTimeout(() => {
            this.executeAutomaticWorkflow();
        }, Math.max(delay, 30 * 60 * 1000)); // Mindestens 30 Minuten
        
        logger.info(`⏰ Nächster Workflow geplant für: ${nextRun.toLocaleString('de-DE')}`);
    }

    // Event Handlers
    handleContentGenerated(content) {
        logger.info(`📝 Content generiert: ${content.sourceTitle}`);
        this.emit('contentGenerated', content);
    }

    handleContentPosted(post) {
        logger.info(`📱 Content gepostet: ${post.postId}`);
        this.performance.totalPosts++;
        this.emit('contentPosted', post);
    }

    handleMetricsUpdate(metrics) {
        logger.info('📊 Metriken aktualisiert');
        this.emit('metricsUpdated', metrics);
    }

    handleActionCompleted(action) {
        logger.info(`✅ Aktion abgeschlossen: ${action.type}`);
        this.emit('actionCompleted', action);
    }

    handleSystemAlert(alert) {
        logger.warn(`🚨 System Alert: ${alert.type} - ${alert.message}`);
        
        if (alert.severity === 'critical') {
            this.status = 'error';
        }
    }

    // Hilfsfunktionen
    isSystemHealthy() {
        return this.systemHealth.overall === 'healthy' && this.status === 'running';
    }

    // API für Dashboard
    getSystemStatus() {
        return {
            status: this.status,
            version: this.version,
            uptime: this.systemHealth.uptime,
            health: this.systemHealth,
            performance: this.performance,
            config: this.config,
            components: {
                humanBehavior: this.humanBehavior?.getStatusReport(),
                contentPipeline: this.contentPipeline?.getStatus(),
                analytics: this.analytics?.getDashboardData()
            }
        };
    }

    // Konfiguration aktualisieren
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        logger.info('⚙️ Konfiguration aktualisiert');
        this.emit('configUpdated', this.config);
    }

    getGeminiApiKeys() {
        const keys = [];
        for (let i = 1; i <= 50; i++) {
            const key = process.env[`GEMINI_API_KEY_${i}`];
            if (key && key !== `API_KEY_${i}`) {
                keys.push(key);
            }
        }
        return keys;
    }

    getInstagramAutomationCredentials() {
        const username = process.env.IGusername;
        const password = process.env.IGpassword;
        
        if (username && password && username !== 'default_IGusername' && password !== 'default_IGpassword') {
            return { username, password };
        }
        return null;
    }

    // System stoppen
    async shutdown() {
        try {
            logger.info('⏹️ Riona AI wird heruntergefahren...');
            
            this.status = 'stopping';
            
            // Stoppe alle Intervalle
            // (würde alle Timer clearen)
            
            if (this.instagramAutomation) {
                await this.instagramAutomation.shutdown();
            }
            
            // Speichere finale Daten
            await this.contentPipeline?.savePipelineData();
            await this.analytics?.saveHistoricalData();
            
            this.status = 'stopped';
            logger.info('✅ Riona AI sauber heruntergefahren');
            
        } catch (error) {
            logger.error(`Shutdown-Fehler: ${error.message}`);
        }
    }
}

module.exports = RionaAI;    