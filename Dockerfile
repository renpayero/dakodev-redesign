# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
# Stage 2: Serve
FROM node:20-alpine

WORKDIR /app

# Copy built assets and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install production dependencies
RUN npm ci --only=production

# Expose the port the app runs on
ENV HOST=0.0.0.0
ENV PORT=3060
EXPOSE 3060

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
