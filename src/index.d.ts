export type CountryCode = 'DE' | 'CH' | 'AT';

export interface CountryConfig {
  readonly code: CountryCode;
  readonly name: string;
  readonly shortLabel: string;
  readonly currency: '€' | 'CHF';
  readonly currencyIso: 'EUR' | 'CHF';
  readonly subunit: 'ct' | 'Rp.';
  readonly defaultElectricityPrice: number;
  readonly defaultElectricityCt: number;
  readonly defaultPublicFastPrice: number;
  readonly defaultFuelPrice: number;
  readonly defaultYieldPerKwp: number;
  readonly co2GramsPerKwh: number;
  readonly priceSource: string;
  readonly vdeHint: string;
}

export declare const COUNTRIES: Readonly<Record<CountryCode, CountryConfig>>;

export declare function clamp(value: number, min: number, max: number): number;
export declare function formatDeNumber(value: number, decimals?: number): string;
export declare function parseDeNumber(raw: string | number | null | undefined, fallback: number): number;

export type OrientationKey = 'sued' | 'sued-ost' | 'sued-west' | 'ost-west' | 'ost' | 'west';

export interface OrientationMeta {
  readonly key: OrientationKey;
  readonly label: string;
  readonly azimuthLabel: string;
  readonly factor: number;
}

export declare const ORIENTATIONS: Readonly<Record<OrientationKey, OrientationMeta>>;
export declare const STORAGE_OPTIONS: readonly [0, 1.0, 1.6, 2.0, 3.2];

export interface SolarInput {
  country: CountryCode;
  moduleWp: number;
  inverterW: 600 | 800;
  orientation: OrientationKey;
  tiltDeg: number;
  storageKwh: number;
  householdKwh: number;
  pricePerKwh: number;
  costWithoutStorage: number;
  costWithStorage: number;
  specificYieldPerKwp?: number;
}

export interface YearPoint {
  year: number;
  cumWithout: number;
  cumWith: number;
  annualSavingWithout: number;
  annualSavingWith: number;
}

export interface VdeCompliance {
  status: 'schuko' | 'wieland' | 'ch-esti';
  badge: string;
  headline: string;
  detail: string;
  storageNote?: string;
}

export interface SolarResult {
  input: SolarInput;
  specificYieldPerKwp: number;
  orientationFactor: number;
  tiltFactor: number;
  clippingFactor: number;
  annualYieldKwh: number;
  selfRateWithout: number;
  selfRateWith: number;
  selfUsedWithoutKwh: number;
  selfUsedWithKwh: number;
  annualSavingWithout: number;
  annualSavingWith: number;
  paybackWithoutYears: number | null;
  paybackWithYears: number | null;
  crossoverYear: number | null;
  net10Without: number;
  net10With: number;
  co2SavedWithoutKg: number;
  co2SavedWithKg: number;
  monthsSavedWithout: number;
  monthsSavedWith: number;
  storageBoostKwh: number;
  years: YearPoint[];
  compliance: VdeCompliance;
  comparisonStorageKwh: number;
}

export declare const DEFAULT_SOLAR_INPUT: Readonly<SolarInput>;
export declare function getTiltFactor(tiltDeg: number): number;
export declare function getClippingFactor(moduleWp: number, inverterW: number): number;
export declare function getVdeCompliance(
  moduleWp: number,
  inverterW: 600 | 800,
  storageKwh: number,
  country: CountryCode
): VdeCompliance;
export declare function calculateSolar(rawInput?: Partial<SolarInput>): SolarResult;

export interface ApplianceCalcInput {
  country: CountryCode;
  watt: number;
  hoursPerDay: number;
  daysPerYear: number;
  pricePerKwh: number;
  oldDeviceWatt: number;
  replacementCost: number;
}

export interface ApplianceCalcResult {
  kwhPerHour: number;
  kwhPerDay: number;
  kwhPerMonth: number;
  kwhPerYear: number;
  costPerHour: number;
  costPerDay: number;
  costPerMonth: number;
  costPerYear: number;
  oldKwhPerYear: number;
  oldCostPerYear: number;
  annualSavingByReplacement: number;
  replacementPaybackYears: number | null;
  co2KgPerYear: number;
}

export declare function calculateAppliance(raw?: Partial<ApplianceCalcInput>): ApplianceCalcResult;

export declare const PV_SELF_GENERATION_COST: number;

export interface EvCalcInput {
  country: CountryCode;
  annualKm: number;
  evKwhPer100: number;
  homeElectricityPrice: number;
  pvSharePct: number;
  publicDcPrice: number;
  publicSharePct: number;
  iceLitersPer100: number;
  fuelPricePerLiter: number;
}

export interface EvCalcResult {
  evKwhPerYear: number;
  cost100Home: number;
  cost100Mix: number;
  cost100Public: number;
  cost100Ice: number;
  annualCostHome: number;
  annualCostMix: number;
  annualCostPublic: number;
  annualCostIce: number;
  annualSavingMixVsIce: number;
  annualSavingHomeVsIce: number;
  effectivePricePerKwh: number;
}

export declare function calculateEv(raw?: Partial<EvCalcInput>): EvCalcResult;

export interface HardwareSpecBenchmark {
  id: string;
  brand: string;
  model: string;
  category: string;
  mppt_spec: string;
  max_pv_input: string;
  ac_output: string;
  storage_spec: string;
  protection_and_warranty: string;
  source_label: string;
}

export interface LocationBenchmark {
  slug: string;
  name: string;
  region_type: string;
  country: CountryCode;
  specific_yield_kwh_per_kwp: number;
  sunshine_hours_per_year: number;
  default_price_per_kwh: number;
  subsidy_note: string;
}

export interface BenchmarksDataset {
  schema_version: string;
  updated_at: string;
  data_year: number;
  jurisdiction: CountryCode[];
  license: string;
  reference_calculator: string;
  sources: Record<string, { name: string; url: string; scope: string }>;
  countries: Record<CountryCode, CountryConfig>;
  regulations: Record<string, unknown>;
  solar_model_parameters: Record<string, unknown>;
  hardware_specs: HardwareSpecBenchmark[];
  locations: LocationBenchmark[];
}

export declare function loadBenchmarks(): BenchmarksDataset;
