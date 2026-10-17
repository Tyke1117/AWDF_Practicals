import { lazy } from 'react';

/**
 * Supplementary Problem 2: Minimum-Delay Fallback
 * 
 * Prevents the "flash of loading state" (flicker) on high-speed connections.
 * If a chunk downloads in 20ms, showing and removing a fallback in 20ms produces
 * visual jarring. By enforcing a minimum delay (e.g., 300ms), the UI transition
 * remains calm, predictable, and visually polished.
 *
 * @param {Function} importFunc - Dynamic import factory, e.g., () => import('./Page')
 * @param {number} minDelayMs - Minimum duration to maintain fallback (default: 300ms)
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithDelay(importFunc, minDelayMs = 300) {
  return lazy(async () => {
    const startTime = performance.now();
    const module = await importFunc();
    const elapsedTime = performance.now() - startTime;
    const remainingDelay = Math.max(0, minDelayMs - elapsedTime);

    if (remainingDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingDelay));
    }
    return module;
  });
}

/**
 * Configurable helper allowing dynamic delay simulation from the UI
 * e.g., simulating Slow 3G (1500ms delay) directly in React.
 */
export function createConfigurableLazy(importFunc, getDelayMs = () => 0) {
  return lazy(async () => {
    const delay = getDelayMs();
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return await importFunc();
  });
}
