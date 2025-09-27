# Step 1: Build Vite app
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Accept env var from docker-compose (build-time)
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

# Build the Vite app (env vars baked in)
RUN npm run build

# Step 2: Serve with nginx
FROM nginx:alpine

# Copy build output to nginx html dir
COPY --from=build /app/dist /usr/share/nginx/html

# Copy default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# nginx serves on port 80
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
