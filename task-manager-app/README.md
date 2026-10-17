# Task Manager — Full Stack (Practical 4)

A complete Task Management app built for Practical 4 (RESTful API with Node.js
and Express), extended with a React frontend.

```
task-manager-app/
├── backend/                 Node.js + Express REST API
│   ├── controllers/
│   │   └── taskController.js
│   ├── data/
│   │   └── tasks.js         In-memory store (no DB required)
│   ├── middleware/
│   │   ├── logger.js              logs METHOD URL - timestamp
│   │   ├── validateContentType.js rejects POST/PUT w/o application/json
│   │   ├── validateTaskId.js      validates :id is numeric
│   │   └── errorHandler.js        global error handler (last middleware)
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── server.js            App entry point
│   └── package.json
│
└── frontend/                 React app (Vite)
    ├── src/
    │   ├── api/taskApi.js         Axios calls to the backend
    │   ├── components/            Header, ActivityLog, Board, Column, TaskCard, NewTaskForm
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Architecture

```
Browser (React, http://localhost:3000)
        │  Axios (fetch/create/update/delete)
        ▼
Express API (http://localhost:5000)
        │
[Logging Middleware] → [CORS] → [JSON body parser] → [Content-Type Validator]
        │
Router  /api/tasks
   ├── GET    /api/tasks         → getAllTasks
   ├── GET    /api/tasks/:id     → validateTaskId → getTaskById
   ├── POST   /api/tasks         → createTask
   ├── PUT    /api/tasks/:id     → validateTaskId → updateTask
   └── DELETE /api/tasks/:id     → validateTaskId → deleteTask
        │
[404 Handler] → [Global Error Handler]
```

## Prerequisites

- Node.js v18+ and npm (check with `node -v` and `npm -v`)
- VS Code (or any editor)

## Setup & Run

Open **two terminals** in VS Code (`` Ctrl+` `` then split, or `Terminal → New Terminal`).

### Terminal 1 — Backend (API on port 5000)

```bash
cd backend
npm install
npm run dev        # uses nodemon, auto-restarts on changes
# or: npm start     # plain node
```

You should see:

```
Server running on http://localhost:5000
```

Test it directly: open `http://localhost:5000/api/tasks` in a browser — you
should see a JSON list of sample tasks.

### Terminal 2 — Frontend (React on port 3000)

```bash
cd frontend
npm install
npm run dev
```

Vite will open `http://localhost:3000` automatically. The React app talks to
the API at `http://localhost:5000/api/tasks` (see `src/api/taskApi.js` if you
ever change the backend port).

> Both servers must be running at the same time for the app to work — the
> backend serves data, the frontend serves the UI.

## What the frontend does

- Fetches all tasks on load and shows them in three columns: **Pending**, **In
  Progress**, **Done**.
- Add a task from the terminal-style input bar at the top.
- Move a task between columns with the ← / → buttons on each card.
- Delete a task with the **×** button.
- A live **activity log** panel echoes every API call the UI makes (method,
  URL, time) — the frontend's mirror of the backend's request-logging
  middleware.
- A status pill in the header turns red if the API can't be reached (e.g. you
  forgot to start the backend).

## Testing the API directly (optional)

With the backend running, try these in a new terminal or Postman:

```bash
curl http://localhost:5000/api/tasks
curl -X POST http://localhost:5000/api/tasks -H "Content-Type: application/json" -d '{"title":"New task"}'
curl -X PUT http://localhost:5000/api/tasks/1 -H "Content-Type: application/json" -d '{"status":"done"}'
curl -X DELETE http://localhost:5000/api/tasks/1
```

## Notes

- Data is stored in memory on the backend (`backend/data/tasks.js`) — it
  resets whenever the server restarts. Swap this out for a real database
  (e.g. MongoDB, per the practical's Coursera reference) as a next step.
- CORS is enabled on the backend so the React dev server (port 3000) can call
  the API (port 5000) without errors.
