import { Header } from './Header';
import { DisclaimerBanner } from './DisclaimerBanner';
import { ModeSelector } from '../controls/ModeSelector';
import { InterpolationPanel } from '../interpolation/InterpolationPanel';
import { TableLookupPanel } from '../lookup/TableLookupPanel';
import { useAppStore } from '../../store/appStore';

export function AppShell() {
  const { mode } = useAppStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}
    >
      <Header />
      <ModeSelector />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {mode === 'INTERPOLATION' ? <InterpolationPanel /> : <TableLookupPanel />}
      </main>
      <DisclaimerBanner />
    </div>
  );
}
