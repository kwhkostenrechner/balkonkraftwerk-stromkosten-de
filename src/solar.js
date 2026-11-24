import { COUNTRIES, clamp, formatDeNumber } from './countries.js';

/** @type {Readonly<Record<import('./index.d.ts').OrientationKey, import('./index.d.ts').OrientationMeta>>} */
export const ORIENTATIONS = Object.freeze({
  sued: Object.freeze({ key: 'sued', label: 'Süd', azimuthLabel: '180° (optimal)', factor: 1.0 }),
  'sued-ost': Object.freeze({ key: 'sued-ost', label: 'Süd-Ost', azimuthLabel: '135°', factor: 0.95 }),
  'sued-west': Object.freeze({ key: 'sued-west', label: 'Süd-West', azimuthLabel: '225°', factor: 0.95 }),
  'ost-west': Object.freeze({ key: 'ost-west', label: 'Ost-West (geteilt)', azimuthLabel: '90° / 270°', factor: 0.88 }),
  ost: Object.freeze({ key: 'ost', label: 'Ost', azimuthLabel: '90°', factor: 0.80 }),
  west: Object.freeze({ key: 'west', label: 'West', azimuthLabel: '270°', factor: 0.80 }),
});

/** @type {readonly [0, 1.0, 1.6, 2.0, 3.2]} */
export const STORAGE_OPTIONS = Object.freeze([0, 1.0, 1.6, 2.0, 3.2]);

/** @type {Readonly<import('./index.d.ts').SolarInput>} */
export const DEFAULT_SOLAR_INPUT = Object.freeze({
  country: 'DE',
  moduleWp: 1600,
  inverterW: 800,
  orientation: 'sued',
  tiltDeg: 35,
  storageKwh: 1.6,
  householdKwh: 3500,
  pricePerKwh: 0.373,
  costWithoutStorage: 549,
  costWithStorage: 1199,
  specificYieldPerKwp: 990,
});

/**
 * Empirische Neigungskurve für Deutschland/DACH (Referenz 35° Süd = 1,00).
 * @param {number} tiltDeg
 * @returns {number}
 */
export function getTiltFactor(tiltDeg) {
  const t = clamp(tiltDeg, 0, 90);
  const points = [
    [0, 0.88],
    [15, 0.96],
    [30, 1.00],
    [35, 1.00],
    [45, 0.98],
    [60, 0.92],
    [75, 0.82],
    [90, 0.72],
  ];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (t >= x0 && t <= x1) {
      const ratio = (t - x0) / (x1 - x0);
      return Number((y0 + ratio * (y1 - y0)).toFixed(3));
    }
  }
  return 0.72;
}

/**
 * Wechselrichter-Abregelungsfaktor (Clipping) bei DC/AC-Überbelegung
 * (z. B. 2.000 Wp Modulleistung an einem 800-W-Mikrowechselrichter).
 * @param {number} moduleWp
 * @param {number} inverterW
 * @returns {number}
 */
export function getClippingFactor(moduleWp, inverterW) {
  const dcAcRatio = moduleWp / inverterW;
  if (dcAcRatio <= 1.25) return 1.0;
  const factor = 1 - 0.08 * (dcAcRatio - 1.25);
  return Number(clamp(factor, 0.85, 1.0).toFixed(3));
}

/**
 * Prüft die Anschluss- und Normkonformität nach DIN VDE V 0126-95 (DE) bzw. ESTI (CH).
 * @param {number} moduleWp
 * @param {600 | 800} inverterW
 * @param {number} storageKwh
 * @param {'DE' | 'CH' | 'AT'} country
 * @returns {import('./index.d.ts').VdeCompliance}
 */
export function getVdeCompliance(moduleWp, inverterW, storageKwh, country) {
  const storageNote =
    storageKwh > 0
      ? 'Speicher-Hinweis: Achten Sie auf VDE-AR-N 4105 Konformität, Hersteller-Sicherheitszertifikat (LiFePO4) und frostgeschützte Aufstellung.'
      : undefined;

  if (country === 'CH') {
    return {
      status: 'ch-esti',
      badge: inverterW > 600 ? 'Schweiz ESTI-Prüfung (600 W)' : 'Schweiz ESTI-konform (≤ 600 W)',
      headline:
        inverterW > 600
          ? 'Hinweis für die Schweiz: ESTI-Grenze liegt standardmäßig bei 600 W'
          : 'Plug-&-Play-Betrieb bis 600 W in der Schweiz zulässig',
      detail:
        'In der Schweiz erlaubt die ESTI-Weisung vereinfachte Balkonkraftwerke bis 600 VA Wechselrichterleistung mit Meldung beim lokalen Netzbetreiber. Für 800 W ist vorab Rücksprache bzw. Elektroinstallation erforderlich.',
      storageNote,
    };
  }

  if (moduleWp <= 960) {
    return {
      status: 'schuko',
      badge: 'DIN VDE V 0126-95: Schuko zulässig',
      headline: `${formatDeNumber(moduleWp)} Wp ≤ 960 Wp: Betrieb am normalen Haushalts-Schuko-Stecker zulässig`,
      detail:
        'Nach Solarpaket I und DIN VDE V 0126-95 (Stand 2026) dürfen Steckersolargeräte bis 800 VA Wechselrichter und bis 960 Wp Modulleistung direkt über einen genormten Schuko-Stecker angeschlossen werden. Erforderlich bleibt die kostenlose Online-Registrierung im Marktstammdatenregister (MaStR).',
      storageNote,
    };
  }

  return {
    status: 'wieland',
    badge: 'DIN VDE V 0126-95: Energiesteckdose empfohlen',
    headline: `${formatDeNumber(moduleWp)} Wp (961–2.000 Wp): Spezielle Energiesteckvorrichtung (z. B. Wieland) erforderlich`,
    detail:
      'Über 960 Wp bis zur gesetzlichen Obergrenze von 2.000 Wp (bei max. 800 VA Wechselrichter) sieht DIN VDE V 0126-95 den Anschluss über eine spezielle Energiesteckdose (z. B. Wieland-Stecker) oder Festanschluss durch eine Elektrofachkraft vor. Zusätzlich gilt die einfache Online-Registrierung im MaStR.',
    storageNote,
  };
}

/**
 * Lineare Break-even-Interpolation innerhalb von Jahr 1–10 mit Extrapolation bis max. 25 Jahre.
 * @param {import('./index.d.ts').YearPoint[]} years
 * @param {'cumWithout' | 'cumWith'} key
 * @returns {number | null}
 */
function interpolatePayback(years, key) {
  for (let i = 1; i < years.length; i++) {
    const prev = years[i - 1][key];
    const curr = years[i][key];
    if (curr >= 0 && prev < 0) {
      const fraction = Math.abs(prev) / (curr - prev);
      return Number((i - 1 + fraction).toFixed(1));
    }
  }
  const last = years[years.length - 1];
  const annual = key === 'cumWithout' ? last.annualSavingWithout : last.annualSavingWith;
  if (annual <= 0) return null;
  const remaining = Math.abs(last[key]);
  const extraYears = remaining / annual;
  const total = 10 + extraYears;
  return total <= 25 ? Number(total.toFixed(1)) : null;
}

/**
 * Berechnet Jahresertrag, Eigenverbrauch, 10-Jahres-Cashflow (mit 0,5 %/Jahr Degradation),
 * Amortisationsdauer, Speicher-Schnittpunkt (Crossover) und CO2-Einsparung für ein Balkonkraftwerk.
 * @param {Partial<import('./index.d.ts').SolarInput>} [rawInput={}]
 * @returns {import('./index.d.ts').SolarResult}
 */
export function calculateSolar(rawInput = {}) {
  const country = rawInput.country && COUNTRIES[rawInput.country] ? rawInput.country : 'DE';
  const countryCfg = COUNTRIES[country];

  const moduleWp = clamp(Math.round((rawInput.moduleWp ?? DEFAULT_SOLAR_INPUT.moduleWp) / 50) * 50, 400, 2000);
  const inverterW = rawInput.inverterW === 600 ? 600 : 800;
  const orientation =
    rawInput.orientation && ORIENTATIONS[rawInput.orientation] ? rawInput.orientation : 'sued';
  const tiltDeg = clamp(Math.round(rawInput.tiltDeg ?? 35), 0, 90);
  const storageKwh = clamp(rawInput.storageKwh ?? 1.6, 0, 6.4);
  const householdKwh = clamp(Math.round(rawInput.householdKwh ?? 3500), 1000, 12000);
  const pricePerKwh = clamp(rawInput.pricePerKwh ?? countryCfg.defaultElectricityPrice, 0.10, 0.90);
  const costWithoutStorage = clamp(rawInput.costWithoutStorage ?? 549, 150, 5000);
  const costWithStorage = clamp(rawInput.costWithStorage ?? 1199, 300, 8000);
  const specificYieldPerKwp = rawInput.specificYieldPerKwp ?? countryCfg.defaultYieldPerKwp;

  const input = {
    country,
    moduleWp,
    inverterW,
    orientation,
    tiltDeg,
    storageKwh,
    householdKwh,
    pricePerKwh,
    costWithoutStorage,
    costWithStorage,
    specificYieldPerKwp,
  };

  const orientationFactor = ORIENTATIONS[orientation].factor;
  const tiltFactor = getTiltFactor(tiltDeg);
  const clippingFactor = getClippingFactor(moduleWp, inverterW);

  const annualYieldKwh = Math.round(
    (moduleWp / 1000) * specificYieldPerKwp * orientationFactor * tiltFactor * clippingFactor
  );

  // Eigenverbrauchsformel orientiert an HTW-Berlin-Profilen
  const loadRatio = annualYieldKwh > 0 ? householdKwh / annualYieldKwh : 1;
  const baseSelfRate = clamp(0.28 + 0.14 * Math.min(loadRatio, 3.2), 0.30, 0.72);
  const selfUsedWithoutKwh = Math.round(annualYieldKwh * baseSelfRate);
  const selfRateWithout = annualYieldKwh > 0 ? selfUsedWithoutKwh / annualYieldKwh : 0;

  // Bei storageKwh = 0 dient 1,6 kWh als Referenzvergleich für die zweite Kurve
  const comparisonStorageKwh = storageKwh > 0 ? storageKwh : 1.6;
  const surplusKwh = Math.max(0, annualYieldKwh - selfUsedWithoutKwh);
  // 220 äquivalente Vollzyklen/Jahr, 88 % Rundlauf-Wirkungsgrad (LiFePO4 + WR)
  const storableKwh = Math.min(surplusKwh, comparisonStorageKwh * 220);
  const usableFromStorageKwh = storableKwh * 0.88;
  const selfUsedWithKwh = Math.round(
    Math.min(annualYieldKwh * 0.94, selfUsedWithoutKwh + usableFromStorageKwh)
  );
  const selfRateWith = annualYieldKwh > 0 ? selfUsedWithKwh / annualYieldKwh : 0;

  const annualSavingWithout = selfUsedWithoutKwh * pricePerKwh;
  const annualSavingWith = selfUsedWithKwh * pricePerKwh;

  // 10-Jahres-Zeitreihe mit moderater Moduldegradation 0,5 %/Jahr
  const years = [
    {
      year: 0,
      cumWithout: -costWithoutStorage,
      cumWith: -costWithStorage,
      annualSavingWithout: 0,
      annualSavingWith: 0,
    },
  ];

  let cumWithout = -costWithoutStorage;
  let cumWith = -costWithStorage;
  let crossoverYear = null;

  for (let y = 1; y <= 10; y++) {
    const degradation = 1 - 0.005 * (y - 1);
    const saveW = annualSavingWithout * degradation;
    const saveS = annualSavingWith * degradation;
    const prevDiff = cumWith - cumWithout;
    cumWithout += saveW;
    cumWith += saveS;
    const currDiff = cumWith - cumWithout;

    if (crossoverYear === null && prevDiff < 0 && currDiff >= 0) {
      const frac = Math.abs(prevDiff) / (currDiff - prevDiff);
      crossoverYear = Number((y - 1 + frac).toFixed(1));
    }

    years.push({
      year: y,
      cumWithout: Math.round(cumWithout),
      cumWith: Math.round(cumWith),
      annualSavingWithout: Math.round(saveW),
      annualSavingWith: Math.round(saveS),
    });
  }

  const paybackWithoutYears = interpolatePayback(years, 'cumWithout');
  const paybackWithYears = interpolatePayback(years, 'cumWith');

  const co2SavedWithoutKg = Math.round((selfUsedWithoutKwh * countryCfg.co2GramsPerKwh) / 1000);
  const co2SavedWithKg = Math.round((selfUsedWithKwh * countryCfg.co2GramsPerKwh) / 1000);

  const monthlyHouseholdBill = (householdKwh * pricePerKwh) / 12;
  const monthsSavedWithout =
    monthlyHouseholdBill > 0 ? Number((annualSavingWithout / monthlyHouseholdBill).toFixed(1)) : 0;
  const monthsSavedWith =
    monthlyHouseholdBill > 0 ? Number((annualSavingWith / monthlyHouseholdBill).toFixed(1)) : 0;
  const storageBoostKwh = Math.max(0, selfUsedWithKwh - selfUsedWithoutKwh);

  return {
    input,
    specificYieldPerKwp,
    orientationFactor,
    tiltFactor,
    clippingFactor,
    annualYieldKwh,
    selfRateWithout,
    selfRateWith,
    selfUsedWithoutKwh,
    selfUsedWithKwh,
    annualSavingWithout,
    annualSavingWith,
    paybackWithoutYears,
    paybackWithYears,
    crossoverYear,
    net10Without: years[10].cumWithout,
    net10With: years[10].cumWith,
    co2SavedWithoutKg,
    co2SavedWithKg,
    monthsSavedWithout,
    monthsSavedWith,
    storageBoostKwh,
    years,
    compliance: getVdeCompliance(moduleWp, inverterW, storageKwh, country),
    comparisonStorageKwh,
  };
}
