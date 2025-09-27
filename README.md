React + Vite App (Dockerized)
This project is a React application built with Vite and bundled inside a Docker container for easy deployment.
It uses Node.js to build the app and Nginx to serve it in production.

🚀 Features
React with Vite and SWC plugin for fast builds

Dockerized workflow for portability

Nginx for serving optimized production builds

Custom Vite config with alias support (@ → src)

📂 Project Structure
.
├── Dockerfile
├── nginx.conf
├── package.json
├── vite.config.ts
├── src/
└── public/

⚙️ Vite Config
Runs dev server on :: (all interfaces)

Default dev port: 8080

Aliases @ → ./src

{
  server: {
    host: "::",
    port: 8080,
  }
}

🐳 Running with Docker
Build Docker Image

docker build -t my-vite-app .

Run Container

docker run -p 5173:5173 my-vite-app

Now the app will be available at:

👉 http://localhost:5173

🛠 Development (without Docker)
If you want to run locally:

npm install
npm run dev

The dev server will run at: http://localhost:8080

📦 Production Build (without Docker)
npm run build
npm run preview

Runs the app locally with Vite’s preview server.

🔧 Nginx Config
The app is served by Nginx using the config from nginx.conf.

Static files are located at /usr/share/nginx/html.