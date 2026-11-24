# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [v2026.1.0] - 2026-11-24

### Hinzugefügt
- **Berechnungs-Engine (`src/`)**: Zero-Dependency ESM-Module mit vollständigen TypeScript-Definitionen (`src/index.d.ts`):
  - `calculateSolar`, `getTiltFactor`, `getClippingFactor`, `getVdeCompliance` — 10-Jahres-Ertrags-, Eigenverbrauchs-, Speicher-Crossover- und Amortisationsberechnung inkl. DIN VDE V 0126-95 (DE) und ESTI 600 W (CH).
  - `calculateAppliance` — Verbrauchs-, Kosten- und Altgerät-Austauschrechnung inkl. CO₂-Bilanz.
  - `calculateEv` — Ladekostenvergleich (Hausstrom, PV-Mix mit 0,08 €/kWh Gestehungskosten, DC-Schnellladen) gegen Verbrenner.
  - `COUNTRIES`, `parseDeNumber`, `formatDeNumber`, `clamp`, `loadBenchmarks`.
- **Offene 2026 DACH-Datensätze (`data/`, CC BY 4.0)**:
  - `data/benchmarks-2026.json` mit DE/CH/AT-Strompreisen (BDEW 37,3 ct/kWh, ElCom 27,7 Rp./kWh, E-Control 27,0 ct/kWh), Normregeln, 4 Hardware-Referenzen und 20 Standorten.
  - `data/solar-locations-dach.csv` (16 deutsche Bundesländer + 4 Schweizer Regionen).
  - `data/appliances-wattage-de.csv` (40 typische Haushaltsgeräte).
  - `data/ev-models-de.csv` (20 Elektroautos mit WLTP- & Realverbrauch vs. Verbrenner).
- **Tests & CI**: Vollständige `node:test`-Testsuite (`test/calc.test.js`) sowie GitHub Actions Workflow für Node.js 20 und 22.
