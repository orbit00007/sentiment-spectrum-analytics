# Step 1: Build Vite app
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm install

# Copy project files and .env
COPY . .

# Build the Vite app (.env file will be read by Vite)
RUN npm run build

# Step 2: Serve with nginx
FROM nginx:alpine

# Copy build output to nginx html dir
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add security headers and SPA support
RUN sed -i '/http {/a\    server_tokens off;' /etc/nginx/nginx.conf

# nginx serves on port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]