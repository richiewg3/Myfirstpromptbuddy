import { useEffect, useState } from 'react';
import { BuilderPanel } from './components/BuilderPanel';
import { DashboardPanel } from './components/DashboardPanel';
import { Layout } from './components/Layout';
import { SetupPanel } from './components/SetupPanel';
import { usePawsvilleState } from './hooks/usePawsvilleState';
import { usePromptHistory } from './hooks/usePromptHistory';
import { useToast } from './hooks/useToast';

export default function App() {
  const { toast, Toast } = useToast();
  const { state, actions, migratedFromV4 } = usePawsvilleState();
  const [view, setView] = useState('builder'); // 'builder' | 'dashboard'
  const historyApi = usePromptHistory();

  useEffect(() => {
    if (migratedFromV4) toast('Migrating v4 data...');
  }, [migratedFromV4, toast]);

  return (
    <>
      <Layout
        title="Pawsville Refinery v10"
        subtitle={view === 'dashboard' ? 'Texture Engine • Dashboard' : 'Texture Engine • Builder'}
        headerRight={
          <div className="tabs" aria-label="View switcher">
            <button type="button" className={`tab ${view === 'builder' ? 'active' : ''}`} onClick={() => setView('builder')}>
              Builder
            </button>
            <button type="button" className={`tab ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
              Dashboard
            </button>
          </div>
        }
        left={<SetupPanel state={state} actions={actions} toast={toast} />}
        right={
          view === 'dashboard' ? (
            <DashboardPanel
              state={state}
              history={historyApi.history}
              onRemoveHistoryItem={historyApi.removeEntry}
              onClearHistory={historyApi.clear}
              onExportHistory={historyApi.exportJson}
              toast={toast}
            />
          ) : (
            <BuilderPanel
              state={state}
              toast={toast}
              onGenerated={(items) => {
                historyApi.addEntries(items);
              }}
            />
          )
        }
      />
      <Toast />
    </>
  );
}
