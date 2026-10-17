# Practical 10: Asynchronous Processing with Event-Driven Architecture

## Course Outcomes & Program Outcomes
- **CO / PO:** CO4 / PO3, PO5
- **Objective:** To implement asynchronous background processing using Node.js native `EventEmitter` without external dependencies.

---

## 🏗️ Architecture & Flow Diagram

```
POST /tasks Request
       │
       ▼
 Save Task to MongoDB
       │
       ▼
 Send HTTP 201 Response Immediately  ──► Client Receives Response (<50ms)
       │
       ▼
 emit('task-created', taskData)
       │
       ▼ (Handled asynchronously via libuv Event Loop)
 Notification Listener (2s simulated delay)
       └── Logs: Task Title, Timestamp, Assigned User
```

---

## 📁 Project Structure

```
practical 10/
├── config/
├── models/
│   └── Task.js              # Mongoose Task Schema (title, assignedUser, etc.)
├── routes/
│   └── taskRoutes.js        # Express routes (POST, GET, PUT, DELETE with events)
├── events.js                # Custom EventEmitter class instance (Singleton)
├── listeners.js             # Event listeners ('task-created', 'task-deleted', 'error')
├── server.js                # Express app & MongoDB connection
├── test-demo.js             # Automated verification suite with timestamp checks
├── package.json             # NPM dependencies & test scripts
├── .env                     # Environment variables (PORT, MONGO_URI)
├── .env.example             # Example environment template
├── .gitignore               # Git ignore rules
├── README.md                # Documentation & instructions
└── LAB_REPORT.md            # Comprehensive academic lab report
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Local MongoDB running at `mongodb://127.0.0.1:27017`

### 1. Installation
In this directory (`practical 10`), install dependencies:
```bash
npm install
```

### 2. Environment Setup
The `.env` file is pre-configured:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/practical10
```

### 3. Run the Server
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

### 4. Run the Automated Demo & Verification Suite
In a separate terminal:
```bash
npm run test:demo
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Event Emitted |
| :--- | :--- | :--- | :--- |
| `POST` | `/tasks` | Create task & respond immediately (201) | `task-created` |
| `GET` | `/tasks` | Get all tasks | None |
| `GET` | `/tasks/:id` | Get single task by ID | None |
| `PUT` | `/tasks/:id` | Update task details | None |
| `DELETE` | `/tasks/:id` | Delete task & respond immediately (200) | `task-deleted` |

---

## ⏱️ Timestamp Evidence (Non-Blocking Proof)

When running the test suite, observe the server console logs:

```
[API] Response 201 Created sent to client at: 2026-09-24T10:48:55.082Z
[Notification Listener] 'task-created' event RECEIVED at: 2026-09-24T10:48:55.085Z
[Notification Listener] 'task-created' COMPLETED at:      2026-09-24T10:48:57.091Z
```

Notice:
1. The **API response** was sent at `10:48:55.082Z`.
2. The **Notification listener** finished its 2-second background task at `10:48:57.091Z`.
3. The API client was **never blocked** and received its response in milliseconds!

---

## 🛡️ Error Handling Demonstration

Node.js `EventEmitter` treats the `'error'` event specially: if an error event is emitted without a registered listener, the Node.js process crashes.

In `listeners.js`, an `'error'` listener is explicitly registered:
```javascript
taskEvents.on('error', (err) => {
  console.error(`[TaskEvents ERROR LISTENER] Handled gracefully without crashing!`);
});
```
When creating a task with title containing `simulate-error`, the background error is safely handled and logged without interrupting the server.
