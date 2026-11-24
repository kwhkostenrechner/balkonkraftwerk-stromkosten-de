import { COUNTRIES, clamp } from './countries.js';

/** Angesetzte Gestehungskosten für eigenen PV-/Balkonkraftwerk-Ladestrom (€/kWh bzw. CHF/kWh). */
export const PV_SELF_GENERATION_COST = 0.08;

/**
 * Vergleicht jährliche Energiekosten und 100-km-Kosten eines Elektroautos
 * (Hausstrom, PV-Mix und öffentliches DC-Schnellladen) mit einem Verbrenner.
 *
 * @param {Partial<import('./index.d.ts').EvCalcInput>} [raw={}]
 * @returns {import('./index.d.ts').EvCalcResult}
 */
export function calculateEv(raw = {}) {
  const country = raw.country && COUNTRIES[raw.country] ? raw.country : 'DE';
  const cfg = COUNTRIES[country];

  const annualKm = clamp(raw.annualKm ?? 15000, 1000, 80000);
  const evKwhPer100 = clamp(raw.evKwhPer100 ?? 18.0, 10, 35);
  const homeElectricityPrice = clamp(raw.homeElectricityPrice ?? cfg.defaultElectricityPrice, 0.10, 0.90);
  const pvSharePct = clamp(raw.pvSharePct ?? 15, 0, 80);
  const publicDcPrice = clamp(raw.publicDcPrice ?? cfg.defaultPublicFastPrice, 0.25, 1.10);
  const publicSharePct = clamp(raw.publicSharePct ?? 20, 0, 100);
  const iceLitersPer100 = clamp(raw.iceLitersPer100 ?? 7.0, 3.5, 16);
  const fuelPricePerLiter = clamp(raw.fuelPricePerLiter ?? cfg.defaultFuelPrice, 1.0, 3.0);

  const pvShare = Math.min(pvSharePct, 100 - publicSharePct) / 100;
  const pubShare = publicSharePct / 100;
  const gridHomeShare = Math.max(0, 1 - pvShare - pubShare);

  const effectivePricePerKwh =
    gridHomeShare * homeElectricityPrice + pvShare * PV_SELF_GENERATION_COST + pubShare * publicDcPrice;

  const evKwhPerYear = (annualKm / 100) * evKwhPer100;
  const cost100Home = evKwhPer100 * homeElectricityPrice;
  const cost100Mix = evKwhPer100 * effectivePricePerKwh;
  const cost100Public = evKwhPer100 * publicDcPrice;
  const cost100Ice = iceLitersPer100 * fuelPricePerLiter;

  const annualCostHome = (annualKm / 100) * cost100Home;
  const annualCostMix = (annualKm / 100) * cost100Mix;
  const annualCostPublic = (annualKm / 100) * cost100Public;
  const annualCostIce = (annualKm / 100) * cost100Ice;

  return {
    evKwhPerYear,
    cost100Home,
    cost100Mix,
    cost100Public,
    cost100Ice,
    annualCostHome,
    annualCostMix,
    annualCostPublic,
    annualCostIce,
    annualSavingMixVsIce: annualCostIce - annualCostMix,
    annualSavingHomeVsIce: annualCostIce - annualCostHome,
    effectivePricePerKwh,
  };
}
