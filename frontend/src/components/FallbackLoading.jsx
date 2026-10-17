import React from 'react';

/**
 * Meaningful Fallback UI for React.lazy() and Suspense
 * 
 * Provides an aesthetic skeleton loader with shimmer effects,
 * progress bar indicator, and technical context explaining the chunk load.
 */
export default function FallbackLoading({ message = 'Loading lazy component chunk...', estimatedSize = '~25 KB' }) {
  return (
    <div className="fallback-container" role="status" aria-live="polite">
      <div className="fallback-card">
        {/* Animated Spinner & Status Header */}
        <div className="fallback-header">
          <div className="fallback-spinner-ring">
            <div className="spinner-core"></div>
          </div>
          <div className="fallback-header-text">
            <h3 className="fallback-title">Loading Route Chunk</h3>
            <p className="fallback-subtitle">{message}</p>
          </div>
          <span className="fallback-badge">Code-Split Chunk {estimatedSize}</span>
        </div>

        {/* Skeleton Shimmer Blocks */}
        <div className="skeleton-grid">
          <div className="skeleton-card shimmer">
            <div className="skeleton-bar title-bar"></div>
            <div className="skeleton-bar text-bar-long"></div>
            <div className="skeleton-bar text-bar-short"></div>
          </div>
          <div className="skeleton-card shimmer">
            <div className="skeleton-bar title-bar"></div>
            <div className="skeleton-bar text-bar-long"></div>
            <div className="skeleton-bar text-bar-short"></div>
          </div>
          <div className="skeleton-card shimmer">
            <div className="skeleton-bar title-bar"></div>
            <div className="skeleton-bar text-bar-long"></div>
            <div className="skeleton-bar text-bar-short"></div>
          </div>
        </div>

        {/* Informative Code Splitting Education Banner */}
        <div className="fallback-info-footer">
          <svg className="info-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>React.Suspense Boundary Active:</strong> This component code was excluded from <code>main.bundle.js</code> and is being fetched asynchronously on-demand.
          </span>
        </div>
      </div>
    </div>
  );
}
