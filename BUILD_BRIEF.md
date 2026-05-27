# MASTER BUILD BRIEF



## Steam Table Interpolation Portal
### For Claude Code — Full Application Build

---

> **How to use this brief:** Hand this entire document to Claude Code as your opening prompt. It contains everything needed to build the application end-to-end without ambiguity. Claude Code should read it fully before writing a single line of code.

---

## 0. EXECUTIVE SUMMARY

Build a production-grade, deployable web application — a Steam Table Interpolation Portal for practising engineers and engineering students. The application must be built with engineering integrity as its primary design constraint: no fabricated data, no silent extrapolation, no hidden math, no blurred distinction between tabulated and interpolated values.

This is not a demo. It is not a skeleton. It is a complete, deployable engineering tool.

---

## 1. TECHNOLOGY STACK

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 (Vite) | Fast dev server, clean build output, wide ecosystem |
| Language | TypeScript | Type safety is non-negotiable for an engineering calculation tool |
| Styling | Tailwind CSS v3 | Utility-first, no runtime overhead, clean dark theme support |
| State Management | Zustand | Lightweight, no boilerplate, sufficient for this app's complexity |
| Routing | React Router v6 | Clean URL structure for bookmarkable states |
| Data | Static TypeScript modules | Steam table data is static reference data — no database needed |
| Export | PapaParse + FileSaver.js | CSV export for table data |
| Deployment | Vercel | Zero-config deployment, free tier, connects directly to GitHub |
| Package Manager | npm | Standard, no surprises |

---

## 2. PROJECT STRUCTURE

```
clausius/
├── public/
│   └── favicon.svg
├── src/
│   ├── data/
│   │   ├── iapws_if97/
│   │   │   ├── saturated_temperature.ts     # Sat. table indexed by T
│   │   │   ├── saturated_pressure.ts        # Sat. table indexed by P
│   │   │   ├── superheated.ts               # Superheated grid [P][T]
│   │   │   └── compressed_liquid.ts         # Compressed liquid table
│   │   ├── cengel_boles/
│   │   │   ├── saturated_temperature.ts
│   │   │   ├── saturated_pressure.ts
│   │   │   └── superheated.ts
│   │   ├── asme_if97/
│   │   │   ├── saturated_temperature.ts
│   │   │   ├── saturated_pressure.ts
│   │   │   └── superheated.ts
│   │   ├── iapws_95/
│   │   │   ├── saturated_temperature.ts
│   │   │   └── saturated_pressure.ts
│   │   └── index.ts                         # Unified data registry
│   ├── engine/
│   │   ├── interpolation.ts                 # Linear + bilinear interpolation
│   │   ├── regions.ts                       # Region detection logic
│   │   ├── units.ts                         # SI ↔ Imperial conversions
│   │   ├── lookup.ts                        # Exact table lookup logic
│   │   └── types.ts                         # Shared TypeScript types
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   └── DisclaimerBanner.tsx
│   │   ├── controls/
│   │   │   ├── ModeSelector.tsx
│   │   │   ├── StandardSelector.tsx
│   │   │   ├── UnitToggle.tsx
│   │   │   └── RegionIndicator.tsx
│   │   ├── interpolation/
│   │   │   ├── InterpolationPanel.tsx
│   │   │   ├── InputForm.tsx
│   │   │   ├── ResultsDisplay.tsx
│   │   │   └── ShowWorkPanel.tsx
│   │   ├── lookup/
│   │   │   ├── TableLookupPanel.tsx
│   │   │   ├── TableSelector.tsx
│   │   │   ├── TableGrid.tsx
│   │   │   └── ExactMatchRow.tsx
│   │   └── shared/
│   │       ├── WarningBanner.tsx
│   │       ├── CriticalPointFlag.tsx
│   │       └── ValueDisplay.tsx
│   ├── store/
│   │   └── appStore.ts                      # Zustand global state
│   ├── hooks/
│   │   ├── useInterpolation.ts
│   │   └── useLookup.ts
│   ├── utils/
│   │   └── csv.ts                           # CSV export utility
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── vercel.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── package.json
└── README.md
```

---

## 3. DATA ARCHITECTURE

### 3.1 Core TypeScript Types (engine/types.ts)

```typescript
// Every property row in a steam table
export interface SteamProperties {
  T: number;          // Temperature (°C in SI, °F in Imperial)
  P: number;          // Pressure (MPa in SI, psia in Imperial)
  hf: number;         // Specific enthalpy of saturated liquid (kJ/kg)
  hfg: number;        // Enthalpy of vaporization (kJ/kg)
  hg: number;         // Specific enthalpy of saturated vapor (kJ/kg)
  sf: number;         // Specific entropy of sat. liquid (kJ/kg·K)
  sfg: number;        // Entropy of vaporization (kJ/kg·K)
  sg: number;         // Specific entropy of sat. vapor (kJ/kg·K)
  vf: number;         // Specific volume of sat. liquid (m³/kg)
  vg: number;         // Specific volume of sat. vapor (m³/kg)
  uf: number;         // Specific internal energy of sat. liquid (kJ/kg)
  ufg: number;        // Internal energy of vaporization (kJ/kg)
  ug: number;         // Specific internal energy of sat. vapor (kJ/kg)
  nearCriticalPoint?: boolean;  // Flag for ⚠️ display
}

// Superheated steam at a specific (P, T) grid point
export interface SuperheatedPoint {
  T: number;          // Temperature (°C)
  h: number;          // Specific enthalpy (kJ/kg)
  s: number;          // Specific entropy (kJ/kg·K)
  v: number;          // Specific volume (m³/kg)
  u: number;          // Specific internal energy (kJ/kg)
}

// A full pressure slice of the superheated table
export interface SuperheatedPressureSlice {
  P: number;          // Pressure (MPa)
  Tsat: number;       // Saturation temperature at this pressure (°C)
  points: SuperheatedPoint[];
}

// A compressed liquid point
export interface CompressedLiquidPoint {
  T: number;
  P: number;
  h: number;
  s: number;
  v: number;
  u: number;
}

// Supported standards
export type Standard = 'IAPWS-IF97' | 'IAPWS-95' | 'CENGEL-BOLES' | 'ASME-IF97';

// Table types
export type TableType =
  | 'SATURATED_TEMPERATURE'
  | 'SATURATED_PRESSURE'
  | 'SUPERHEATED'
  | 'COMPRESSED_LIQUID';

// Thermodynamic region
export type Region = 'SUBCOOLED' | 'SATURATED' | 'SUPERHEATED' | 'SUPERCRITICAL';

// Unit system
export type UnitSystem = 'SI' | 'IMPERIAL';

// Result of an interpolation
export interface InterpolationResult {
  properties: Partial<SteamProperties & SuperheatedPoint>;
  region: Region;
  interpolationType: 'LINEAR' | 'BILINEAR' | 'QUALITY_BASED' | 'EXACT';
  workShown: InterpolationWork;
  standard: Standard;
  unitSystem: UnitSystem;
  warnings: string[];
}

// The "show your work" data structure
export interface InterpolationWork {
  lowerBound: { index: number | string; values: Partial<SteamProperties> };
  upperBound: { index: number | string; values: Partial<SteamProperties> };
  fraction: number;
  formula: string;    // Human-readable formula string
  intermediateSteps?: BilinearStep[];  // For bilinear interpolation
}

export interface BilinearStep {
  description: string;
  lowerBound: number;
  upperBound: number;
  fraction: number;
  result: number;
  property: string;
}
```

### 3.2 Data File Structure Example (iapws_if97/saturated_temperature.ts)

Each data file must follow this exact pattern. **No abbreviation. No placeholder rows.**

```typescript
import type { SteamProperties } from '../../engine/types';

// Source: IAPWS-IF97 Industrial Formulation 1997
// Region 4 (Saturation Curve), indexed by temperature
// Values computed from IAPWS-IF97 equations with 6 significant figures
// T range: 0.01°C to 374.14°C (triple point to critical point)
// Reference: Wagner, W. and Kruse, A. (1998). Properties of Water and Steam.

export const IAPWS_IF97_SAT_TEMP: SteamProperties[] = [
  // T(°C)   P(MPa)     hf         hfg        hg         sf         sfg        sg         vf          vg          uf         ufg        ug
  { T: 0.01,  P: 0.000612, hf: 0.0006, hfg: 2500.9, hg: 2500.9, sf: 0.000002, sfg: 9.1555, sg: 9.1555, vf: 0.0010002, vg: 206.14, uf: 0.0000, ufg: 2374.9, ug: 2374.9 },
  { T: 5,     P: 0.000873, hf: 20.986, hfg: 2489.1, hg: 2510.1, sf: 0.07626,  sfg: 8.9496, sg: 9.0257, vf: 0.0010001, vg: 147.03, uf: 20.985, ufg: 2360.8, ug: 2381.8 },
  // ... (continue for ALL temperature entries through 374.14°C)
  { T: 374.14, P: 22.089, hf: 2099.3, hfg: 0.0,    hg: 2099.3, sf: 4.4120,   sfg: 0.0,    sg: 4.4120, vf: 0.003155, vg: 0.003155, uf: 2029.6, ufg: 0.0, ug: 2029.6, nearCriticalPoint: true },
];
```

### 3.3 Required Data Coverage

#### IAPWS-IF97 (Primary — most complete)

**Saturated by Temperature:**
- 0.01°C, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280, 285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 355, 360, 365, 370, 374.14°C
- **Minimum: 76 data points**

**Saturated by Pressure:**
- 0.001, 0.005, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.125, 0.15, 0.175, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 12.5, 15.0, 17.5, 20.0, 22.089 MPa
- **Minimum: 47 data points**

**Superheated Steam Grid:**
Pressures: 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 12.5, 15.0, 17.5, 20.0, 25.0, 30.0 MPa

Temperatures per pressure slice (above Tsat for that pressure):
50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 900, 1000, 1100, 1200, 1300°C
(Only include rows where T > Tsat for that pressure)

**Compressed Liquid:**
Pressures: 5, 10, 15, 20, 25, 30 MPa
Temperatures: 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300°C

#### Çengel & Boles
- Same table structure as IAPWS-IF97
- Cover: Sat. by T (0.01–374.14°C), Sat. by P (0.001–22.089 MPa), Superheated (same grid)
- Note in source attribution: "Values consistent with Çengel & Boles, Thermodynamics: An Engineering Approach, 8th Ed., Tables A-4, A-5, A-6"
- These values differ from IAPWS-IF97 in rounding — preserve those differences faithfully

#### ASME-IF97
- Same structure as IAPWS-IF97
- Label as: "ASME Steam Tables (IAPWS-IF97 basis)"
- Note: "ASME adopted IAPWS-IF97 as the basis for its steam tables. Values shown are IAPWS-IF97 compliant. For ASME code compliance work, consult the licensed ASME publication directly."

#### IAPWS-95
- Saturated by Temperature and Saturated by Pressure only (no superheated grid)
- Same temperature/pressure ranges as IAPWS-IF97
- Label clearly: "IAPWS-95 Scientific Formulation (Wagner & Pruß, 2002)"
- Note: "IAPWS-95 provides higher-accuracy values than IF97, particularly near the critical point. Values shown are computed from the IAPWS-95 formulation."

---

## 4. INTERPOLATION ENGINE (engine/interpolation.ts)

### 4.1 Linear Interpolation

```typescript
/**
 * Linear interpolation between two data points.
 * Formula: y = y1 + [(x - x1) / (x2 - x1)] * (y2 - y1)
 *
 * @returns result value AND the work shown (fraction, bounds)
 */
export function linearInterpolate(
  x: number,
  x1: number, x2: number,
  y1: number, y2: number
): { result: number; fraction: number; formula: string }
```

### 4.2 Bilinear Interpolation (Superheated Region)

When input P and T both fall between grid points:

**Step 1:** Interpolate across temperature at lower pressure boundary → intermediate result R1
**Step 2:** Interpolate across temperature at upper pressure boundary → intermediate result R2
**Step 3:** Interpolate R1 and R2 across pressure → final result

All three steps must be captured in `BilinearStep[]` for the Show Work panel.

### 4.3 Quality-Based Interpolation (Two-Phase Region)

For wet steam with quality x (0 ≤ x ≤ 1):
```
h = hf + x * hfg
s = sf + x * sfg
v = vf + x * vfg
u = uf + x * ufg
```

x = 0 → saturated liquid
x = 1 → saturated vapor
0 < x < 1 → two-phase mixture

### 4.4 Out-of-Bounds Handling

**NEVER extrapolate silently.** If the input falls outside table bounds:

```typescript
throw new OutOfBoundsError(
  `Input out of table bounds — extrapolation beyond this range is not ` +
  `thermodynamically validated. Proceed with caution or consult extended ` +
  `data sources.\n` +
  `Table range: ${lowerBound} to ${upperBound}.\n` +
  `Your input: ${inputValue}.`
);
```

Display this error prominently in the UI — red bordered warning box, not a toast.

### 4.5 Region Detection (engine/regions.ts)

Given T and P inputs, determine region:

```typescript
export function detectRegion(T: number, P: number, standard: Standard): Region {
  // 1. Check if above critical point (T > 374.14°C AND P > 22.089 MPa) → SUPERCRITICAL
  // 2. Find Psat at given T (or Tsat at given P)
  // 3. If P > Psat at given T → SUBCOOLED (compressed liquid)
  // 4. If P < Psat at given T → SUPERHEATED
  // 5. If P ≈ Psat (within tolerance) → SATURATED
}
```

Region must be displayed at all times via the RegionIndicator component.

---

## 5. TABLE LOOKUP ENGINE (engine/lookup.ts)

### 5.1 Exact Match Logic

```typescript
export function exactLookup(
  index: number,          // T or P value entered by user
  tableType: TableType,
  standard: Standard,
  tolerance: number = 0   // strict: must be exact match
): LookupResult
```

If no exact match:
- Return the two nearest bounding values
- Display: "No exact tabulated entry exists for this input. Switch to Interpolation Mode to compute an estimated value between the two nearest data points: [lower] and [upper]."
- Do NOT return the nearest row silently
- Do NOT perform interpolation in this mode

### 5.2 Full Table Render

When user requests full table display:
- Render all rows in a scrollable `<table>` with sticky header
- Flag rows near critical point with ⚠️ icon and tooltip
- "Copy Row" button on each row (copies to clipboard as tab-separated values)
- "Export Table (CSV)" button exports the entire visible table

---

## 6. UNIT CONVERSION (engine/units.ts)

All internal computations MUST remain in SI. Conversion happens only at display layer.

```typescript
// SI → Imperial conversions
export const conversions = {
  T: (c: number) => c * 9/5 + 32,          // °C → °F
  P: (mpa: number) => mpa * 145.038,         // MPa → psia
  h: (kjkg: number) => kjkg * 0.429923,      // kJ/kg → BTU/lbm
  s: (kjkgk: number) => kjkgk * 0.238846,    // kJ/(kg·K) → BTU/(lbm·°R)
  v: (m3kg: number) => m3kg * 16.0185,       // m³/kg → ft³/lbm
  u: (kjkg: number) => kjkg * 0.429923,      // kJ/kg → BTU/lbm
};

// Unit labels
export const unitLabels = {
  SI: { T: '°C', P: 'MPa', h: 'kJ/kg', s: 'kJ/(kg·K)', v: 'm³/kg', u: 'kJ/kg' },
  IMPERIAL: { T: '°F', P: 'psia', h: 'BTU/lbm', s: 'BTU/(lbm·°R)', v: 'ft³/lbm', u: 'BTU/lbm' },
};
```

---

## 7. UI/UX SPECIFICATION

### 7.1 Design Language

**Aesthetic:** Industrial precision. Dark theme. Monospaced numerics. Clean grid layouts. Not consumer-facing — this is a tool for engineers.

**Color Palette (CSS variables):**
```css
--bg-primary:     #0f1117;   /* Near-black background */
--bg-surface:     #1a1d27;   /* Card/panel background */
--bg-elevated:    #22263a;   /* Input fields, table rows */
--border:         #2e3348;   /* Subtle borders */
--border-active:  #4a5280;   /* Active/focused borders */
--text-primary:   #e8eaf0;   /* Primary text */
--text-secondary: #8b90a8;   /* Labels, secondary info */
--text-muted:     #555c78;   /* Placeholder, disabled */
--accent-blue:    #4d9de0;   /* Primary accent — inputs, links */
--accent-green:   #3dd68c;   /* Success, exact match indicator */
--accent-amber:   #f5a623;   /* Warning indicators */
--accent-red:     #e05252;   /* Error, out of bounds */
--accent-purple:  #9b6dff;   /* Interpolated value indicator */
--mono-font:      'JetBrains Mono', 'Fira Code', monospace;
--ui-font:        'IBM Plex Sans', 'Inter', sans-serif;
```

**Typography:**
- All numerical values: monospaced font
- UI labels and headings: IBM Plex Sans
- Never use Inter as primary (too generic)
- Property symbols (h, s, v, u, T, P) rendered in italic

**Numeric Display:**
- Always show 4-6 significant figures
- Always show units adjacent to values
- Never truncate a value to fewer significant figures than the source data provides

### 7.2 Layout

```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Logo | Standard Selector | Unit Toggle         │
├─────────────────────────────────────────────────────────┤
│  MODE SELECTOR: [Interpolation Mode] [Table Lookup]     │
├───────────────────────┬─────────────────────────────────┤
│  INPUT PANEL (left)   │  RESULTS PANEL (right)          │
│  ─────────────────    │  ─────────────────────────────  │
│  Region type select   │  Region Indicator badge         │
│  Input fields         │  Property value cards           │
│  [Calculate] button   │  ─────────────────────────────  │
│                       │  [▼ Show Interpolation Work]    │
│                       │  Bounding points table          │
│                       │  Fraction calculation           │
│                       │  Step-by-step math              │
└───────────────────────┴─────────────────────────────────┘
│  DISCLAIMER BANNER (always visible at bottom)           │
└─────────────────────────────────────────────────────────┘
```

For Table Lookup mode, the right panel becomes a full-width scrollable table grid.

### 7.3 Key Components

**RegionIndicator:**
- Always visible badge
- SUBCOOLED → blue
- SATURATED → green
- SUPERHEATED → amber
- SUPERCRITICAL → purple
- Updates reactively as inputs change

**ShowWorkPanel:**
- Collapsible, open by default
- Shows exact formula used with variable substitution
- Example display:
  ```
  Linear Interpolation
  ─────────────────────────────────────
  h = h₁ + [(T − T₁) / (T₂ − T₁)] × (h₂ − h₁)
  h = 2675.5 + [(175 − 150) / (200 − 150)] × (2870.7 − 2675.5)
  h = 2675.5 + [0.5000] × 195.2
  h = 2675.5 + 97.60
  h = 2773.1 kJ/kg
  ─────────────────────────────────────
  Bounding Points:
    T₁ = 150°C → h₁ = 2675.5 kJ/kg
    T₂ = 200°C → h₂ = 2870.7 kJ/kg
  Interpolation Fraction: 0.5000
  ```

**WarningBanner (out-of-bounds):**
- Red bordered box, full width
- ⚠️ icon + warning text
- Cannot be dismissed — must be visible alongside any result

**CriticalPointFlag:**
- Shown inline in table rows near critical point
- ⚠️ icon with tooltip: "Near critical point — property gradients are extremely steep in this region. Tabulated values are sensitive to small state changes."

**DisclaimerBanner:**
- Persistent footer: "Values are based on referenced steam table data. Always verify critical engineering calculations against primary published standards."
- Visible on all views, never collapsible

### 7.4 Table Lookup Mode — Mandatory Warning Display

All four mandatory warnings must be displayed in a collapsible "Data Integrity Notices" panel at the top of the Table Lookup view. Open by default. Closeable but not permanently dismissible.

```
⚠️ These are tabulated reference values reproduced for educational and engineering
   reference purposes. They are not a substitute for the original published standards.

⚠️ Tabulated steam tables are discretized data — they represent property values only
   at the specific listed state points.

⚠️ Different published standards may list marginally different values at identical
   state points due to differences in the underlying equations of state.

⚠️ Do not cite this portal as a primary source in engineering documentation.
```

---

## 8. GLOBAL STATE (store/appStore.ts)

```typescript
interface AppState {
  // User selections
  standard: Standard;
  unitSystem: UnitSystem;
  mode: 'INTERPOLATION' | 'TABLE_LOOKUP';

  // Interpolation mode state
  tableType: TableType;
  inputs: { T?: number; P?: number; x?: number };
  result: InterpolationResult | null;
  isCalculating: boolean;
  error: string | null;

  // Table lookup mode state
  lookupTableType: TableType;
  lookupIndex: number | null;
  lookupResult: LookupResult | null;
  showFullTable: boolean;

  // Actions
  setStandard: (s: Standard) => void;
  setUnitSystem: (u: UnitSystem) => void;
  setMode: (m: 'INTERPOLATION' | 'TABLE_LOOKUP') => void;
  calculate: () => void;
  lookup: () => void;
  exportCSV: () => void;
}
```

---

## 9. CRITICAL ENGINEERING CONSTRAINTS — NON-NEGOTIABLE

These are hard requirements. They must never be violated:

1. **No fabricated data.** Every data point must correspond to a real published thermodynamic value. If a value cannot be confirmed, mark it `[UNVERIFIED]` and exclude it from computation.

2. **No silent extrapolation.** If input is outside table bounds, throw a visible, styled error — never return a silently extrapolated value.

3. **No blurred distinction.** Tabulated values and interpolated values must never appear in the same output field without explicit labeling. Use distinct visual styling (e.g., green badge for "Tabulated" vs. purple badge for "Interpolated").

4. **No silent nearest-row return.** In Table Lookup mode, if no exact match exists, return the bounding points and a mode-switch prompt — never the nearest row without warning.

5. **No unit mixing.** All internal math in SI. Conversion only at display layer. If unit system changes, all displayed values recompute immediately.

6. **No dropped units.** Every numerical value displayed must have its unit label adjacent. No exceptions.

7. **No rounding below source precision.** If the source data has 6 significant figures, display 6 significant figures.

8. **No blending standards.** In Table Lookup mode, a returned row must come from exactly one standard. Never mix rows or blend values from two standards.

---

## 10. CONSTANTS

```typescript
// Critical point of water
export const CRITICAL_POINT = {
  T: 374.14,    // °C
  P: 22.089,    // MPa
  rho: 317.0,   // kg/m³
};

// Triple point of water
export const TRIPLE_POINT = {
  T: 0.01,      // °C
  P: 0.000612,  // MPa
};

// "Near critical point" threshold — flag any data within this range
export const CRITICAL_PROXIMITY = {
  dT: 10,       // °C — within 10°C of critical T
  dP: 2.0,      // MPa — within 2 MPa of critical P
};
```

---

## 11. VERCEL DEPLOYMENT CONFIGURATION

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### package.json scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

### Environment
No environment variables required. All data is static and bundled.

---

## 12. BUILD ORDER FOR CLAUDE CODE

Execute in this exact sequence. Do not skip ahead. Do not start the next phase until the current phase is running:

### Phase 1 — Foundation (verify: `npm run dev` renders the shell)
1. Scaffold project: `npm create vite@latest clausius -- --template react-ts`
2. Install dependencies: `npm install zustand react-router-dom papaparse file-saver tailwindcss @types/file-saver`
3. Configure Tailwind with the design tokens from Section 7.1
4. Build AppShell, Header, DisclaimerBanner, ModeSelectorc
5. Build StandardSelector and UnitToggle as controlled components
6. Implement engine/types.ts — all types from Section 3.1
7. Implement engine/units.ts — all conversions from Section 6
8. Set up Zustand store (appStore.ts) with initial state
9. Verify: app renders, mode switching works, unit toggle works

### Phase 2 — Data Layer (verify: console.log of a table row shows correct values)
1. Populate `iapws_if97/saturated_temperature.ts` — all 76+ rows
2. Populate `iapws_if97/saturated_pressure.ts` — all 47+ rows
3. Populate `iapws_if97/superheated.ts` — all pressure slices
4. Populate `iapws_if97/compressed_liquid.ts`
5. Populate `cengel_boles/` — same tables
6. Populate `asme_if97/` — same tables (with ASME labeling)
7. Populate `iapws_95/` — saturated tables only
8. Build `data/index.ts` — unified registry that returns the right table given (standard, tableType)
9. Verify: data loads correctly, critical point flags are set

### Phase 3 — Interpolation Engine (verify: known test cases pass)
1. Implement `engine/interpolation.ts` — linear, bilinear, quality-based
2. Implement `engine/regions.ts` — region detection
3. Implement `engine/lookup.ts` — exact lookup with exact-match enforcement
4. Wire `useInterpolation` and `useLookup` hooks
5. Test cases to verify:
   - Saturated water at 150°C → known IAPWS-IF97 values
   - Superheated steam at 1 MPa, 300°C → known values
   - Wet steam at 2 MPa, x=0.8 → quality interpolation
   - Input of 183°C in lookup mode → must return bounds, not row 180°C

### Phase 4 — Interpolation Mode UI (verify: full calculation flow works)
1. Build InputForm with region type selector and input fields
2. Build ResultsDisplay — property cards with value/unit display
3. Build ShowWorkPanel — formula display with collapsible toggle
4. Build RegionIndicator badge
5. Build WarningBanner for out-of-bounds errors
6. Connect all to Zustand store
7. Verify: end-to-end calculation with Show Work visible

### Phase 5 — Table Lookup Mode UI (verify: table renders and exact match enforcement works)
1. Build TableSelector
2. Build TableGrid — scrollable, sticky header, critical point flags
3. Build ExactMatchRow with Copy Row button
4. Implement Export CSV
5. Build Data Integrity Notices panel (4 warnings)
6. Verify: lookup for exact value returns correct row; lookup for non-tabulated value returns bounds + prompt

### Phase 6 — Polish & Deploy (verify: `npm run build` succeeds, Vercel deployment live)
1. Responsive layout (tablet/desktop — this is an engineering tool, mobile is secondary)
2. Load `JetBrains Mono` and `IBM Plex Sans` from Google Fonts
3. Add favicon (SVG thermometer or wave icon)
4. Write README.md with usage instructions and data source citations
5. Create vercel.json
6. Push to GitHub
7. Deploy via `vercel deploy` or Vercel dashboard GitHub integration

---

## 13. TEST CASES — KNOWN VALUES

Use these to verify computation correctness. If your output does not match, the data or engine is wrong — do not adjust the test to match the output.

| Standard | Table | Input | Property | Expected Value | Units |
|---|---|---|---|---|---|
| IAPWS-IF97 | Sat. Temp | T = 100°C | hg | 2675.6 | kJ/kg |
| IAPWS-IF97 | Sat. Temp | T = 100°C | hf | 419.06 | kJ/kg |
| IAPWS-IF97 | Sat. Temp | T = 100°C | Psat | 0.10142 | MPa |
| IAPWS-IF97 | Sat. Temp | T = 200°C | hg | 2793.2 | kJ/kg |
| IAPWS-IF97 | Sat. Temp | T = 200°C | sf | 2.3309 | kJ/(kg·K) |
| IAPWS-IF97 | Sat. Press | P = 1.0 MPa | Tsat | 179.91 | °C |
| IAPWS-IF97 | Sat. Press | P = 1.0 MPa | hg | 2778.1 | kJ/kg |
| IAPWS-IF97 | Superheated | P=1 MPa, T=300°C | h | 3051.2 | kJ/kg |
| IAPWS-IF97 | Superheated | P=1 MPa, T=300°C | s | 7.1229 | kJ/(kg·K) |
| IAPWS-IF97 | Superheated | P=5 MPa, T=400°C | h | 3196.7 | kJ/kg |

---

## 14. DATA SOURCE CITATIONS

Include these citations in the app's README and in relevant UI tooltips:

- **IAPWS-IF97:** Wagner, W. and Kruse, A. (1998). *Properties of Water and Steam*. Springer-Verlag. ISBN 3-540-64439-7. IAPWS Release on the IAPWS Industrial Formulation 1997.
- **IAPWS-95:** Wagner, W. and Pruß, A. (2002). The IAPWS Formulation 1995 for the Thermodynamic Properties of Ordinary Water Substance for General and Scientific Use. *Journal of Physical and Chemical Reference Data*, 31(2), 387–535.
- **Çengel & Boles:** Çengel, Y.A. and Boles, M.A. *Thermodynamics: An Engineering Approach*, 8th Edition. McGraw-Hill Education. Tables A-4, A-5, A-6.
- **ASME:** ASME International Steam Tables for Industrial Use (ASME PTC 19.1). Based on IAPWS-IF97.

---

## 15. LICENSING & DISCLAIMER NOTICES

These notices must appear in the application:

**In-app footer (always visible):**
> "Values are based on referenced steam table data. Always verify critical engineering calculations against primary published standards."

**ASME label tooltip:**
> "ASME Steam Tables are based on the IAPWS-IF97 formulation. Values shown are IAPWS-IF97 compliant. For ASME code compliance work, always consult the licensed ASME publication directly. This portal is not affiliated with ASME."

**Çengel & Boles label tooltip:**
> "Values consistent with Çengel & Boles, Thermodynamics: An Engineering Approach. These are derived tabulations from IAPWS-IF97, not an equation-of-state computation. Differences from IAPWS-IF97 values reflect rounding in the textbook publication."

**IAPWS-95 label tooltip:**
> "IAPWS-95 Scientific Formulation (Wagner & Pruß, 2002). Values computed from the IAPWS-95 formulation provide higher accuracy than IF97, particularly near the critical point."

---

*End of Master Build Brief*
*Version: 1.0 — May 2026*
*Prepared for Claude Code — Steam Table Interpolation Portal*
