# Clausius — Steam Table Interpolation Portal

A web-based steam table lookup and interpolation tool for engineering thermodynamics. Enter a temperature or pressure and instantly retrieve all saturated and superheated water/steam properties, with linear interpolation between tabulated values.

Live: **https://clausius.vercel.app**

---

## Features

- Saturated temperature table (1°C – 370°C)
- Saturated pressure table (0.001 – 22.089 MPa)
- Superheated steam table (multiple pressures, 100°C – 1300°C)
- Linear interpolation for inputs between tabulated values
- Four data-source standards selectable at runtime: IAPWS-IF97, IAPWS-95, Çengel & Boles, ASME-IF97
- CSV export of any result set
- Disclaimer banner with per-standard attribution

---

## Local Development

**Requirements:** Node.js 18+

```bash
git clone https://github.com/themadshaikh/clausius.git
cd clausius
npm install
npm run dev
```

Open http://localhost:5173.

**Build for production:**

```bash
npm run build
npm run preview
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| State | Zustand 5 |
| CSV export | PapaParse + file-saver |
| Deployment | Vercel |

---

## Data Sources and Citations

Tabulated values are drawn from the following primary references. Each standard can be selected independently in the UI.

**IAPWS-IF97 (default)**
> Wagner, W. and Kruse, A. (1998). *Properties of Water and Steam*. Springer-Verlag. ISBN 3-540-64439-7. IAPWS Release on the IAPWS Industrial Formulation 1997.

**IAPWS-95**
> Wagner, W. and Pruß, A. (2002). The IAPWS Formulation 1995 for the Thermodynamic Properties of Ordinary Water Substance for General and Scientific Use. *Journal of Physical and Chemical Reference Data*, 31(2), 387–535.

**Çengel & Boles**
> Çengel, Y.A. and Boles, M.A. *Thermodynamics: An Engineering Approach*, 8th Edition. McGraw-Hill Education. Tables A-4, A-5, A-6.
>
> Values consistent with the textbook tabulation. These are derived from IAPWS-IF97; differences from raw IAPWS-IF97 values reflect rounding in the textbook publication.

**ASME-IF97**
> ASME International Steam Tables for Industrial Use (ASME PTC 19.1). Based on IAPWS-IF97.
>
> ASME Steam Tables are based on the IAPWS-IF97 formulation. Values shown are IAPWS-IF97 compliant. For ASME code compliance work, always consult the licensed ASME publication directly. This portal is not affiliated with ASME.

---

## About the Name

**Why Clausius?**
Rudolf Clausius (1822–1888) spent his career telling the world
that entropy always increases. It seemed fitting to name a tool
that tracks entropy to 6 significant figures after the man who
made us care about it in the first place.

The real irony: Clausius's second law says the universe tends
toward disorder. This tool exists to bring order to thermodynamic
data. He'd probably consider that a violation of his own law.

---

## Disclaimer

This portal is provided for educational and reference purposes only. Values are tabulated from published standards and interpolated linearly; they are not computed from the underlying equations of state. For safety-critical or code-compliance work, always verify against the original licensed publications listed above.

---

## License

MIT © 2026 Mateen Shaikh
