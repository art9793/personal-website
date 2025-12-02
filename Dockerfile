# Multi-stage build for production deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy client directory first to ensure index.html is copied as a file
COPY client ./client

# Copy rest of source code
COPY server ./server
COPY shared ./shared
COPY vite.config.ts ./
COPY vite-plugin-meta-images.ts ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY components.json ./
COPY scripts ./scripts

# Clean up any existing dist directory to ensure a clean build
RUN rm -rf dist || true

# Verify index.html exists as a file (not a directory) before building
RUN echo "=== Checking file structure ===" && \
  ls -la client/ && \
  echo "=== Checking index.html ===" && \
  file client/index.html && \
  test -f client/index.html || (echo "ERROR: client/index.html is not a file" && ls -la client/ && exit 1) && \
  echo "=== File check passed ===" && \
  echo "=== Verifying index.html content ===" && \
  head -5 client/index.html

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]

