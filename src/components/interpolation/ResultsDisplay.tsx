import type { InterpolationResult } from '../../engine/types';
import { ValueDisplay } from '../shared/ValueDisplay';
import { RegionIndicator } from '../controls/RegionIndicator';
import { WarningBanner } from '../shared/WarningBanner';
import { ShowWorkPanel } from './ShowWorkPanel';

interface Props {
  result: InterpolationResult;
}

const SAT_PROPS = [
  { key: 'T', label: 'Temperature', symbol: 'T' },
  { key: 'P', label: 'Pressure', symbol: 'P' },
  { key: 'hf', label: 'Sat. Liquid Enthalpy', symbol: 'h_f' },
  { key: 'hfg', label: 'Evaporation Enthalpy', symbol: 'h_fg' },
  { key: 'hg', label: 'Sat. Vapor Enthalpy', symbol: 'h_g' },
  { key: 'sf', label: 'Sat. Liquid Entropy', symbol: 's_f' },
  { key: 'sfg', label: 'Evaporation Entropy', symbol: 's_fg' },
  { key: 'sg', label: 'Sat. Vapor Entropy', symbol: 's_g' },
  { key: 'vf', label: 'Sat. Liquid Spec. Volume', symbol: 'v_f' },
  { key: 'vg', label: 'Sat. Vapor Spec. Volume', symbol: 'v_g' },
  { key: 'uf', label: 'Sat. Liquid Int. Energy', symbol: 'u_f' },
  { key: 'ufg', label: 'Evaporation Int. Energy', symbol: 'u_fg' },
  { key: 'ug', label: 'Sat. Vapor Int. Energy', symbol: 'u_g' },
];

const SUPERHEATED_PROPS = [
  { key: 'T', label: 'Temperature', symbol: 'T' },
  { key: 'P', label: 'Pressure', symbol: 'P' },
  { key: 'h', label: 'Specific Enthalpy', symbol: 'h' },
  { key: 's', label: 'Specific Entropy', symbol: 's' },
  { key: 'v', label: 'Specific Volume', symbol: 'v' },
  { key: 'u', label: 'Specific Internal Energy', symbol: 'u' },
];

const QUALITY_PROPS = [
  { key: 'T', label: 'Temperature', symbol: 'T' },
  { key: 'P', label: 'Pressure', symbol: 'P' },
  { key: 'h', label: 'Specific Enthalpy', symbol: 'h' },
  { key: 's', label: 'Specific Entropy', symbol: 's' },
  { key: 'v', label: 'Specific Volume', symbol: 'v' },
  { key: 'u', label: 'Specific Internal Energy', symbol: 'u' },
];

const COMPRESSED_PROPS = [
  { key: 'T', label: 'Temperature', symbol: 'T' },
  { key: 'P', label: 'Pressure', symbol: 'P' },
  { key: 'hf', label: 'Specific Enthalpy', symbol: 'h_f' },
  { key: 'sf', label: 'Specific Entropy', symbol: 's_f' },
  { key: 'vf', label: 'Specific Volume', symbol: 'v_f' },
  { key: 'uf', label: 'Specific Internal Energy', symbol: 'u_f' },
];

export function ResultsDisplay({ result }: Props) {
  const isInterpolated = result.interpolationType !== 'EXACT';

  const propsToShow =
    result.interpolationType === 'QUALITY_BASED'
      ? QUALITY_PROPS
      : result.region === 'SUPERHEATED'
      ? SUPERHEATED_PROPS
      : result.region === 'SUBCOOLED'
      ? COMPRESSED_PROPS
      : SAT_PROPS;

  const props = result.properties as Record<string, number | undefined>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Region + type header */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <RegionIndicator region={result.region} />
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          fontFamily: 'var(--ui-font)',
        }}>
          {result.standard} · {result.interpolationType === 'EXACT' ? 'Exact tabulated value' : `${result.interpolationType.replace('_', ' ').toLowerCase()} interpolation`}
        </span>
      </div>

      {/* Warnings */}
      {result.warnings.map((w, i) => (
        <WarningBanner key={i} message={w} type="warning" />
      ))}

      {/* Property cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '8px',
      }}>
        {propsToShow.map(({ key, label, symbol }) => {
          const v = props[key];
          if (v === undefined) return null;
          return (
            <ValueDisplay
              key={key}
              label={label}
              symbol={symbol}
              value={v}
              propKey={key}
              unitSystem={result.unitSystem}
              isInterpolated={isInterpolated && key !== 'T' && key !== 'P'}
            />
          );
        })}
      </div>

      {/* Show Work panel */}
      <ShowWorkPanel work={result.workShown} result={result} />
    </div>
  );
}
