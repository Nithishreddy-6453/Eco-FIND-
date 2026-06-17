# Multi-Stage Production Build
# -----------------------------------------------
# Stage 1: Build & Compiled Assets Container
FROM node:20-alpine AS builder

WORKDIR /app

# Enable caching of dependency layers
COPY package*.json ./
RUN npm ci

# Copy full source and compile assets
COPY . .
RUN npm run build

# Remove development packages to minimize final footprint
RUN npm prune --production

# -----------------------------------------------
# Stage 2: Minimalist Lightweight Runner Image
FROM node:20-alpine AS runner

WORKDIR /app

# Enforce secure non-root context
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nodejs -G nodejs

# Static configuration and bundled scripts
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
