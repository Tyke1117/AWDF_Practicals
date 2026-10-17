# Practical 8: Performance Optimization and Lazy Loading in React

**Course Outcome (CO) / Program Outcome (PO)**: CO1 / PO3, PO5  
**Course Reference**: AWDF / IBM Front-End Apps with React Module 4 (Advanced React Features & Performance Optimization)

---

## 🎯 Objectives & Overview

This project implements enterprise-grade **frontend performance optimization** on a Task Management multi-route React application using:
1. **Route-Based Code Splitting**: Splitting the monolithic bundle into dynamic on-demand chunks via `React.lazy()` and `Suspense`.
2. **Meaningful Fallback UI**: Shimmering skeleton loader cards with chunk context badges shown during asynchronous chunk downloads.
3. **Heavy Third-Party Component Splitting** (*Supplementary Problem 1*): Deferring a 172 KB `Chart.js` data visualization library into an isolated chunk loaded only when analytics are requested.
4. **Minimum-Delay Fallback** (*Supplementary Problem 2*): Enforcing a 300ms anti-flicker delay to avoid jarring spinner flashes on high-speed connections.
5. **Runtime Profiling & Memoization** (*Supplementary Problem 3*): Eliminating 100% of unnecessary re-renders when typing into search inputs using `React.memo` and `useCallback`.
6. **Automated Bundle Benchmark Tool**: A custom Node.js script comparing the monolithic baseline against the optimized build with exact byte sizes and percentage savings.

---

## 📂 Project Structure

```
practical 8/
├── backend/
│   ├── server.js              # Express REST API (tasks, projects, analytics, contact)
│   ├── package.json
│   └── node_modules/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FallbackLoading.jsx    # Shimmer skeleton fallback UI
│   │   │   ├── HeavyChart.jsx         # Heavy Chart.js component (Supplementary 1)
│   │   │   ├── Navbar.jsx             # Top navigation with chunk counters & badges
│   │   │   ├── TaskItem.jsx           # Memoized task card with live render counter (Supplementary 3)
│   │   │   ├── TaskList.jsx           # Task list with search, filter, and profiler toggle
│   │   │   ├── TaskForm.jsx           # Task creation/editing form
│   │   │   ├── ConfirmModal.jsx       # Confirmation dialog
│   │   │   ├── Toast.jsx              # Status toast notifications
│   │   │   └── PerformanceInspectorModal.jsx # In-app performance console
│   │   ├── pages/
│   │   │   ├── Home.jsx               # Task Dashboard (Entry chunk)
│   │   │   ├── Projects.jsx           # Projects milestone tracking (Lazy chunk)
│   │   │   ├── Analytics.jsx          # Velocity & Heavy Chart container (Lazy chunk)
│   │   │   └── Contact.jsx            # Support portal (Lazy chunk)
│   │   ├── services/
│   │   │   └── api.js                 # API service with automatic multi-port & offline fallback
│   │   ├── utils/
│   │   │   └── lazyWithDelay.js       # Minimum delay fallback utility (Supplementary 2)
│   │   ├── App.jsx                    # Lazy routes wrapped with Suspense
│   │   ├── AppEager.jsx               # Baseline monolithic configuration (before optimization)
│   │   ├── App.css                    # Polished modern responsive styling
│   │   ├── index.css
│   │   ├── main.jsx                   # Production entry point
│   │   └── main.baseline.jsx          # Baseline entry point
│   ├── scripts/
│   │   └── compare-bundles.js         # Automated bundle benchmarking script
│   ├── index.html
│   ├── index.baseline.html
│   ├── vite.config.js                 # Code-split Vite build configuration
│   ├── vite.baseline.config.js        # Monolithic baseline configuration
│   └── package.json
├── docs/
│   ├── metrics.json                   # Machine-readable performance metrics
│   └── PROFILER_ANALYSIS.md           # Profiler flamegraph and re-render audit report
├── LAB_REPORT.md                      # Comprehensive academic lab report
├── README.md
└── package.json                       # Top-level task runner
```

---

## 🚀 Quick Start Guide

### 1. Installation
Run npm install in both backend and frontend:
```bash
# From practical 8 root:
npm run install:all
```
*(Dependencies are already pre-installed in this directory).*

### 2. Start the Frontend & Backend
You can run the frontend and backend in separate terminals:

```bash
# Terminal 1: Start Backend API (Port 5000 / 5001)
cd backend
npm start

# Terminal 2: Start Frontend Dev Server (Port 5173)
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 📊 Measuring Performance & Code Splitting

### 1. Run the Automated Bundle Benchmark
Execute the automated comparison script to verify bundle reductions side-by-side:
```bash
cd frontend
npm run compare
```

### Benchmark Output Results:
```
===============================================================
   PRACTICAL 8: BUNDLE SIZE & PERFORMANCE BENCHMARK REPORT    
===============================================================

--- 1. BASELINE BUILD (Monolithic Single Bundle - Before Optimization) ---
File: index.baseline-Da8pL3bp.js │ Raw: 371.71 kB │ Gzip: 123.16 kB
Total Baseline JS: 371.71 kB (Gzipped: 123.16 kB)

--- 2. OPTIMIZED BUILD (React.lazy + Suspense Code-Splitting) ---
┌─────────────────────────────┬─────────────┬──────────────┐
│ Chunk Name                  │ Raw Size    │ Gzipped Size │
├─────────────────────────────┼─────────────┼──────────────┤
│ index-BD-O7hB4.js           │ 12.96 kB    │ 4.06 kB      │
│ router-vendor-DF0nzGdQ.js   │ 159.43 kB   │ 52.03 kB     │
│ Home-DBrLojNi.js            │ 13.84 kB    │ 4.61 kB      │
│ api-BqO9kT71.js             │ 4.41 kB     │ 1.65 kB      │
│ Projects-BjB1j2fR.js        │ 2.39 kB     │ 0.93 kB      │
│ Analytics-Dvpvn_CN.js       │ 4.28 kB     │ 1.52 kB      │
│ Contact-CWGrJOAs.js         │ 3.96 kB     │ 1.38 kB      │
│ HeavyChart-BUNiBAtM.js      │ 2.45 kB     │ 1.04 kB      │
│ chart-vendor-ByOaxVB5.js    │ 172.27 kB   │ 60.25 kB     │
└─────────────────────────────┴─────────────┴──────────────┘

--- 3. INITIAL PAYLOAD REDUCTION COMPARISON ---
Initial JS on First Visit (Raw):
  Baseline: 371.71 kB ──► Optimized: 190.63 kB  (-181.08 kB / 48.7% reduction!)
Initial JS on First Visit (Gzip):
  Baseline: 123.16 kB ──► Optimized: 62.36 kB   (-60.80 kB / 49.4% reduction!)
```

---

## 🔍 How to Test in Browser DevTools

### Observing Chunk Loading and Fallback UI
1. Open the running app at `http://localhost:5173`.
2. Press **F12** to open Developer Tools and select the **Network** tab.
3. In the Network tab:
   - Filter by **JS** or **Fetch/XHR**.
   - Change Throttling from *No throttling* to **Slow 3G**.
4. In the application navbar, click on **Projects**, **Analytics**, or **Contact**.
5. Observe:
   - The aesthetic **Suspense Fallback skeleton UI** shimmers while the chunk script transfers.
   - The browser downloads *only* that specific page's chunk (e.g. `Projects-*.js`, 2.39 kB) without refreshing the entire page.
   - Click the **"⚡ Perf Inspector"** pill in the navbar to inspect live chunk timestamps and test the minimum-delay slider.

### Testing React DevTools Profiler (Supplementary Problem 3)
1. On the **Home** page, locate the green banner: **DevTools Profiler Experiment**.
2. Notice the live counter on each task card: `Renders: 1`.
3. In the search box, start typing (e.g., `"test"`):
   - **With `React.memo` (Default / Enabled)**: Child task items **do not re-render**. The counter stays at `1`.
   - Click **"Disable React.memo (Demonstrate Re-render)"**: Type again in the search bar. All 5 task cards flash yellow and their render counters increase with every keystroke!
4. In React DevTools **Profiler**, record a session to see flamegraph verification.

---

## 📜 Deliverables & Grading Rubrics

- Complete source code with `React.lazy()` and `<Suspense>` route code splitting.
- Heavy component code splitting with Chart.js (`HeavyChart.jsx`).
- Minimum delay fallback utility (`lazyWithDelay.js`).
- DevTools Profiler audit documented in `docs/PROFILER_ANALYSIS.md`.
- Comprehensive formal report in `LAB_REPORT.md`.
- Machine-readable metrics in `docs/metrics.json`.
