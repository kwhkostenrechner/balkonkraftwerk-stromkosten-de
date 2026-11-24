import { readFileSync } from 'node:fs';

export { COUNTRIES, clamp, formatDeNumber, parseDeNumber } from './countries.js';
export {
  ORIENTATIONS,
  STORAGE_OPTIONS,
  DEFAULT_SOLAR_INPUT,
  getTiltFactor,
  getClippingFactor,
  getVdeCompliance,
  calculateSolar,
} from './solar.js';
export { calculateAppliance } from './appliances.js';
export { PV_SELF_GENERATION_COST, calculateEv } from './ev.js';

/**
 * Lädt den enthaltenen JSON-Referenzdatensatz (DACH 2026 Benchmarks).
 * @returns {import('./index.d.ts').BenchmarksDataset}
 */
export function loadBenchmarks() {
  const url = new URL('../data/benchmarks-2026.json', import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8'));
}
