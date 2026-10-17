# Practical 13: AI API Integration into a Web Application

**Course Outcome / Program Outcome**: CO6 / PO3, PO5, PO12  
**Frameworks & Tech**: React 18, Vite, Express.js, Node.js (v22+), MongoDB, Mongoose, OpenAI SDK (`gpt-4o-mini`), Google Gemini REST API (`gemini-1.5-flash`).

---

## 🌟 Overview & Objectives
Practical 13 extends the full-stack Task Management application from Practical 6 by integrating external Artificial Intelligence (AI) services while strictly adhering to security, resilience, and Responsible AI guidelines:
1. **Server-Side Key Isolation**: External AI keys (`OPENAI_API_KEY` / `GEMINI_API_KEY`) are kept strictly on the Express backend (`.env`) and excluded from Git commits via `.gitignore`. The browser never sees or handles credentials.
2. **Graceful Degradation Architecture**: If the third-party AI provider experiences downtime, network partitions, authentication errors (`401`), or rate-limiting (`429`), the app catches the error and serves a high-quality fallback template without crashing or interrupting core task management.
3. **Editable Human-in-the-Loop Suggestions**: AI-generated task descriptions populate the form as editable drafts that students can refine or discard prior to submission.
4. **Responsible AI Disclaimers**: UI indicators and disclaimers inform the user that suggestions are machine-generated and must be reviewed.
5. **Rate Limiting Protection**: Enforces an in-memory rate limiter (10 requests/minute per client) to protect API quotas and avoid financial drain, accompanied by client-side button cooldowns.

---

## 📂 Repository Structure

```
practical 13/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic (taskdb_prac13)
│   ├── controllers/
│   │   ├── aiController.js       # AI generation & service status handler
│   │   └── taskController.js     # CRUD handlers for tasks
│   ├── middleware/
│   │   ├── errorHandler.js       # Global Express error handler
│   │   ├── logger.js             # HTTP request logger
│   │   └── rateLimiter.js        # In-memory IP rate limiter (HTTP 429)
│   ├── models/
│   │   └── Task.js               # Mongoose Task Schema (title, description, priority, etc.)
│   ├── routes/
│   │   ├── aiRoutes.js           # Mounted at /api/ai
│   │   └── taskRoutes.js         # Mounted at /api/tasks & /tasks
│   ├── services/
│   │   └── aiService.js          # OpenAI SDK / Gemini fetch + Graceful Fallback Engine
│   ├── .env                      # Local secrets (OPENAI_API_KEY, PORT, MONGODB_URI)
│   ├── .env.example              # Template for environment configuration
│   ├── .gitignore                # Strictly excludes .env and node_modules
│   ├── package.json              # Backend dependencies (express, cors, dotenv, mongoose, openai)
│   ├── server.js                 # Express server bootstrap
│   ├── test-ai.js                # AI integration, failure path, & rate limit test suite
│   └── test-api.js               # Task CRUD endpoint automated verification
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmModal.jsx  # Task deletion confirmation modal
│   │   │   ├── ErrorMessage.jsx  # Error banner display
│   │   │   ├── Spinner.jsx       # Loading spinner
│   │   │   ├── TaskForm.jsx      # Form with "Generate with AI" button, loading state & disclaimer
│   │   │   ├── TaskItem.jsx      # Task item card with "AI Assisted" badge
│   │   │   ├── TaskList.jsx      # Task grid with search & filtering
│   │   │   └── Toast.jsx         # Live notification banners
│   │   ├── services/
│   │   │   └── api.js            # Frontend API client (CRUD + AI endpoints)
│   │   ├── App.css               # Modern UI styling, AI gradient buttons & badges
│   │   ├── App.jsx               # Root application component & state management
│   │   ├── index.css             # Base resets & typography
│   │   └── main.jsx              # React DOM entry point
│   ├── .gitignore                # Excludes node_modules and dist/
│   ├── index.html                # App HTML template
│   ├── package.json              # Frontend dependencies (react, react-dom, vite)
│   └── vite.config.js            # Vite configuration
├── LAB_REPORT.md                 # Complete formal lab report addressing CO6/PO3, PO5, PO12
├── README.md                     # Project documentation & run guide
└── .gitignore                    # Root level Git ignore rules
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22.22.0)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017`
- **API Key** *(Optional)*: OpenAI API key or Google Gemini API key. *(The system operates with full functionality via its graceful fallback engine even without a live key!)*

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd "practical 13/backend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your OpenAI or Gemini key (optional):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/taskdb_prac13
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_real_key_here
   AI_RATE_LIMIT_PER_MINUTE=10
   ```
4. Start the Express server:
   ```bash
   npm start
   # Server runs at http://localhost:5000
   ```

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd "practical 13/frontend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   # App runs at http://localhost:5173
   ```

---

## 🧪 Testing & Verification

### Run the AI Integration Test Suite
From `practical 13/backend`:
```bash
npm run test:ai
```
This script executes 5 automated test scenarios:
1. **Health Check**: Tests `GET /api/ai/status` (verifies provider status and fallback readiness).
2. **AI Generation**: Tests `POST /api/ai/generate-description` for valid task input.
3. **Input Validation**: Tests empty title rejection (`400 Bad Request`).
4. **Step 6 Failure Path**: Passes an invalid test key (`sk-invalid-key-...`) to confirm the app **never crashes**, catches the 401 error, and returns `{ fallback: true }` with a clean fallback description.
5. **Rate Limiting**: Fires rapid requests to confirm the rate limiter triggers HTTP `429 Too Many Requests`.

### Run the CRUD API Test Suite
```bash
npm run test:api
```
Validates full CRUD lifecycle on MongoDB (`GET`, `POST`, `PUT`, `DELETE`).

---

## 📡 API Reference

### 1. `POST /api/ai/generate-description`
Generates a concise task description and suggested priority based on a task title.

- **Request Body**:
  ```json
  {
    "title": "Implement OAuth2 login with Google"
  }
  ```
- **Success Response (Live AI)**:
  ```json
  {
    "success": true,
    "description": "Configure Google Cloud OAuth credentials and implement passport/JWT authentication flow.",
    "suggestedPriority": "medium",
    "fallback": false,
    "source": "openai-gpt-4o-mini"
  }
  ```
- **Fallback Response (On Key Error / Offline / Timeout)**:
  ```json
  {
    "success": true,
    "description": "Work on \"Implement OAuth2 login with Google\": Outline core requirements, execute required implementation steps, and verify completed deliverables.",
    "suggestedPriority": "medium",
    "fallback": true,
    "source": "fallback-template",
    "warning": "External AI API failed (401 Unauthorized). Graceful fallback applied automatically."
  }
  ```
- **Rate Limit Response (`429`)**:
  ```json
  {
    "success": false,
    "error": "Rate limit exceeded: Maximum 10 AI generation requests allowed per minute. Please try again in 55 seconds."
  }
  ```

### 2. `GET /api/ai/status`
Returns configuration health and active AI provider state.

---

## 🛡️ Responsible AI Principles Demonstrated

| Principle | Technical Implementation |
| :--- | :--- |
| **Credential Security** | Keys are stored strictly on the backend (`.env`), never bundled into client JavaScript. |
| **User Agency** | The AI-generated description is placed in an editable textarea; the user retains full control to modify or reject it. |
| **Transparency & Disclaimer** | A prominent UI disclaimer banner alerts the user that content is machine-generated and must be reviewed. |
| **Resilience / Fault Tolerance** | The application degrades gracefully when external AI fails, ensuring core task management remains uninterrupted. |
| **Cost & Quota Governance** | An IP rate limiter prevents denial-of-wallet and quota exhaustion. |
