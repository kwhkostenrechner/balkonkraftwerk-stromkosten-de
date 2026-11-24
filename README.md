# balkonkraftwerk-stromkosten-de

Offene Berechnungs-Engine (Zero-Dependency ESM, Node.js 18+) und strukturierte DACH-Referenzdaten (Stand 2026) für **Balkonkraftwerke (± Speicher)**, **Haushaltsgeräte-Stromkosten** und **E-Auto-Ladekosten vs. Verbrenner** in Deutschland, der Schweiz und Österreich.

Auf Basis der 2026er Referenzwerte (**BDEW** 37,3 ct/kWh in DE, **ElCom** 27,7 Rp./kWh in CH, **E-Control** 27,0 ct/kWh in AT), regionaler **PVGIS**-Volllaststunden sowie **Solarpaket I / DIN VDE V 0126-95** (800 VA Wechselrichter, Schuko bis 960 Wp, Energiesteckdose 961–2.000 Wp) amortisiert sich in Deutschland (3.500 kWh Haushalt, 35° Süd, 990 kWh/kWp) ein **800-Wp-Set ohne Speicher (349 €)** nach **1,6 Jahren** mit **1.729 €** 10-Jahres-Nettoertrag; ein **2.000-Wp-Set mit 2,0-kWh-Speicher (1.399 €)** amortisiert sich in **2,7 Jahren**, überholt die speicherlose Variante nach **4,9 Jahren** und erreicht **3.618 €** Nettoertrag in 10 Jahren.

> **English summary:** Zero-dependency JavaScript/TypeScript calculation engine and open 2026 DACH (DE/CH/AT) benchmark datasets (JSON & CSV) for balcony solar systems (with/without LiFePO4 storage), household appliance electricity costs, and EV home-charging vs. combustion-engine cost comparisons. Built against official 2026 BDEW, ElCom, E-Control, PVGIS, and DIN VDE V 0126-95 parameters.

---

## Inhaltsverzeichnis

- [2026 Referenz-Vergleichstabellen](#2026-referenz-vergleichstabellen)
- [Installation & Schnellstart](#installation--schnellstart)
- [API-Referenz](#api-referenz)
- [Offene Datensätze (`data/`)](#offene-datensätze-data)
- [Häufige Fragen (FAQ)](#häufige-fragen-faq)
- [Online-Rechner & Quellen](#online-rechner--quellen)
- [Lizenz & Zitation](#lizenz--zitation)

---

## 2026 Referenz-Vergleichstabellen

### 1. Balkonkraftwerk-Vergleich: 800 Wp ohne Speicher vs. 1.600 / 2.000 Wp mit Speicher (DE 2026)

*Annahmen: Deutschland-Mittelwert 990 kWh/kWp (35° Süd), 3.500 kWh Jahresverbrauch, BDEW-Strompreis 37,3 ct/kWh, 0,5 %/Jahr Moduldegradation, 220 Vollzyklen/Jahr und 88 % Speicher-Wirkungsgrad.*

| Konfiguration | Jahresertrag | Eigenverbrauch | Jahresersparnis (Jahr 1) | Amortisation | 10-Jahres-Netto | DIN VDE V 0126-95 |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| **800 Wp / 800 VA ohne Speicher** (349 €) | 792 kWh | 570 kWh (72,0 %) | 212,61 € | 1,6 Jahre | 1.729 € | Schuko zulässig (≤ 960 Wp) |
| **1.600 Wp / 800 VA ohne Speicher** (549 €) | 1.489 kWh | 907 kWh (60,9 %) | 338,31 € | 1,6 Jahre | 2.758 € | Energiesteckdose (961–2.000 Wp) |
| **1.600 Wp / 800 VA + 1,6 kWh Speicher** (1.199 €) | 1.489 kWh | 1.217 kWh (81,7 %) | 453,94 € | 2,7 Jahre | 3.238 € | Energiesteckdose + VDE-AR-N 4105 |
| **2.000 Wp / 800 VA ohne Speicher** (699 €) | 1.782 kWh | 989 kWh (55,5 %) | 368,90 € | 1,9 Jahre | 2.907 € | Energiesteckdose (961–2.000 Wp) |
| **2.000 Wp / 800 VA + 2,0 kWh Speicher** (1.399 €) | 1.782 kWh | 1.376 kWh (77,2 %) | 513,25 € | 2,7 Jahre | 3.618 € | Energiesteckdose + VDE-AR-N 4105 |

### 2. DACH-Strompreis- & Norm-Benchmarks (Datenstand 2026)

| Land | Haushaltsstrom | DC-Schnelllader | Benzin (Super/Bleifrei) | Ø Solarertrag (35° Süd) | CO₂-Strommix | Stecker-PV Regelwerk |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| **Deutschland (DE)** | 37,3 ct/kWh | 59,0 ct/kWh | 1,75 €/L | 990 kWh/kWp | 363 g/kWh | Solarpaket I & DIN VDE V 0126-95 (800 VA, 0 % MwSt.) |
| **Schweiz (CH)** | 27,7 Rp./kWh | 55,0 Rp./kWh | 1,82 CHF/L | 1.060 kWh/kWp | 128 g/kWh | ESTI Plug-&-Play (600 W Grenze, Netzbetreiber-Meldung) |
| **Österreich (AT)** | 27,0 ct/kWh | 54,0 ct/kWh | 1,62 €/L | 1.030 kWh/kWp | 145 g/kWh | TOR-Erzeuger (800 W, Meldung 2 Wochen vorab) |

### 3. Ausgewählte Haushaltsgeräte-Stromkosten (DE, 37,3 ct/kWh)

| Gerät (typischer Betrieb) | Leistung | Jahresverbrauch | Stromkosten / Jahr | Altgerät-Vergleich | Neukauf-Amortisation |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Waschmaschine 60 °C (180 Gänge/J.) | 1.150 W | 207,0 kWh | 77,21 € | 110,78 € (1.650 W) | 16,4 Jahre (549 €) |
| Wärmepumpentrockner A+++ (160 Gänge/J.) | 900 W | 230,4 kWh | 85,94 € | 205,30 € (2.150 W) | 5,0 Jahre (599 €) |
| Kühl-Gefrierkombi Kl. A/B (24/7) | 17 W Ø | 148,9 kWh | 55,55 € | 156,84 € (48 W Ø) | 6,9 Jahre (699 €) |
| Heizlüfter 2.000 W (2 Std. × 90 Tage) | 2.000 W | 360,0 kWh | 134,28 € | 0,746 €/Stunde | — |
| Gaming-PC + 27"-Monitor (3 Std. × 320 Tage) | 420 W | 403,2 kWh | 150,39 € | 207,69 € (580 W) | — |

---

## Installation & Schnellstart

Voraussetzung: **Node.js ≥ 18** (ESM, keine externen Abhängigkeiten).

```bash
git clone https://github.com/kwhkostenrechner/balkonkraftwerk-stromkosten-de.git
cd balkonkraftwerk-stromkosten-de
npm test
```

### Beispiel 1: Balkonkraftwerk mit Speicher (10-Jahres-Amortisation)

```js
import { calculateSolar } from './src/index.js';

const result = calculateSolar({
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

console.log({
  annualYieldKwh: result.annualYieldKwh,           // 1782
  selfUsedWithKwh: result.selfUsedWithKwh,         // 1376
  paybackWithoutYears: result.paybackWithoutYears, // 1.9
  paybackWithYears: result.paybackWithYears,       // 2.7
  crossoverYear: result.crossoverYear,             // 4.9
  net10WithEur: result.net10With,                  // 3618
  compliance: result.compliance.badge,
});
```

### Beispiel 2: Haushaltsgerät inkl. Altgerät-Austauschrechnung

```js
import { calculateAppliance } from './src/index.js';

const dryer = calculateAppliance({
  country: 'DE',
  watt: 900,
  hoursPerDay: 1.6,
  daysPerYear: 160,
  oldDeviceWatt: 2150,
  replacementCost: 599,
});

console.log(dryer.costPerYear.toFixed(2));              // "85.94"
console.log(dryer.annualSavingByReplacement.toFixed(2)); // "119.36"
console.log(dryer.replacementPaybackYears);              // 5
```

### Beispiel 3: E-Auto Ladekosten (Wallbox + PV-Anteil + DC) vs. Verbrenner

```js
import { calculateEv } from './src/index.js';

const ev = calculateEv({
  country: 'DE',
  annualKm: 15000,
  evKwhPer100: 17.8,      // z. B. VW ID.3 Pro inkl. Ladeverlust
  pvSharePct: 15,         // 15 % über Balkonkraftwerk / PV (0,08 €/kWh)
  publicSharePct: 20,     // 20 % DC-Schnelllader (0,59 €/kWh)
  iceLitersPer100: 6.4,   // z. B. VW Golf 8 1.5 TSI
});

console.log({
  cost100Mix: ev.cost100Mix.toFixed(2),                 // "6.63" €/100 km
  cost100Ice: ev.cost100Ice.toFixed(2),                 // "11.20" €/100 km
  annualSavingMixVsIce: Math.round(ev.annualSavingMixVsIce), // 686 €/Jahr
});
```

---

## API-Referenz

Vollständige TypeScript-Typen liegen in [`src/index.d.ts`](./src/index.d.ts).

| Export | Modul | Beschreibung |
| :--- | :--- | :--- |
| `calculateSolar(input?)` | `src/solar.js` | Berechnet Jahresertrag, Eigenverbrauch (± Speicher), 10-Jahres-Cashflow (0,5 % Degradation/Jahr), Break-even, Crossover-Jahr, CO₂-Einsparung und DIN-VDE-/ESTI-Konformität. |
| `getTiltFactor(tiltDeg)` | `src/solar.js` | Empirischer Neigungsfaktor (0°–90°, Referenz 35° Süd = `1.00`). |
| `getClippingFactor(moduleWp, inverterW)` | `src/solar.js` | DC/AC-Wechselrichter-Abregelungsfaktor oberhalb Ratio `1.25` (Minimum `0.85`). |
| `getVdeCompliance(wp, va, storage, country)` | `src/solar.js` | Prüft Schuko-Grenze (≤ 960 Wp), Energiesteckdose (961–2.000 Wp) nach DIN VDE V 0126-95 sowie CH-ESTI 600 W. |
| `calculateAppliance(input?)` | `src/appliances.js` | Berechnet kWh & Kosten pro Stunde/Tag/Monat/Jahr, CO₂-Ausstoß sowie Austausch-Amortisation gegen ein Altgerät. |
| `calculateEv(input?)` | `src/ev.js` | Vergleicht Hausstrom, PV-Mix (`0,08 €/kWh` Eigenstromkosten) und DC-Schnellladen mit einem Benzin-Referenzfahrzeug. |
| `COUNTRIES`, `ORIENTATIONS`, `STORAGE_OPTIONS` | `src/countries.js`, `src/solar.js` | Unveränderliche 2026 DACH-Referenzkonstanten. |
| `parseDeNumber(raw, fallback)` | `src/countries.js` | Toleranter Parser für deutsche & internationale Zahlenformate (`"37,3"`, `"1.250,50 €"`, `"0.373"`). |
| `loadBenchmarks()` | `src/index.js` | Lädt `data/benchmarks-2026.json` als strukturiertes Objekt. |

---

## Offene Datensätze (`data/`)

Alle Datensätze stehen unter **CC BY 4.0** (siehe [`data/LICENSE-DATA.md`](./data/LICENSE-DATA.md)) und lassen sich direkt in Python, R, Excel oder JavaScript weiterverarbeiten:

- [`data/benchmarks-2026.json`](./data/benchmarks-2026.json) — Vollständige 2026 DACH-Parameter: Strom-/Kraftstoffpreise, CO₂-Faktoren, DIN-VDE-/ESTI-/TOR-Regeln, Modellparameter, 4 offizielle Hersteller-Hardware-Referenzen (Hoymiles HMS-800W-2T, Anker SOLIX Solarbank 2 Pro/AC, Zendure Hyper 2000) sowie 20 Regionen mit Quell-URLs.
- [`data/solar-locations-dach.csv`](./data/solar-locations-dach.csv) — **20 DACH-Regionen** (alle 16 deutschen Bundesländer + 4 Schweizer Regionen) mit spezifischem Jahresertrag (`kWh/kWp`), Sonnenstunden und regionalem Strompreis.
- [`data/appliances-wattage-de.csv`](./data/appliances-wattage-de.csv) — **40 häufige Haushaltsgeräte** mit Real-Wattzahl, Altgeräte-Referenzwatt, typischer Nutzungsdauer, Einheits-kWh und 2026er Jahreskosten.
- [`data/ev-models-de.csv`](./data/ev-models-de.csv) — **20 Elektroautos** im DACH-Markt mit Netto-Batteriekapazität, WLTP- und Realverbrauch (inkl. ~10 % Ladeverlust), AC/DC-Ladeleistung sowie Verbrenner-Vergleichsmodell.

---

## Häufige Fragen (FAQ)

### Wie viel Strom erzeugt ein 800-W-Balkonkraftwerk pro Jahr in Deutschland?
Bei einer optimalen Südausrichtung (35° Neigung) und dem deutschen Mittelwert von 990 kWh/kWp produziert ein 800-Wp-Set rund **792 kWh pro Jahr**; mit 1.600 Wp an einem 800-VA-Wechselrichter steigt der Jahresertrag trotz 6 % Clipping-Verlust auf **1.489 kWh**, mit 2.000 Wp auf **1.782 kWh**.

### Ab wann lohnt sich ein Balkonkraftwerk mit Speicher im Jahr 2026?
Ein 1,6- bis 2,0-kWh-LiFePO4-Speicher rechnet sich ab etwa **1.600 bis 2.000 Wp Modulleistung**: Bei 2.000 Wp und 37,3 ct/kWh erhöht ein 2,0-kWh-Speicher den Eigenverbrauch von 55,5 % auf 77,2 %, amortisiert sich in rund **2,7 Jahren** und überholt die speicherlose Anlage nach **4,9 Jahren** im kumulierten Nettoertrag.

### Ist ein Schuko-Stecker nach DIN VDE V 0126-95 in Deutschland 2026 erlaubt?
Ja, bis **960 Wp Modulleistung** und maximal **800 VA Wechselrichterleistung** lässt DIN VDE V 0126-95 den Anschluss über einen genormten Schuko-Stecker zu. Für Anlagen zwischen **961 Wp und 2.000 Wp** sieht die Norm eine spezielle Energiesteckvorrichtung (z. B. Wieland) oder einen Festanschluss vor; in beiden Fällen genügt die kostenlose Online-Registrierung im Marktstammdatenregister (MaStR).

### Was kostet 100 km E-Auto-Laden zuhause im Vergleich zum Benziner?
Ein Kompakt-Elektroauto wie der VW ID.3 Pro (17,8 kWh/100 km inkl. Ladeverlust) kostet beim deutschen BDEW-Strompreis 2026 (37,3 ct/kWh) rund **6,64 € pro 100 km** an der Wallbox, während ein vergleichbarer Benziner (6,4 L/100 km bei 1,75 €/L) bei **11,20 € pro 100 km** liegt — bei 15.000 km/Jahr ergibt sich ein reiner Energiekostenvorteil von rund **684 bis 686 € jährlich**.

### Welche Regeln gelten für Balkonkraftwerke in der Schweiz und in Österreich?
In der **Schweiz** begrenzt die ESTI-Weisung vereinfachte Plug-&-Play-Anlagen standardmäßig auf **600 W** Wechselrichterleistung mit Meldung beim lokalen Verteilnetzbetreiber. In **Österreich** sind Kleinsterzeugungsanlagen nach TOR-Erzeuger bis **800 W** vereinfacht anmeldefähig (Meldung mindestens 2 Wochen vor Inbetriebnahme).

---

## Online-Rechner & Quellen

### Interaktiver Online-Rechner

- **Balkonkraftwerk-Rechner 2026 (± Speicher):** https://kwhkostenrechner.com/
- **Stromkosten-Rechner für 40 Haushaltsgeräte:** https://kwhkostenrechner.com/stromkosten/
- **E-Auto-Ladekosten-Rechner vs. Verbrenner (20 Modelle):** https://kwhkostenrechner.com/e-auto-laden/
- **Balkonkraftwerk-Ertrag nach Bundesland & Kanton (DACH):** https://kwhkostenrechner.com/standort/

> **Transparenz / Disclosure:** Der interaktive Online-Rechner unter `kwhkostenrechner.com` wird vom selben Maintainer kostenlos und ohne Anmeldung bereitgestellt. *The interactive online calculator at `kwhkostenrechner.com` is maintained by the same author, free of charge and without registration.*

### Offizielle Primärquellen & Normen

- **BDEW-Strompreisanalyse (DE):** https://www.bdew.de/service/daten-und-grafiken/bdew-strompreisanalyse/
- **ElCom Strompreis-Portal (CH):** https://www.strompreis.elcom.admin.ch/
- **E-Control Austria (AT):** https://www.e-control.at/
- **VDE / DKE — Steckersolargeräte & DIN VDE V 0126-95:** https://www.vde.com/de/agf/themen/steckersolargeraete
- **Bundesnetzagentur — Marktstammdatenregister (MaStR):** https://www.marktstammdatenregister.de/
- **EU JRC — PVGIS Solar Radiation & PV Tool:** https://re.jrc.ec.europa.eu/pvg_tools/en/
- **HTW Berlin — Forschungsgruppe Solarspeichersysteme:** https://solar.htw-berlin.de/
- **Umweltbundesamt (UBA) — Strommix-Emissionsfaktoren:** https://www.umweltbundesamt.de/
- **ESTI — Eidgenössisches Starkstrominspektorat (CH):** https://www.esti.admin.ch/

---

## Lizenz & Zitation

- **Quellcode (`src/`, `test/`):** [MIT-Lizenz](./LICENSE)
- **Datensätze (`data/`):** [CC BY 4.0](./data/LICENSE-DATA.md)
- **Zitation:** Siehe [`CITATION.cff`](./CITATION.cff)
