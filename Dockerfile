# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install


# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Configure Nginx for SPA (fallback to index.html) and Port 8080
RUN echo 'server { \
  listen 8080; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
  try_files $uri $uri/ /index.html; \
  } \
  }' > /etc/nginx/conf.d/default.conf

# Copy build artifacts
# Based on angular.json, output is in ./dist
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Generate env.js from environment variable and start Nginx
CMD ["/bin/sh", "-c", "echo \"(function(window){window.env=window.env||{};window.env.apiKey='${GEMINI_API_KEY}';})(this);\" > /usr/share/nginx/html/assets/env.js && nginx -g 'daemon off;'"]
