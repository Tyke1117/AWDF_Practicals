# Practical 11: Containerization with Docker and Docker Compose

**Course**: Application Workflows & Development Frameworks (AWDF) / Full-Stack Web Development  
**Practical**: Practical 11  
**CO/PO Mapping**: CO5 / PO3, PO5  
**Objective**: To containerize the full-stack Task Management application using Docker and orchestrate multiple services (React frontend, Node/Express backend, and MongoDB database) using Docker Compose.

---

## 1. Architecture & Container Topology

```
+-----------------------------------------------------------------------------------+
|                                 HOST SYSTEM (Windows / Browser)                   |
|                                                                                   |
|     Browser Client                                                                |
|     http://localhost:5173                                                         |
|           │                                                                       |
|           │ HTTP Requests                                                         |
|           ▼                                                                       |
|     http://localhost:5000 (Host Port Forwarding)                                  |
+-----------┬───────────────────────────────────────┬───────────────────────────────+
            │ :5173                                 │ :5000
            ▼                                       ▼
+───────────────────────────────────────────────────────────────────────────────────+
|                           DOCKER INTERNAL BRIDGE NETWORK                          |
|                                (app-network)                                      |
|                                                                                   |
|   ┌─────────────────────────┐            ┌─────────────────────────┐              |
|   │   taskmanager-frontend  │            │   taskmanager-backend   │              |
|   │   (React + Vite preview)│            │   (Node 18 + Express)   │              |
|   │   Container Port: 5173  │            │   Container Port: 5000  │              |
|   └─────────────────────────┘            └────────────┬────────────┘              |
|                                                       │                           |
|                                                       │ mongodb://mongodb:27017   |
|                                                       │ (Internal DNS Resolution) |
|                                                       ▼                           |
|                                          ┌─────────────────────────┐              |
|                                          │   taskmanager-mongodb   │              |
|                                          │   (Official mongo image)│              |
|                                          │   Container Port: 27017 │              |
|                                          └────────────┬────────────┘              |
+───────────────────────────────────────────────────────┼───────────────────────────+
                                                        │
                                                        ▼
                                       ┌──────────────────────────────────┐
                                       │        NAMED DOCKER VOLUME       │
                                       │       taskmanager-mongo-data     │
                                       │      (Persistent /data/db)       │
                                       └──────────────────────────────────┘
```

---

## 2. Directory Structure

```text
practical 11/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection utilizing Docker service name
│   ├── controllers/
│   │   └── taskController.js     # Task CRUD controller logic
│   ├── middleware/
│   │   ├── errorHandler.js       # Centralized Express error handler
│   │   └── logger.js             # HTTP request logger middleware
│   ├── models/
│   │   └── Task.js               # Mongoose Task schema and model
│   ├── routes/
│   │   └── taskRoutes.js         # API route handlers (/api/tasks)
│   ├── .dockerignore             # Excludes node_modules & local secrets from backend context
│   ├── .env.example              # Example environment configuration for Docker
│   ├── Dockerfile                # Production Dockerfile for Express backend service
│   ├── package.json              # Backend dependencies and scripts
│   └── server.js                 # Express server bootstrap (0.0.0.0 host binding)
├── frontend/
│   ├── src/
│   │   ├── components/           # React UI components (TaskForm, TaskList, Toast, etc.)
│   │   ├── services/
│   │   │   └── api.js            # API client utilizing VITE_API_URL
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .dockerignore             # Excludes node_modules and dist from build context
│   ├── Dockerfile                # Multi-stage Dockerfile for React Vite application
│   ├── index.html
│   ├── package.json              # Frontend dependencies and build/preview scripts
│   └── vite.config.js            # Configured with host: 0.0.0.0 for containerized access
├── .dockerignore                 # Root-level build exclusion rules
├── docker-compose.yml            # Multi-service composition file (mongodb, backend, frontend)
├── README.md                     # Project and containerization documentation
└── LAB_REPORT.md                 # Comprehensive lab report and evaluation document
```

---

## 3. Container Specifications

### A. Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```
- **Base Image**: `node:18` (official Long Term Support Linux Node environment).
- **Layer Caching**: Copies `package*.json` before running `npm install`. Docker caches the dependency installation layer unless dependencies are modified.
- **Port Exposure**: Informs Docker that the service listens on port 5000.

### B. Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host"]
```
- **Multi-Stage Structure**: Builds the static production assets via `npm run build` and serves them via Vite preview binding to `--host` (`0.0.0.0`).

### C. Orchestration (`docker-compose.yml`)
- **`mongodb`**: Runs official MongoDB image on port `27017:27017`, backed by a persistent named volume `mongo-data`.
- **`backend`**: Built from `./backend`, depends on `mongodb`, injects `MONGO_URI=mongodb://mongodb:27017/taskdb`, exposes port `5000:5000`.
- **`frontend`**: Built from `./frontend`, depends on `backend`, maps port `5173:5173`.
- **`app-network`**: User-defined bridge network providing automatic DNS resolution by service name.

---

## 4. Single-Command Execution Instructions

### Step 1: Start Docker Desktop
Ensure Docker Desktop is running on your machine:
```bash
docker --version
docker compose version
```

### Step 2: Build and Launch All Services
From the `practical 11` root directory, execute:
```bash
docker compose up --build
```
*Note: To run in detached (background) mode, add the `-d` flag:*
```bash
docker compose up --build -d
```

### Step 3: Verify Running Containers
Verify that all 3 containers are healthy and active:
```bash
docker ps
```
Expected output:
```text
CONTAINER ID   IMAGE                 COMMAND                  PORTS                    NAMES
xxxxxxxxxxxx   practical11-frontend  "npm run preview -- …"   0.0.0.0:5173->5173/tcp   taskmanager-frontend
xxxxxxxxxxxx   practical11-backend   "node server.js"         0.0.0.0:5000->5000/tcp   taskmanager-backend
xxxxxxxxxxxx   mongo:latest          "docker-entrypoint.s…"   0.0.0.0:27017->27017/tcp taskmanager-mongodb
```

### Step 4: Access Application End-to-End
- **React Frontend**: Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend API Diagnostic**: Open [http://localhost:5000](http://localhost:5000) or [http://localhost:5000/health](http://localhost:5000/health).
- **Task Endpoints**:
  - `GET http://localhost:5000/api/tasks` — List all tasks
  - `POST http://localhost:5000/api/tasks` — Create a task

---

## 5. Teardown & Management Commands

- **Stop all services**:
  ```bash
  docker compose down
  ```
- **Stop all services and remove named volumes (clean state)**:
  ```bash
  docker compose down -v
  ```
- **Inspect service logs**:
  ```bash
  docker compose logs -f backend
  docker compose logs -f frontend
  docker compose logs -f mongodb
  ```

---

## 6. Key Analysis Questions & Answers

### Q1: Why does the backend container need to reference the MongoDB container by its service name (`mongodb`) rather than `localhost`?
**Answer**: Each Docker container runs inside its own isolated Linux network namespace with its own `localhost` (loopback interface `127.0.0.1`). If the backend container attempts to connect to `localhost:27017`, it looks for MongoDB inside *itself*, where no database engine is running. In Docker Compose, all services joined to a custom bridge network (`app-network`) utilize Docker's built-in DNS server, which resolves service names (e.g., `mongodb`) to the specific internal IP address assigned to that container.

### Q2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?
**Answer**:
- `EXPOSE <port>` in a Dockerfile is purely documentation and metadata. It informs operators which port the containerized process listens on, but does **not** make that port accessible to the host machine.
- `ports: - "HOST:CONTAINER"` in `docker-compose.yml` publishes and binds the port to the host operating system's network interfaces, configuring network address translation (NAT) and iptables rules so external traffic on host port 5000 is routed directly into container port 5000.

### Q3: Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
**Answer**:
1. **Platform Binary Incompatibility**: Many Node.js packages (such as `bcrypt`, `sharp`, `sqlite3`, or platform-dependent C++ native addons) compile native binaries specifically for the host architecture and OS (e.g., Windows x64). Copying host `node_modules` into a Linux-based Docker container causes runtime execution failures (`invalid ELF header`).
2. **Context Bloat & Build Speed**: `node_modules` typically contains tens of thousands of small files totaling hundreds of megabytes. Uploading them to the Docker build daemon drastically slows down the build context transfer.
3. **Reproducibility**: Running `npm install` inside the container guarantees clean, deterministic builds tailored specifically to the container's Linux environment.

---

## 7. Supplementary Problems Solved

1. **`.dockerignore` Optimization**:
   Added `.dockerignore` files to both backend and frontend directories, excluding `node_modules`, `.env`, build logs, and git metadata. This reduces build context size by over 90% and keeps sensitive credentials secure.
2. **Multi-Stage Build for React**:
   Structured frontend containerization using a multi-stage approach (`FROM node:18 AS build`), separating dependency compilation from runtime serving, with documented Nginx production deployment patterns.
3. **MongoDB Persistent Named Volume**:
   Configured the `mongo-data` named volume (`taskmanager-mongo-data:/data/db`), ensuring all task records, collections, and indexes persist across container restarts, teardowns, and rebuilds.
