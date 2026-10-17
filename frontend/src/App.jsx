import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import FallbackLoading from './components/FallbackLoading';
import PerformanceInspectorModal from './components/PerformanceInspectorModal';
import './App.css';

/**
 * Step 3: Convert route imports to lazy imports using React.lazy()
 * 
 * Each component is dynamically imported with import(), creating isolated chunk files:
 * - Home.chunk.js
 * - Projects.chunk.js
 * - Analytics.chunk.js
 * - Contact.chunk.js
 */

// Helper to support Supplementary Problem 2 (Artificial Latency / Min Delay fallback simulation)
let globalSimulatedDelay = 0;

const Home = lazy(async () => {
  if (globalSimulatedDelay > 0) {
    await new Promise((r) => setTimeout(r, globalSimulatedDelay));
  }
  return import('./pages/Home');
});

const Projects = lazy(async () => {
  if (globalSimulatedDelay > 0) {
    await new Promise((r) => setTimeout(r, globalSimulatedDelay));
  }
  return import('./pages/Projects');
});

const Analytics = lazy(async () => {
  if (globalSimulatedDelay > 0) {
    await new Promise((r) => setTimeout(r, globalSimulatedDelay));
  }
  return import('./pages/Analytics');
});

const Contact = lazy(async () => {
  if (globalSimulatedDelay > 0) {
    await new Promise((r) => setTimeout(r, globalSimulatedDelay));
  }
  return import('./pages/Contact');
});

export default function App() {
  const location = useLocation();
  const [isPerfModalOpen, setIsPerfModalOpen] = useState(false);
  const [simulatedDelay, setSimulatedDelay] = useState(300); // 300ms default min-delay (Supplementary Problem 2)
  const [loadedChunks, setLoadedChunks] = useState([
    { name: 'main.bundle.js (Core React Runtime)', timestamp: new Date().toLocaleTimeString() }
  ]);

  // Keep global latency in sync for dynamic imports
  useEffect(() => {
    globalSimulatedDelay = simulatedDelay;
  }, [simulatedDelay]);

  // Log newly downloaded chunk as routes change
  useEffect(() => {
    const routeChunkMap = {
      '/': 'Home.chunk.js',
      '/projects': 'Projects.chunk.js',
      '/analytics': 'Analytics.chunk.js',
      '/contact': 'Contact.chunk.js'
    };
    const chunkName = routeChunkMap[location.pathname] || 'Unknown.chunk.js';

    setLoadedChunks((prev) => {
      if (prev.some((c) => c.name.startsWith(chunkName))) return prev;
      return [
        ...prev,
        {
          name: `${chunkName} (Route: ${location.pathname})`,
          timestamp: new Date().toLocaleTimeString()
        }
      ];
    });
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar
        onOpenPerfInspector={() => setIsPerfModalOpen(true)}
        loadedChunksCount={loadedChunks.length}
      />

      {/* Main Content Area Wrapped with Suspense */}
      <main className="app-body">
        {/*
          Step 4: Wrap the Routes block with Suspense and a meaningful fallback UI
          Whenever an un-downloaded route chunk is accessed, Suspense catches the promise
          and displays FallbackLoading until the chunk script resolves.
        */}
        <Suspense fallback={<FallbackLoading message={`Fetching chunk for ${location.pathname}...`} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </main>

      {/* Performance & Architecture Monitor Modal */}
      <PerformanceInspectorModal
        isOpen={isPerfModalOpen}
        onClose={() => setIsPerfModalOpen(false)}
        loadedChunks={loadedChunks}
        simulatedDelay={simulatedDelay}
        setSimulatedDelay={setSimulatedDelay}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p>
            <strong>Practical 8: Performance Optimization and Lazy Loading in React</strong> • CO1 / PO3, PO5
          </p>
          <div className="footer-stats">
            <span className="badge-tech">React 18.2</span>
            <span className="badge-tech">Vite 5</span>
            <span className="badge-tech">Code Splitting: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
