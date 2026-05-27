import type { Standard, TableType, SteamProperties, SuperheatedPressureSlice, CompressedLiquidPoint } from '../engine/types';

import { IAPWS_IF97_SAT_TEMP } from './iapws_if97/saturated_temperature';
import { IAPWS_IF97_SAT_PRES } from './iapws_if97/saturated_pressure';
import { IAPWS_IF97_SUPERHEATED } from './iapws_if97/superheated';
import { IAPWS_IF97_COMPRESSED } from './iapws_if97/compressed_liquid';

import { CENGEL_BOLES_SAT_TEMP } from './cengel_boles/saturated_temperature';
import { CENGEL_BOLES_SAT_PRES } from './cengel_boles/saturated_pressure';
import { CENGEL_BOLES_SUPERHEATED } from './cengel_boles/superheated';

import { ASME_IF97_SAT_TEMP } from './asme_if97/saturated_temperature';
import { ASME_IF97_SAT_PRES } from './asme_if97/saturated_pressure';
import { ASME_IF97_SUPERHEATED } from './asme_if97/superheated';

import { IAPWS_95_SAT_TEMP } from './iapws_95/saturated_temperature';
import { IAPWS_95_SAT_PRES } from './iapws_95/saturated_pressure';

type TableData = SteamProperties[] | SuperheatedPressureSlice[] | CompressedLiquidPoint[];

export function getTable(standard: Standard, tableType: TableType): TableData {
  if (standard === 'IAPWS-IF97') {
    switch (tableType) {
      case 'SATURATED_TEMPERATURE': return IAPWS_IF97_SAT_TEMP;
      case 'SATURATED_PRESSURE':    return IAPWS_IF97_SAT_PRES;
      case 'SUPERHEATED':           return IAPWS_IF97_SUPERHEATED;
      case 'COMPRESSED_LIQUID':     return IAPWS_IF97_COMPRESSED;
    }
  }

  if (standard === 'CENGEL-BOLES') {
    switch (tableType) {
      case 'SATURATED_TEMPERATURE': return CENGEL_BOLES_SAT_TEMP;
      case 'SATURATED_PRESSURE':    return CENGEL_BOLES_SAT_PRES;
      case 'SUPERHEATED':           return CENGEL_BOLES_SUPERHEATED;
      case 'COMPRESSED_LIQUID':     return IAPWS_IF97_COMPRESSED;
    }
  }

  if (standard === 'ASME-IF97') {
    switch (tableType) {
      case 'SATURATED_TEMPERATURE': return ASME_IF97_SAT_TEMP;
      case 'SATURATED_PRESSURE':    return ASME_IF97_SAT_PRES;
      case 'SUPERHEATED':           return ASME_IF97_SUPERHEATED;
      case 'COMPRESSED_LIQUID':     return IAPWS_IF97_COMPRESSED;
    }
  }

  if (standard === 'IAPWS-95') {
    switch (tableType) {
      case 'SATURATED_TEMPERATURE': return IAPWS_95_SAT_TEMP;
      case 'SATURATED_PRESSURE':    return IAPWS_95_SAT_PRES;
      case 'SUPERHEATED':
        throw new Error('IAPWS-95 does not provide a superheated steam grid. Use IAPWS-IF97 for superheated calculations.');
      case 'COMPRESSED_LIQUID':
        throw new Error('IAPWS-95 compressed liquid grid not available. Use IAPWS-IF97.');
    }
  }

  throw new Error(`Unknown standard or table combination: ${standard}, ${tableType}`);
}

export {
  IAPWS_IF97_SAT_TEMP, IAPWS_IF97_SAT_PRES, IAPWS_IF97_SUPERHEATED, IAPWS_IF97_COMPRESSED,
  CENGEL_BOLES_SAT_TEMP, CENGEL_BOLES_SAT_PRES, CENGEL_BOLES_SUPERHEATED,
  ASME_IF97_SAT_TEMP, ASME_IF97_SAT_PRES, ASME_IF97_SUPERHEATED,
  IAPWS_95_SAT_TEMP, IAPWS_95_SAT_PRES,
};
