# backend/Dockerfile (Node/Express API Service)
FROM node:18-alpine

WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose internal container port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
