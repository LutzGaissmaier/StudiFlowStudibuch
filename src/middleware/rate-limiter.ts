/**
 * Rate Limiter Middleware für StudiFlow AI Enterprise
 * 
 * Diese Middleware implementiert ein Rate Limiting für API-Anfragen,
 * um das System vor Brute-Force- und DoS-Angriffen zu schützen.
 * 
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { redis } from '../core/redis';
import logger from '../core/logger';

// Konfiguration
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 Minute
const DEFAULT_MAX_REQUESTS = 100; // 100 Anfragen pro Minute
const DEFAULT_BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 Minuten

// Interface für Rate Limiter Optionen
interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  blockDurationMs?: number;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
  skipIfAuthenticated?: boolean;
}

/**
 * Erstellt eine Rate Limiter Middleware mit den angegebenen Optionen
 * 
 * @param options - Konfigurationsoptionen für den Rate Limiter
 * @returns Express Middleware Funktion
 */
export const rateLimiter = (options: RateLimiterOptions = {}) => {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;
  const blockDurationMs = options.blockDurationMs || DEFAULT_BLOCK_DURATION_MS;
  
  // Standard-Key-Generator verwendet IP-Adresse
  const keyGenerator = options.keyGenerator || ((req: Request) => {
    return `rate-limit:${req.ip}`;
  });
  
  // Standard-Handler sendet 429 Too Many Requests
  const handler = options.handler || ((req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
      retryAfter: Math.ceil(blockDurationMs / 1000)
    });
  });
  
  // Middleware-Funktion
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Überprüfen, ob der Benutzer authentifiziert ist und ob wir überspringen sollen
      if (options.skipIfAuthenticated && (req as any).user) {
        return next();
      }
      
      const key = keyGenerator(req);
      
      // Überprüfen, ob der Client blockiert ist
      const isBlocked = await redis.get(`${key}:blocked`);
      if (isBlocked) {
        return handler(req, res);
      }
      
      // Anzahl der Anfragen im aktuellen Zeitfenster abrufen
      const currentCount = await redis.incr(key);
      
      // TTL für den Schlüssel setzen, wenn er neu ist
      if (currentCount === 1) {
        await redis.pexpire(key, windowMs);
      }
      
      // Anfrage-Limit überprüfen
      if (currentCount > maxRequests) {
        // Client blockieren
        await redis.set(`${key}:blocked`, '1', 'PX', blockDurationMs);
        
        // Logging
        logger.warn(`Rate limit exceeded for ${req.ip} on ${req.method} ${req.originalUrl}`);
        
        return handler(req, res);
      }
      
      // X-RateLimit-* Header setzen
      res.set('X-RateLimit-Limit', maxRequests.toString());
      res.set('X-RateLimit-Remaining', Math.max(0, maxRequests - currentCount).toString());
      
      next();
    } catch (error) {
      // Bei Fehlern fortfahren, um die API nicht zu blockieren
      logger.error(`Rate limiter error: ${(error as Error).message}`);
      next();
    }
  };
};

/**
 * Vorkonfigurierte Rate Limiter für verschiedene API-Endpunkte
 */

// Allgemeiner API Rate Limiter
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 Minute
  maxRequests: 100, // 100 Anfragen pro Minute
  skipIfAuthenticated: true // Überspringen für authentifizierte Benutzer
});

// Strenger Rate Limiter für Authentifizierungs-Endpunkte
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  maxRequests: 10, // 10 Anfragen pro 15 Minuten
  blockDurationMs: 60 * 60 * 1000, // 1 Stunde Blockierung
  keyGenerator: (req: Request) => `rate-limit:auth:${req.ip}`
});

// Rate Limiter für Instagram API
export const instagramRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  maxRequests: 200, // 200 Anfragen pro Stunde
  skipIfAuthenticated: true
});

// Rate Limiter für Creatomate API
export const creatomateRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  maxRequests: 50, // 50 Anfragen pro Stunde
  skipIfAuthenticated: true
});

// Rate Limiter für KI-Endpunkte
export const aiRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  maxRequests: 100, // 100 Anfragen pro Stunde
  skipIfAuthenticated: true
});

export default rateLimiter;
