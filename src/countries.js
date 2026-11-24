/**
 * DACH-Länderkonfiguration (Datenstand 2026) und numerische Hilfsfunktionen.
 *
 * Quellen:
 * - DE: BDEW-Strompreisanalyse 2026 (37,3 ct/kWh, 3.500 kWh Haushalt)
 * - CH: ElCom Strompreis-Median 2026 (27,7 Rp./kWh, Profil H4, 4.500 kWh)
 * - AT: E-Control Strompreis-Monitor 2026 (27,0 ct/kWh, 3.500 kWh Haushalt)
 */

/** @type {Readonly<Record<'DE' | 'CH' | 'AT', import('./index.d.ts').CountryConfig>>} */
export const COUNTRIES = Object.freeze({
  DE: Object.freeze({
    code: 'DE',
    name: 'Deutschland',
    shortLabel: 'DE (€)',
    currency: '€',
    currencyIso: 'EUR',
    subunit: 'ct',
    defaultElectricityPrice: 0.373,
    defaultElectricityCt: 37.3,
    defaultPublicFastPrice: 0.59,
    defaultFuelPrice: 1.75,
    defaultYieldPerKwp: 990,
    co2GramsPerKwh: 363,
    priceSource: 'BDEW-Strompreisanalyse 2026 (3.500 kWh Haushalt)',
    vdeHint:
      'Solarpaket I & DIN VDE V 0126-95 (DE 2026): max. 800 VA Wechselrichter, Schuko bis 960 Wp, bis 2.000 Wp mit Energiesteckdose & MaStR-Anmeldung.',
  }),
  CH: Object.freeze({
    code: 'CH',
    name: 'Schweiz',
    shortLabel: 'CH (CHF)',
    currency: 'CHF',
    currencyIso: 'CHF',
    subunit: 'Rp.',
    defaultElectricityPrice: 0.277,
    defaultElectricityCt: 27.7,
    defaultPublicFastPrice: 0.55,
    defaultFuelPrice: 1.82,
    defaultYieldPerKwp: 1060,
    co2GramsPerKwh: 128,
    priceSource: 'ElCom Strompreis-Median 2026 (Profil H4, 4.500 kWh)',
    vdeHint:
      'ESTI-Hinweis (Schweiz 2026): Plug-&-Play-Anlagen sind in der Schweiz in der Regel bis 600 W Wechselrichterleistung zulässig (Meldepflicht beim Netzbetreiber prüfen).',
  }),
  AT: Object.freeze({
    code: 'AT',
    name: 'Österreich',
    shortLabel: 'AT (€)',
    currency: '€',
    currencyIso: 'EUR',
    subunit: 'ct',
    defaultElectricityPrice: 0.270,
    defaultElectricityCt: 27.0,
    defaultPublicFastPrice: 0.54,
    defaultFuelPrice: 1.62,
    defaultYieldPerKwp: 1030,
    co2GramsPerKwh: 145,
    priceSource: 'E-Control Strompreis-Monitor 2026 (3.500 kWh Haushalt)',
    vdeHint:
      'TOR-Erzeuger Hinweis (Österreich 2026): Kleinsterzeugungsanlagen bis 800 W Einspeiseleistung sind vereinfacht anmeldefähig (2 Wochen vorab beim Netzbetreiber).',
  }),
});

/**
 * Begrenzt einen numerischen Wert auf das Intervall [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Formatiert eine Zahl im deutschen Gebietsschema (de-DE).
 * @param {number} value
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatDeNumber(value, decimals = 0) {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Toleranter Parser für deutsche & internationale Dezimaleingaben.
 * Akzeptiert z. B. "37,3", "37.3", "1.250,50", "1250.5", " 800 "
 * @param {string | number | null | undefined} raw
 * @param {number} fallback
 * @returns {number}
 */
export function parseDeNumber(raw, fallback) {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : fallback;
  }
  if (!raw) return fallback;
  const cleaned = String(raw).trim().replace(/\s+/g, '').replace(/(?:CHF|Rp\.|ct|€|%)/gi, '');
  if (!cleaned) return fallback;

  let normalized = cleaned;
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = cleaned.replace(/,/g, '');
    }
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.');
  } else if (hasDot) {
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length === 3 && parts[0] !== '0' && parts[0].length <= 3) {
      normalized = cleaned.replace(/\./g, '');
    } else if (parts.length > 2) {
      normalized = cleaned.replace(/\./g, '');
    }
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}
