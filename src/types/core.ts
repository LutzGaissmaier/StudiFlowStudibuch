/**
 * Core Type Definitions for Riona AI Enterprise System
 * 
 * This module contains all core type definitions used throughout the application.
 * All types are strictly typed and include comprehensive documentation.
 * 
 * @module CoreTypes
 * @version 1.0.0
 */

import { Request } from 'express';

// ========================================
// ENVIRONMENT & CONFIGURATION TYPES
// ========================================

export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface DatabaseConfig {
  readonly mongodb: {
    readonly uri: string;
    readonly dbName: string;
    readonly maxPoolSize: number;
    readonly serverSelectionTimeoutMS: number;
    readonly socketTimeoutMS: number;
  };
  readonly redis: {
    readonly host: string;
    readonly port: number;
    readonly password?: string;
    readonly db: number;
    readonly maxRetriesPerRequest: number;
  };
}

export interface SecurityConfig {
  readonly jwt: {
    readonly secret: string;
    readonly expiresIn: string;
    readonly issuer: string;
    readonly audience: string;
  };
  readonly bcrypt: {
    readonly saltRounds: number;
  };
  readonly rateLimit: {
    readonly windowMs: number;
    readonly max: number;
  };
}

export interface AIConfig {
  readonly openai: {
    readonly apiKey: string;
    readonly model: string;
    readonly maxTokens: number;
  };
  readonly gemini: {
    readonly apiKey: string;
    readonly model: string;
  };
}

export interface InstagramConfig {
  readonly enabled: boolean;
  readonly credentials: {
    readonly username: string;
    readonly password: string;
  };
  readonly automation: {
    readonly maxLikesPerHour: number;
    readonly maxCommentsPerHour: number;
    readonly maxFollowsPerHour: number;
    readonly maxPostsPerDay: number;
  };
  readonly proxy?: {
    readonly host: string;
    readonly port: number;
    readonly username?: string;
    readonly password?: string;
  };
}

export interface AppConfig {
  readonly environment: Environment;
  readonly server: {
    readonly port: number;
    readonly host: string;
    readonly cors: {
      readonly origins: readonly string[];
      readonly credentials: boolean;
    };
  };
  readonly database: DatabaseConfig;
  readonly security: SecurityConfig;
  readonly ai: AIConfig;
  readonly instagram: InstagramConfig;
  readonly studibuch: {
    readonly baseUrl: string;
    readonly scraping: {
      readonly enabled: boolean;
      readonly intervalMinutes: number;
      readonly maxArticlesPerRun: number;
    };
  };
  readonly logging: {
    readonly level: string;
    readonly maxFiles: string;
    readonly maxSize: string;
  };
}

// ========================================
// API & HTTP TYPES
// ========================================

export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
  readonly meta?: {
    readonly timestamp: string;
    readonly requestId: string;
    readonly version: string;
  };
}

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}

export interface AuthenticatedRequest extends Request {
  readonly user: {
    readonly id: string;
    readonly username: string;
    readonly role: UserRole;
  };
}

// ========================================
// USER & AUTHENTICATION TYPES
// ========================================

export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer';

export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly lastLogin?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserSession {
  readonly userId: string;
  readonly username: string;
  readonly role: UserRole;
  readonly loginTime: Date;
  readonly expiresAt: Date;
  readonly ipAddress: string;
  readonly userAgent: string;
}

export interface AuthToken {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly scope: readonly string[];
}

export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

// ========================================
// CONTENT & MEDIA TYPES
// ========================================

export type ContentStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';
export type ContentType = 'post' | 'story' | 'reel' | 'carousel';
export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface MediaFile {
  readonly id: string;
  readonly filename: string;
  readonly originalName: string;
  readonly mimeType: string;
  readonly size: number;
  readonly width?: number;
  readonly height?: number;
  readonly duration?: number;
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly metadata: Record<string, unknown>;
  readonly uploadedAt: Date;
}

export interface ContentItem {
  readonly id: string;
  readonly type: ContentType;
  readonly status: ContentStatus;
  readonly title: string;
  readonly caption: string;
  readonly hashtags: readonly string[];
  readonly mediaFiles: readonly MediaFile[];
  readonly sourceUrl?: string;
  readonly scheduledAt?: Date;
  readonly publishedAt?: Date;
  readonly instagramPostId?: string;
  readonly analytics?: ContentAnalytics;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ContentAnalytics {
  readonly likes: number;
  readonly comments: number;
  readonly shares: number;
  readonly reach: number;
  readonly impressions: number;
  readonly engagement: number;
  readonly clickThroughRate?: number;
  readonly lastUpdated: Date;
}

// ========================================
// SCRAPING & AUTOMATION TYPES
// ========================================

export interface ScrapedArticle {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly excerpt: string;
  readonly author?: string;
  readonly publishedAt: Date;
  readonly sourceUrl: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly imageUrl?: string;
  readonly scrapedAt: Date;
}

export interface AutomationTask {
  readonly id: string;
  readonly type: 'post' | 'like' | 'comment' | 'follow' | 'unfollow';
  readonly status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly data: Record<string, unknown>;
  readonly scheduledAt: Date;
  readonly executedAt?: Date;
  readonly completedAt?: Date;
  readonly error?: string;
  readonly retryCount: number;
  readonly maxRetries: number;
  readonly createdAt: Date;
}

export interface InstagramAction {
  readonly type: 'like' | 'comment' | 'follow' | 'unfollow' | 'post';
  readonly targetId: string;
  readonly data?: Record<string, unknown>;
  readonly executedAt: Date;
  readonly success: boolean;
  readonly error?: string;
}

// ========================================
// SYSTEM & MONITORING TYPES
// ========================================

export interface SystemHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly services: {
    readonly database: ServiceStatus;
    readonly redis: ServiceStatus;
    readonly instagram: ServiceStatus;
    readonly ai: ServiceStatus;
    readonly scheduler: ServiceStatus;
  };
  readonly metrics: {
    readonly uptime: number;
    readonly memory: MemoryUsage;
    readonly cpu: CpuUsage;
  };
  readonly lastCheck: Date;
}

export interface ServiceStatus {
  readonly status: 'up' | 'down' | 'degraded';
  readonly latency?: number;
  readonly error?: string;
  readonly lastCheck: Date;
}

export interface MemoryUsage {
  readonly used: number;
  readonly total: number;
  readonly percentage: number;
}

export interface CpuUsage {
  readonly percentage: number;
  readonly loadAverage: readonly [number, number, number];
}

export interface LogEntry {
  readonly level: 'error' | 'warn' | 'info' | 'debug';
  readonly message: string;
  readonly timestamp: Date;
  readonly context: string;
  readonly metadata?: Record<string, unknown>;
  readonly stack?: string;
}

// ========================================
// ERROR TYPES
// ========================================

export interface AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly context?: Record<string, unknown>;
}

export interface ValidationError extends AppError {
  readonly field: string;
  readonly value: unknown;
  readonly rule: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export interface TimeRange {
  readonly start: Date;
  readonly end: Date;
}

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

// ========================================
// CONSTANTS
// ========================================

export const USER_ROLES: readonly UserRole[] = ['admin', 'manager', 'editor', 'viewer'] as const;
export const CONTENT_STATUSES: readonly ContentStatus[] = ['draft', 'pending_review', 'approved', 'published', 'archived'] as const;
export const CONTENT_TYPES: readonly ContentType[] = ['post', 'story', 'reel', 'carousel'] as const;
export const MEDIA_TYPES: readonly MediaType[] = ['image', 'video', 'audio', 'document'] as const;

// ========================================
// TYPE GUARDS
// ========================================

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function isContentStatus(value: string): value is ContentStatus {
  return CONTENT_STATUSES.includes(value as ContentStatus);
}

export function isContentType(value: string): value is ContentType {
  return CONTENT_TYPES.includes(value as ContentType);
}

export function isMediaType(value: string): value is MediaType {
  return MEDIA_TYPES.includes(value as MediaType);
}

// ========================================
// VALIDATION SCHEMAS (for runtime validation)
// ========================================

export interface ValidationSchema<T> {
  readonly validate: (value: unknown) => value is T;
  readonly sanitize?: (value: T) => T;
  readonly errors: readonly string[];
}

// Export everything as a namespace for organized imports
export namespace RionaTypes {
  export type Config = AppConfig;
  export type UserType = User;
  export type ContentItemType = ContentItem;
  export type ApiResponseType<T = unknown> = ApiResponse<T>;
  export type SystemHealthType = SystemHealth;
  export type AppErrorType = AppError;
} 