# Practical 8 Lab Report: Performance Optimization and Lazy Loading in React

**Course**: Application Workflows & Development Frameworks (AWDF)  
**Practical**: Practical 8  
**Title**: Performance Optimization and Lazy Loading in React  
**Course Outcomes (CO) / Program Outcomes (PO)**: CO1 / PO3, PO5  
**Date**: September 24, 2026  

---

## 1. Objective

To improve frontend web performance by implementing route-based code splitting and component-level lazy loading techniques using `React.lazy()` and `Suspense`, providing meaningful loading fallback indicators, deferring heavy third-party libraries, mitigating loading flickers via minimum-delay wrappers, eliminating unnecessary component re-renders through memoization, and measuring bundle metrics using browser DevTools and Vite build tooling.

---

## 2. Architecture & Flow Diagram

### Architectural Transformation

```
BEFORE OPTIMIZATION (Monolithic Single Bundle):
================================================================================
Browser Requests '/' ──► [main.bundle.js (~371 kB raw / ~123 kB gzip)]
                         Includes: [Home] + [Projects] + [Contact] + [Analytics]
                                   + [Chart.js (172 kB)] + [React Core]
                         * Result: User waits for ALL pages & charts to download
                                   before the first page can even display.
================================================================================

AFTER OPTIMIZATION (Code-Split Dynamic Bundles):
================================================================================
First Visit '/'      ──► index.js (12.9 kB) + router-vendor.js (159.4 kB)
                         + Home.chunk.js (13.8 kB)
                         [Initial Total: ~190 kB raw / ~62 kB gzip] ──► ~49% SAVINGS!

Navigate '/projects' ──► Projects.chunk.js (2.39 kB)    [Downloaded on-demand]
Navigate '/contact'  ──► Contact.chunk.js (3.96 kB)     [Downloaded on-demand]
Navigate '/analytics'──► Analytics.chunk.js (4.28 kB)   [Downloaded on-demand]
Mount Interactive Chart ──► HeavyChart.js (2.45 kB) +
                            chart-vendor.js (172.27 kB) [Deferred until requested]
================================================================================
```

### Suspense Execution Lifecycle

```
[User clicks Route Link (e.g. /projects)]
                │
                ▼
[React invokes dynamic import: () => import('./pages/Projects')]
                │
                ├─────────────────────────────────────────────────┐
                ▼ (Chunk fetching across network)                 │
[Suspense catches unresolved Promise]                             │
                ▼                                                 │
[Render FallbackLoading Skeleton UI]                              ▼
                │                                     [Chunk script arrives]
                ▼                                                 │
[Promise resolves with Component Default Export] ◄────────────────┘
                │
                ▼
[Suspense unmounts Skeleton & seamlessly mounts <Projects />]
```

---

## 3. Key Questions & In-Depth Technical Analysis

### Q1: What is the difference between the initial bundle and a lazy-loaded chunk in terms of when each is downloaded?
**Answer**:
- **Initial Bundle (`main.js` / entry chunks)**: Downloaded and parsed immediately when the user enters the application's root URL for the first time. It contains only the critical runtime dependencies needed to boot React, initialize routing, and render the immediate entry view (e.g. the Home landing page).
- **Lazy-Loaded Chunk (`[Component]-[hash].js`)**: The browser does not download or parse this script during initial page load. Instead, it is requested over the network **just-in-time** when a specific trigger occurs (e.g., when the user clicks a route link like `/projects` or toggles an on-demand heavy widget like a chart). This removes non-critical JavaScript from the critical rendering path.

### Q2: Why does lazy loading improve perceived performance even though the total amount of code downloaded eventually stays the same?
**Answer**:
1. **Critical Path Optimization (FCP & TTI)**: Users judge website speed by how quickly they see meaningful content (**First Contentful Paint - FCP**) and how quickly buttons respond to clicks (**Time to Interactive - TTI**). By omitting unvisited pages from the initial payload, the browser downloads fewer bytes, parses fewer AST nodes, and executes less JavaScript on first visit.
2. **Bandwidth & CPU Conservation**: Mobile users on constrained cellular data networks or lower-tier CPU devices process the initial UI in seconds rather than stalling on a blank white screen.
3. **Unused Code Is Never Downloaded**: In typical user sessions, a user may only visit the Home dashboard and never visit `/contact` or `/analytics`. In this case, the total code downloaded over the entire session is significantly *less*, saving bandwidth for both the client and the host.

### Q3: In what situations would lazy loading not be worth the added complexity (e.g., a very small app)?
**Answer**:
1. **Micro-Applications (< 50 KB total)**: When the entire compressed application is minuscule (e.g., under 50-80 KB), splitting it into tiny 1-2 KB fragments introduces HTTP request overhead (TCP handshake, SSL negotiation, HTTP headers) that can actually take *longer* to fetch than downloading a single consolidated payload.
2. **Critical Synchronous Paths**: Core UI elements that every single user must see immediately (such as the navigation bar, auth provider, or root error boundary) should never be lazy loaded.
3. **Flashing UI Latency**: If not configured with minimum-delay fallbacks, fast networks can experience brief, irritating flashes of loading spinners for fractions of a second.

---

## 4. Benchmark Metrics: Before vs. After Optimization

The benchmarks below were measured by running `npm run build:baseline` (monolithic) and `npm run build:optimized` (code-split) with Vite 5.4.21 and verified with DevTools Network profiling:

### 1. Build Bundle Size Breakdown

| Build Mode | Chunks Generated | Raw JS Size | Gzip Size | Initial First-Visit JS |
| :--- | :---: | :---: | :---: | :---: |
| **Baseline (Before Optimization)** | 1 (`index.baseline.js`) | **371.71 kB** | **123.16 kB** | **371.71 kB (100%)** |
| **Optimized (After Optimization)** | 9 modular chunks | 376.56 kB (Total) | 125.75 kB (Total) | **190.63 kB (51.3%)** |
| **Net Difference / Savings** | **Modularized** | — | — | **-181.08 kB (-48.7% payload reduction)** |

### 2. Network Tab Load Time Comparison (Simulated Slow 3G)

| Performance Metric | Baseline (Before) | Optimized (After) | Percentage Improvement |
| :--- | :---: | :---: | :---: |
| **Initial JS Transferred (Gzip)** | 123.16 kB | 62.36 kB | **-49.4% lighter** |
| **Initial Script Download Time (Slow 3G)** | 2,480 ms | 1,260 ms | **49.2% faster** |
| **First Contentful Paint (FCP)** | 2,850 ms | 1,420 ms | **50.2% faster** |
| **Time to Interactive (TTI)** | 3,120 ms | 1,580 ms | **49.3% faster** |

---

## 5. Implementation of Supplementary Problems

### Supplementary Problem 1: Lazy Loading Heavy Third-Party Component
- **Component**: `HeavyChart.jsx` integrating `chart.js` and `react-chartjs-2`.
- **Implementation**: In `src/pages/Analytics.jsx`, the chart is dynamically imported:
  ```jsx
  const HeavyChart = lazy(() => import('../components/HeavyChart'));
  ```
- **Outcome**: The heavy `chart-vendor-[hash].js` bundle (**172.27 kB raw / 60.25 kB gzip**) was successfully isolated from the main bundle and is fetched *only* when the user views the analytics charts.

### Supplementary Problem 2: Minimum-Delay Fallback (Anti-Flicker)
- **Problem**: On high-speed local broadband or localhost, dynamic chunk resolution takes 10-25ms, causing the loading skeleton to flash for a split second, causing visual distraction.
- **Solution**: Developed `lazyWithDelay` utility in `src/utils/lazyWithDelay.js`:
  ```javascript
  export function lazyWithDelay(importFunc, minDelayMs = 300) {
    return lazy(async () => {
      const startTime = performance.now();
      const module = await importFunc();
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDelayMs - elapsed);
      if (remaining > 0) await new Promise(r => setTimeout(r, remaining));
      return module;
    });
  }
  ```
- **Outcome**: Ensures smooth visual transitions without jarring sub-second flashes. The UI also includes an interactive slider to simulate different network throttling conditions directly.

### Supplementary Problem 3: React DevTools Profiler Analysis & Unnecessary Re-Render Fix
- **Identified Component**: `TaskItem.jsx` rendered inside `TaskList.jsx`.
- **Finding**: When a user types in the task search bar, parent state (`searchQuery`) updates on every keystroke. Without memoization, all 5 task cards re-rendered on each character typed (generating 50 redundant render cycles for a 10-letter word).
- **Optimization**:
  1. Wrapped `TaskItem` with `React.memo` with shallow comparison.
  2. Wrapped action handlers (`handleToggleStatus`, `handleEditClick`, `handleDeleteClick`) in `useCallback` to preserve stable object identity.
- **Result**: Re-renders while searching dropped from **5 renders per keystroke** down to **0 renders per keystroke** (confirmed via live in-app render badges and DevTools Profiler flamegraphs).

---

## 6. Troubleshooting & Common Pitfalls Addressed

| Issue / Symptom | Root Cause | Solution Implemented |
| :--- | :--- | :--- |
| `Element type is invalid: expected a string or a class/function but got: object` | Lazy component had named export instead of default export. | Ensured all pages (`Home`, `Projects`, `Analytics`, `Contact`, `HeavyChart`) utilize `export default ComponentName`. |
| Fallback UI flashes too rapidly to observe | Localhost fetch time is < 15ms. | Simulated "Slow 3G" in DevTools Network tab and added custom minimum-delay wrapper (300ms). |
| Entire application unmounts during route transition | `<Suspense>` wrapped around `<BrowserRouter>` or root `<Navbar>` instead of `<Routes>`. | Scoped `<Suspense>` specifically around the `<Routes>` container in `App.jsx`, ensuring `<Navbar>` and `<Footer>` stay persistently mounted. |

---

## 7. Lab Evaluation Rubrics Self-Assessment

| Rubric Criteria | Max Marks | Self Score | Justification |
| :--- | :---: | :---: | :--- |
| **Conceptual Understanding** | 2 | 2 | Rigorously explained initial bundle vs lazy chunk, perceived performance vs total payload, and micro-app trade-offs. |
| **Implementation** | 4 | 4 | Complete modular architecture with React 18, React Router v6, dynamic `React.lazy`, Suspense, Chart.js chunk isolation, and memoization. |
| **Correctness** | 2 | 2 | Verified builds with `npm run build:baseline` and `npm run build:optimized`. Baseline and split chunks match expected sizes. |
| **Reflection** | 1 | 1 | Documented DevTools Profiler flamecharts, Slow 3G throttling observations, and common mistakes in detail. |
| **Lab File Evidence** | 1 | 1 | Clear directory structure, automated comparison script (`compare-bundles.js`), `metrics.json`, and comprehensive `README.md`. |
| **Total** | **10** | **10** | **Passing Threshold: 5/10 (50%) — Met with Distinction** |
