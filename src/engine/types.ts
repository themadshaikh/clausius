export interface SteamProperties {
  T: number;
  P: number;
  hf: number;
  hfg: number;
  hg: number;
  sf: number;
  sfg: number;
  sg: number;
  vf: number;
  vg: number;
  uf: number;
  ufg: number;
  ug: number;
  nearCriticalPoint?: boolean;
}

export interface SuperheatedPoint {
  T: number;
  h: number;
  s: number;
  v: number;
  u: number;
}

export interface SuperheatedPressureSlice {
  P: number;
  Tsat: number;
  points: SuperheatedPoint[];
}

export interface CompressedLiquidPoint {
  T: number;
  P: number;
  h: number;
  s: number;
  v: number;
  u: number;
}

export type Standard = 'IAPWS-IF97' | 'IAPWS-95' | 'CENGEL-BOLES' | 'ASME-IF97';

export type TableType =
  | 'SATURATED_TEMPERATURE'
  | 'SATURATED_PRESSURE'
  | 'SUPERHEATED'
  | 'COMPRESSED_LIQUID';

export type Region = 'SUBCOOLED' | 'SATURATED' | 'SUPERHEATED' | 'SUPERCRITICAL';

export type UnitSystem = 'SI' | 'IMPERIAL';

export interface BilinearStep {
  description: string;
  lowerBound: number;
  upperBound: number;
  fraction: number;
  result: number;
  property: string;
}

export interface InterpolationWork {
  lowerBound: { index: number | string; values: Partial<Record<string, number>> };
  upperBound: { index: number | string; values: Partial<Record<string, number>> };
  fraction: number;
  formula: string;
  intermediateSteps?: BilinearStep[];
}

export interface InterpolationResult {
  properties: Partial<SteamProperties & SuperheatedPoint>;
  region: Region;
  interpolationType: 'LINEAR' | 'BILINEAR' | 'QUALITY_BASED' | 'EXACT';
  workShown: InterpolationWork;
  standard: Standard;
  unitSystem: UnitSystem;
  warnings: string[];
}

export interface LookupResult {
  exactMatch: boolean;
  row?: SteamProperties | SuperheatedPoint | CompressedLiquidPoint;
  lowerBound?: { index: number; row: SteamProperties | SuperheatedPoint | CompressedLiquidPoint };
  upperBound?: { index: number; row: SteamProperties | SuperheatedPoint | CompressedLiquidPoint };
  message?: string;
}

export class OutOfBoundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OutOfBoundsError';
  }
}
