# Practical 6: Full Stack Integration (React + Express + MongoDB)

This project connects a modern React frontend to a Node.js + Express backend with MongoDB persistence for a complete, end-to-end full-stack Task Manager application.

## Directory Structure
```
practical-6/
└── task-manager-app/
    ├── backend/              # Node.js + Express + Mongoose API
    │   ├── config/           # Database configuration
    │   ├── controllers/      # Task CRUD controllers
    │   ├── middleware/       # CORS, Logger & Error handler
    │   ├── models/           # Mongoose Task schema
    │   ├── routes/           # Express task routes
    │   ├── .env              # Environment variables
    │   ├── server.js         # Backend entry point (Port 5000)
    │   ├── test-api.js       # Automated API test script
    │   └── package.json
    ├── frontend/             # React 18 + Vite UI
    │   ├── src/
    │   │   ├── components/   # TaskList, TaskForm, Toast, ConfirmModal
    │   │   ├── services/     # api.js client (BASE_URL: http://localhost:5000)
    │   │   ├── App.jsx       # State management & Optimistic UI
    │   │   ├── App.css
    │   │   └── main.jsx
    │   ├── index.html
    │   ├── vite.config.js    # Vite configuration (Port 5173)
    │   └── package.json
    ├── LAB_REPORT.md         # Detailed lab documentation & evaluation rubrics
    └── README.md             # Running instructions
```

## Getting Started

### 1. Start the Express Backend Server
Open Terminal 1:
```bash
cd backend
npm install
npm run dev   # or npm start
```
*The Express server will start on `http://localhost:5000` and connect to MongoDB.*

### 2. Start the React Frontend Application
Open Terminal 2:
```bash
cd frontend
npm install
npm run dev
```
*The React dev server will start on `http://localhost:5173`.*

### 3. Verify End-to-End Flow
1. Open browser to `http://localhost:5173`.
2. Create a new task (noticing the instant **Optimistic UI update** and confirmation Toast notification).
3. Toggle task status or edit task details (persisted to MongoDB via `PUT /tasks/:id`).
4. Click Delete on a task and confirm in the **Confirmation Modal** dialog.
5. Refresh the browser page (`F5`) to verify that all data remains persisted in MongoDB.

---

## Testing Backend API Standalone
To test all Express API endpoints automatically without running the browser:
```bash
cd backend
node test-api.js
```
