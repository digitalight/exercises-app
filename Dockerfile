# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ .

# API is served from the same origin, so /api works without an absolute URL
ENV VITE_API_URL=/api

RUN npm run build

# Stage 2: Backend — serves both the API and the built React app
FROM node:22-alpine

WORKDIR /app

# Native build deps for better-sqlite3
RUN apk add --no-cache python3 make g++
RUN echo "cxx_flags=-std=c++20" > /root/.npmrc

COPY backend/package.json ./
RUN npm install

COPY backend/src/ ./src/

# Copy built frontend into public/
COPY --from=frontend-builder /app/frontend/dist ./public

# Persistent data directories
RUN mkdir -p /app/data /app/uploads

EXPOSE 3001

CMD ["node", "src/index.js"]
