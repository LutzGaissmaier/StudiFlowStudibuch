# ===========================================
# RIONA AI ENTERPRISE SYSTEM - DOCKERFILE
# ===========================================

# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=Europe/Berlin

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S riona -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# ===========================================
# DEVELOPMENT STAGE
# ===========================================
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Change ownership to app user
RUN chown -R riona:nodejs /app
USER riona

# Expose port
EXPOSE 3000

# Start development server
CMD ["dumb-init", "npm", "run", "dev"]

# ===========================================
# BUILD STAGE
# ===========================================
FROM base AS builder

# Install all dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm ci --only=production && npm cache clean --force

# ===========================================
# PRODUCTION STAGE
# ===========================================
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata \
    ffmpeg \
    && rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=Europe/Berlin

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S riona -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=riona:nodejs /app/dist ./dist
COPY --from=builder --chown=riona:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=riona:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p logs uploads temp && \
    chown -R riona:nodejs logs uploads temp

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER riona

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["dumb-init", "node", "dist/index.js"]

# ===========================================
# LABELS FOR METADATA
# ===========================================
LABEL maintainer="Riona AI Team <dev@studibuch.de>"
LABEL version="1.0.0"
LABEL description="Riona AI Enterprise System - Instagram Automation & Content Management"
LABEL org.opencontainers.image.title="Riona AI Enterprise"
LABEL org.opencontainers.image.description="Enterprise-grade Instagram automation and content management system"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Studibuch.de"
LABEL org.opencontainers.image.licenses="UNLICENSED"
LABEL org.opencontainers.image.source="https://github.com/studibuch/riona-ai" 