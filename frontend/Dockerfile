# frontend/Dockerfile (Multi-Stage Build - Supplementary Problem 2)
# Stage 1: Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Minimal Runtime Runner Stage
FROM node:18-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm install --production
# Copy compiled bundle from build stage
COPY --from=build /app/dist ./dist
COPY vite.config.js ./
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
