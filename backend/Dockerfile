FROM node:22-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Force C++20 for better-sqlite3 on newer Node headers
RUN echo "cxx_flags=-std=c++20" > /root/.npmrc

COPY package.json ./
RUN npm install

COPY src/ ./src/

# Create data and uploads directories
RUN mkdir -p /app/data /app/uploads

EXPOSE 3001

CMD ["node", "src/index.js"]
