import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PerformanceInspectorModal from './components/PerformanceInspectorModal';

// BASELINE: Statically imported upfront (No lazy loading, no code splitting)
import Home from './pages/Home';
import Projects from './pages/Projects';
import Analytics from './pages/Analytics';
import Contact from './pages/Contact';
import './App.css';

export default function AppEager() {
  const [isPerfModalOpen, setIsPerfModalOpen] = useState(false);

  return (
    <div className="app-layout baseline-mode">
      <div className="baseline-banner">
        ⚠️ <strong>BASELINE MODE (Before Optimization):</strong> All route components & libraries are bundled into a single monolithic bundle upfront.
      </div>

      <Navbar
        onOpenPerfInspector={() => setIsPerfModalOpen(true)}
        loadedChunksCount={1}
      />

      <main className="app-body">
        {/* Un-split Routes without Suspense */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <PerformanceInspectorModal
        isOpen={isPerfModalOpen}
        onClose={() => setIsPerfModalOpen(false)}
        loadedChunks={[{ name: 'main.bundle.js (All code bundled upfront)', timestamp: 'Mount' }]}
        simulatedDelay={0}
        setSimulatedDelay={() => {}}
      />
    </div>
  );
}
