# Multi-stage build for React app
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Accept build argument for API URL
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app (REACT_APP_API_URL will be baked into the build)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Use default nginx configuration
# The nginx container will use its default config

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
