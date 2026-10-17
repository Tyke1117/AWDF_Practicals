import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = entries.flatMap((entry) => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory() ? getFiles(res) : res;
  });
  return files;
}

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2) + ' kB';
}

function analyzeDir(distDir) {
  const allFiles = getFiles(distDir);
  const jsFiles = allFiles.filter((f) => f.endsWith('.js'));
  const cssFiles = allFiles.filter((f) => f.endsWith('.css'));

  const details = jsFiles.map((file) => {
    const content = fs.readFileSync(file);
    const size = content.length;
    const gzipSize = zlib.gzipSync(content).length;
    return {
      fileName: path.basename(file),
      size,
      gzipSize
    };
  });

  const totalJsSize = details.reduce((acc, f) => acc + f.size, 0);
  const totalJsGzip = details.reduce((acc, f) => acc + f.gzipSize, 0);

  return { details, totalJsSize, totalJsGzip, count: jsFiles.length };
}

console.log('\n===============================================================');
console.log('   PRACTICAL 8: BUNDLE SIZE & PERFORMANCE BENCHMARK REPORT    ');
console.log('===============================================================\n');

const baselineDir = path.resolve(__dirname, '../dist-baseline');
const optimizedDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(baselineDir) || !fs.existsSync(optimizedDir)) {
  console.error('Error: Please ensure both builds exist. Run:');
  console.error('  npm run build:baseline && npm run build:optimized\n');
  process.exit(1);
}

const baseline = analyzeDir(baselineDir);
const optimized = analyzeDir(optimizedDir);

console.log('--- 1. BASELINE BUILD (Monolithic Single Bundle - Before Optimization) ---');
console.table(
  baseline.details.map((f) => ({
    'File Name': f.fileName,
    'Raw Size': formatBytes(f.size),
    'Gzipped Size': formatBytes(f.gzipSize)
  }))
);
console.log(`Total Baseline JS: ${formatBytes(baseline.totalJsSize)} (Gzipped: ${formatBytes(baseline.totalJsGzip)})\n`);

console.log('--- 2. OPTIMIZED BUILD (React.lazy + Suspense Code-Splitting) ---');
console.table(
  optimized.details.map((f) => ({
    'Chunk Name': f.fileName,
    'Raw Size': formatBytes(f.size),
    'Gzipped Size': formatBytes(f.gzipSize)
  }))
);

// Calculate Initial Load vs Total Deferred
// On initial visit to '/', browser loads entry JS + router vendor + Home chunk.
// Projects, Analytics, Contact, and Chart-vendor are NOT loaded.
const initialChunks = optimized.details.filter(
  (f) =>
    f.fileName.startsWith('index-') ||
    f.fileName.startsWith('router-vendor-') ||
    f.fileName.startsWith('Home-') ||
    f.fileName.startsWith('api-')
);
const initialSize = initialChunks.reduce((acc, f) => acc + f.size, 0);
const initialGzip = initialChunks.reduce((acc, f) => acc + f.gzipSize, 0);

const deferredChunks = optimized.details.filter((f) => !initialChunks.includes(f));
const deferredSize = deferredChunks.reduce((acc, f) => acc + f.size, 0);
const deferredGzip = deferredChunks.reduce((acc, f) => acc + f.gzipSize, 0);

const initialReductionBytes = baseline.totalJsSize - initialSize;
const initialReductionPercent = ((initialReductionBytes / baseline.totalJsSize) * 100).toFixed(1);

const gzipReductionBytes = baseline.totalJsGzip - initialGzip;
const gzipReductionPercent = ((gzipReductionBytes / baseline.totalJsGzip) * 100).toFixed(1);

console.log('--- 3. INITIAL PAYLOAD REDUCTION COMPARISON ---');
console.table([
  {
    Metric: 'Initial JS Transferred on First Visit (Raw)',
    'Baseline (Before)': formatBytes(baseline.totalJsSize),
    'Optimized (After)': formatBytes(initialSize),
    'Saved / Deferred': `-${formatBytes(initialReductionBytes)} (${initialReductionPercent}% reduction)`
  },
  {
    Metric: 'Initial JS Transferred on First Visit (Gzip)',
    'Baseline (Before)': formatBytes(baseline.totalJsGzip),
    'Optimized (After)': formatBytes(initialGzip),
    'Saved / Deferred': `-${formatBytes(gzipReductionBytes)} (${gzipReductionPercent}% reduction)`
  }
]);

console.log('--- 4. ON-DEMAND / DEFERRED CHUNKS BREAKDOWN ---');
console.table(
  deferredChunks.map((f) => ({
    'Deferred Chunk': f.fileName,
    'Downloaded When': f.fileName.includes('Projects')
      ? 'User visits /projects route'
      : f.fileName.includes('Analytics')
      ? 'User visits /analytics route'
      : f.fileName.includes('Contact')
      ? 'User visits /contact route'
      : f.fileName.includes('HeavyChart')
      ? 'User views interactive chart'
      : f.fileName.includes('chart-vendor')
      ? 'Heavy Chart.js library deferred'
      : 'On-demand interaction',
    'Size': formatBytes(f.size),
    'Gzip': formatBytes(f.gzipSize)
  }))
);

console.log(`\nSuccess: Code splitting reduced upfront initial bundle payload by ${initialReductionPercent}%!`);
console.log('===============================================================\n');
