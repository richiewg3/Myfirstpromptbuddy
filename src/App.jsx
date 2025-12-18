import { useEffect } from 'react';
import { BuilderPanel } from './components/BuilderPanel';
import { Layout } from './components/Layout';
import { SetupPanel } from './components/SetupPanel';
import { usePawsvilleState } from './hooks/usePawsvilleState';
import { useToast } from './hooks/useToast';

export default function App() {
  const { toast, Toast } = useToast();
  const { state, actions, migratedFromV4 } = usePawsvilleState();

  useEffect(() => {
    if (migratedFromV4) toast('Migrating v4 data...');
  }, [migratedFromV4, toast]);

  return (
    <>
      <Layout
        left={<SetupPanel state={state} actions={actions} toast={toast} />}
        right={<BuilderPanel state={state} toast={toast} />}
      />
      <Toast />
    </>
  );
}
