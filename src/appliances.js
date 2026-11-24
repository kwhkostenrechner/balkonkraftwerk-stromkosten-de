import { COUNTRIES, clamp } from './countries.js';

/**
 * Berechnet Stromverbrauch, laufende Stromkosten (Stunde, Tag, Monat, Jahr),
 * CO2-Emissionen sowie die Austausch-Amortisation gegenüber einem Altgerät.
 *
 * @param {Partial<import('./index.d.ts').ApplianceCalcInput>} [raw={}]
 * @returns {import('./index.d.ts').ApplianceCalcResult}
 */
export function calculateAppliance(raw = {}) {
  const country = raw.country && COUNTRIES[raw.country] ? raw.country : 'DE';
  const cfg = COUNTRIES[country];

  const watt = clamp(raw.watt ?? 1200, 1, 25000);
  const hoursPerDay = clamp(raw.hoursPerDay ?? 1, 0.05, 24);
  const daysPerYear = clamp(raw.daysPerYear ?? 365, 1, 365);
  const pricePerKwh = clamp(raw.pricePerKwh ?? cfg.defaultElectricityPrice, 0.05, 1.2);
  const oldDeviceWatt = clamp(raw.oldDeviceWatt ?? Math.round(watt * 1.45), 1, 30000);
  const replacementCost = clamp(raw.replacementCost ?? 450, 0, 15000);

  const kwhPerHour = watt / 1000;
  const kwhPerDay = kwhPerHour * hoursPerDay;
  const kwhPerYear = kwhPerDay * daysPerYear;
  const kwhPerMonth = kwhPerYear / 12;

  const costPerHour = kwhPerHour * pricePerKwh;
  const costPerDay = kwhPerDay * pricePerKwh;
  const costPerMonth = kwhPerMonth * pricePerKwh;
  const costPerYear = kwhPerYear * pricePerKwh;

  const oldKwhPerYear = (oldDeviceWatt / 1000) * hoursPerDay * daysPerYear;
  const oldCostPerYear = oldKwhPerYear * pricePerKwh;
  const annualSavingByReplacement = Math.max(0, oldCostPerYear - costPerYear);
  const replacementPaybackYears =
    annualSavingByReplacement > 1 && replacementCost > 0
      ? Number((replacementCost / annualSavingByReplacement).toFixed(1))
      : null;

  const co2KgPerYear = Math.round((kwhPerYear * cfg.co2GramsPerKwh) / 1000);

  return {
    kwhPerHour,
    kwhPerDay,
    kwhPerMonth,
    kwhPerYear,
    costPerHour,
    costPerDay,
    costPerMonth,
    costPerYear,
    oldKwhPerYear,
    oldCostPerYear,
    annualSavingByReplacement,
    replacementPaybackYears,
    co2KgPerYear,
  };
}
