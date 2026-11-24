import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  COUNTRIES,
  ORIENTATIONS,
  STORAGE_OPTIONS,
  DEFAULT_SOLAR_INPUT,
  PV_SELF_GENERATION_COST,
  clamp,
  formatDeNumber,
  parseDeNumber,
  getTiltFactor,
  getClippingFactor,
  getVdeCompliance,
  calculateSolar,
  calculateAppliance,
  calculateEv,
  loadBenchmarks,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');

function parseCsvLines(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  const lines = raw.split(/\r?\n/);
  const parseRow = (line) => {
    const out = [];
    let curr = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          curr += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          curr += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        out.push(curr);
        curr = '';
      } else {
        curr += ch;
      }
    }
    out.push(curr);
    return out;
  };
  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cols = parseRow(line);
    assert.equal(cols.length, headers.length, `CSV Spaltenanzahl stimmt nicht überein in ${path.basename(filePath)}`);
    return Object.fromEntries(headers.map((h, idx) => [h, cols[idx]]));
  });
  return { headers, rows };
}

test('Hilfsfunktionen: clamp, formatDeNumber und parseDeNumber', () => {
  assert.equal(clamp(5, 1, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(42, 0, 10), 10);

  assert.equal(formatDeNumber(1600), '1.600');
  assert.equal(formatDeNumber(37.3, 1), '37,3');
  assert.equal(formatDeNumber(Number.NaN), '0');

  assert.equal(parseDeNumber('37,3 ct', 0), 37.3);
  assert.equal(parseDeNumber('0.373', 0), 0.373);
  assert.equal(parseDeNumber('1.250,50 €', 0), 1250.5);
  assert.equal(parseDeNumber('1.600', 0), 1600);
  assert.equal(parseDeNumber('1,250.75', 0), 1250.75);
  assert.equal(parseDeNumber('', 99), 99);
  assert.equal(parseDeNumber(undefined, 42), 42);
  assert.equal(parseDeNumber(Number.POSITIVE_INFINITY, 10), 10);
});

test('Solar-Faktoren: Neigung (getTiltFactor) und Clipping (getClippingFactor)', () => {
  assert.equal(getTiltFactor(0), 0.88);
  assert.equal(getTiltFactor(35), 1.0);
  assert.equal(getTiltFactor(90), 0.72);
  assert.equal(getTiltFactor(-10), 0.88);
  assert.equal(getTiltFactor(120), 0.72);
  assert.equal(getTiltFactor(67.5), 0.87);

  assert.equal(getClippingFactor(800, 800), 1.0);
  assert.equal(getClippingFactor(1000, 800), 1.0);
  assert.equal(getClippingFactor(1600, 800), 0.94);
  assert.equal(getClippingFactor(2000, 800), 0.9);
  assert.equal(getClippingFactor(2000, 600), 0.85);
});

test('Normprüfung DIN VDE V 0126-95 (DE/AT) und ESTI (CH)', () => {
  const schuko = getVdeCompliance(800, 800, 0, 'DE');
  assert.equal(schuko.status, 'schuko');
  assert.equal(schuko.storageNote, undefined);

  const schukoLimit = getVdeCompliance(960, 800, 1.6, 'DE');
  assert.equal(schukoLimit.status, 'schuko');
  assert.ok(schukoLimit.storageNote?.includes('VDE-AR-N 4105'));

  const wieland = getVdeCompliance(1600, 800, 1.6, 'DE');
  assert.equal(wieland.status, 'wieland');
  assert.ok(wieland.headline.includes('1.600 Wp'));

  const ch600 = getVdeCompliance(800, 600, 0, 'CH');
  assert.equal(ch600.status, 'ch-esti');
  assert.ok(ch600.badge.includes('≤ 600 W'));

  const ch800 = getVdeCompliance(1600, 800, 0, 'CH');
  assert.equal(ch800.status, 'ch-esti');
  assert.ok(ch800.headline.includes('600 W'));
});

test('2026 Referenz-Szenario 1: 800 Wp ohne Speicher vs. 2.000 Wp + 2,0 kWh Speicher (DE)', () => {
  const res800 = calculateSolar({
    country: 'DE',
    moduleWp: 800,
    inverterW: 800,
    orientation: 'sued',
    tiltDeg: 35,
    storageKwh: 0,
    householdKwh: 3500,
    pricePerKwh: 0.373,
    costWithoutStorage: 349,
    costWithStorage: 999,
  });

  assert.equal(res800.annualYieldKwh, 792);
  assert.equal(res800.selfUsedWithoutKwh, 570);
  assert.equal(res800.paybackWithoutYears, 1.6);
  assert.equal(res800.net10Without, 1729);
  assert.equal(res800.comparisonStorageKwh, 1.6);
  assert.equal(res800.compliance.status, 'schuko');
  assert.equal(res800.years.length, 11);

  const res2000 = calculateSolar({
    country: 'DE',
    moduleWp: 2000,
    inverterW: 800,
    orientation: 'sued',
    tiltDeg: 35,
    storageKwh: 2.0,
    householdKwh: 3500,
    pricePerKwh: 0.373,
    costWithoutStorage: 699,
    costWithStorage: 1399,
  });

  assert.equal(res2000.annualYieldKwh, 1782);
  assert.equal(res2000.clippingFactor, 0.9);
  assert.equal(res2000.selfUsedWithoutKwh, 989);
  assert.equal(res2000.selfUsedWithKwh, 1376);
  assert.equal(res2000.paybackWithoutYears, 1.9);
  assert.equal(res2000.paybackWithYears, 2.7);
  assert.equal(res2000.crossoverYear, 4.9);
  assert.equal(res2000.net10Without, 2907);
  assert.equal(res2000.net10With, 3618);
  assert.equal(res2000.compliance.status, 'wieland');
  assert.ok(res2000.net10With > res2000.net10Without);
});

test('2026 Referenz-Szenario 2: Standard-Set 1.600 Wp + 1,6 kWh Speicher & Grenzwerte', () => {
  const def = calculateSolar();
  assert.equal(def.input.moduleWp, DEFAULT_SOLAR_INPUT.moduleWp);
  assert.equal(def.annualYieldKwh, 1489);
  assert.equal(def.selfUsedWithoutKwh, 907);
  assert.equal(def.selfUsedWithKwh, 1217);
  assert.equal(def.paybackWithoutYears, 1.6);
  assert.equal(def.paybackWithYears, 2.7);
  assert.equal(def.crossoverYear, 5.7);
  assert.equal(def.net10Without, 2758);
  assert.equal(def.net10With, 3238);
  assert.equal(def.storageBoostKwh, 310);

  const slow = calculateSolar({
    country: 'AT',
    moduleWp: 400,
    inverterW: 600,
    orientation: 'ost',
    tiltDeg: 90,
    storageKwh: 1.0,
    householdKwh: 1200,
    pricePerKwh: 0.15,
    costWithoutStorage: 4500,
    costWithStorage: 7500,
  });
  assert.equal(slow.paybackWithoutYears, null);
  assert.equal(slow.paybackWithYears, null);
  assert.equal(slow.input.country, 'AT');
  assert.ok(ORIENTATIONS.ost.factor === 0.8);
  assert.deepEqual([...STORAGE_OPTIONS], [0, 1.0, 1.6, 2.0, 3.2]);
});

test('2026 Referenz-Szenario 3: Haushaltsgeräte (Wärmepumpentrockner & Kühlschrank Alt vs. Neu)', () => {
  const dryer = calculateAppliance({
    country: 'DE',
    watt: 900,
    hoursPerDay: 1.6,
    daysPerYear: 160,
    oldDeviceWatt: 2150,
    replacementCost: 599,
  });

  assert.equal(Number(dryer.kwhPerYear.toFixed(1)), 230.4);
  assert.equal(Number(dryer.costPerYear.toFixed(2)), 85.94);
  assert.equal(Number(dryer.oldCostPerYear.toFixed(2)), 205.30);
  assert.equal(Number(dryer.annualSavingByReplacement.toFixed(2)), 119.36);
  assert.equal(dryer.replacementPaybackYears, 5.0);
  assert.equal(dryer.co2KgPerYear, 84);

  const fridge = calculateAppliance({
    country: 'DE',
    watt: 17,
    hoursPerDay: 24,
    daysPerYear: 365,
    oldDeviceWatt: 48,
    replacementCost: 699,
  });
  assert.equal(Number(fridge.costPerYear.toFixed(2)), 55.55);
  assert.equal(fridge.replacementPaybackYears, 6.9);

  const noSaving = calculateAppliance({ watt: 1000, oldDeviceWatt: 800, replacementCost: 500 });
  assert.equal(noSaving.annualSavingByReplacement, 0);
  assert.equal(noSaving.replacementPaybackYears, null);
});

test('2026 Referenz-Szenario 4: E-Auto Ladekosten (VW ID.3 Pro & Tesla Model Y vs. Verbrenner)', () => {
  const id3 = calculateEv({
    country: 'DE',
    annualKm: 15000,
    evKwhPer100: 17.8,
    iceLitersPer100: 6.4,
  });

  assert.equal(id3.evKwhPerYear, 2670);
  assert.equal(Number(id3.cost100Home.toFixed(2)), 6.64);
  assert.equal(Number(id3.cost100Mix.toFixed(2)), 6.63);
  assert.equal(Number(id3.cost100Ice.toFixed(2)), 11.20);
  assert.equal(Math.round(id3.annualSavingMixVsIce), 686);
  assert.equal(PV_SELF_GENERATION_COST, 0.08);

  const modelY = calculateEv({
    country: 'DE',
    annualKm: 15000,
    evKwhPer100: 18.4,
    iceLitersPer100: 7.8,
  });
  assert.equal(Math.round(modelY.annualSavingMixVsIce), 1020);

  const allPublic = calculateEv({
    country: 'CH',
    publicSharePct: 100,
    pvSharePct: 50,
  });
  assert.equal(Number(allPublic.effectivePricePerKwh.toFixed(3)), COUNTRIES.CH.defaultPublicFastPrice);
  assert.equal(Number(allPublic.cost100Mix.toFixed(4)), Number(allPublic.cost100Public.toFixed(4)));
});

test('Datensatz-Integrität: benchmarks-2026.json und alle 3 CSV-Dateien', () => {
  const benchmarks = loadBenchmarks();
  assert.equal(benchmarks.updated_at, '2026-11-24');
  assert.equal(benchmarks.data_year, 2026);
  assert.deepEqual(benchmarks.jurisdiction, ['DE', 'CH', 'AT']);
  assert.equal(benchmarks.reference_calculator, 'https://kwhkostenrechner.com');
  assert.equal(benchmarks.countries.DE.defaultElectricityPrice, 0.373);
  assert.equal(benchmarks.countries.CH.defaultElectricityPrice, 0.277);
  assert.equal(benchmarks.countries.AT.defaultElectricityPrice, 0.27);
  assert.equal(benchmarks.hardware_specs.length, 4);
  assert.equal(benchmarks.locations.length, 20);
  assert.ok(benchmarks.sources.bdew.url.startsWith('https://'));
  assert.ok(benchmarks.sources.vde_0126_95.url.startsWith('https://'));
  assert.ok(benchmarks.sources.pvgis.url.startsWith('https://'));

  const locationsCsv = parseCsvLines(path.join(DATA_DIR, 'solar-locations-dach.csv'));
  assert.equal(locationsCsv.rows.length, 20);
  const bayern = locationsCsv.rows.find((r) => r.slug === 'bayern');
  assert.ok(bayern);
  assert.equal(Number(bayern.specific_yield_kwh_per_kwp), 1080);

  const appliancesCsv = parseCsvLines(path.join(DATA_DIR, 'appliances-wattage-de.csv'));
  assert.equal(appliancesCsv.rows.length, 40);
  for (const row of appliancesCsv.rows) {
    assert.ok(Number(row.watt) > 0, `Ungültige Wattzahl für ${row.slug}`);
    assert.ok(Number(row.annual_kwh_default) > 0, `Ungültiger Jahresverbrauch für ${row.slug}`);
  }

  const evCsv = parseCsvLines(path.join(DATA_DIR, 'ev-models-de.csv'));
  assert.equal(evCsv.rows.length, 20);
  const vwId3 = evCsv.rows.find((r) => r.slug === 'vw-id-3');
  assert.ok(vwId3);
  assert.equal(Number(vwId3.real_kwh_per_100km), 17.8);
  assert.equal(Number(vwId3.comparable_ice_l_per_100km), 6.4);
});
