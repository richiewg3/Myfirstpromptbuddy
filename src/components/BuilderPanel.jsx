import { useMemo, useState } from 'react';
import { buildPrompt } from '../utils/promptBuilder';
import { copyText } from '../utils/clipboard';
import { ResultCard } from './ResultCard';

export function BuilderPanel({ state, toast }) {
  const [tab, setTab] = useState('batch'); // 'batch' | 'single'

  const [batchBodies, setBatchBodies] = useState('');
  const [batchResults, setBatchResults] = useState([]);

  const [singleBody, setSingleBody] = useState('');
  const [singleOutput, setSingleOutput] = useState('');

  const canCopyAll = batchResults.length > 0;
  const canCopySingle = Boolean(singleOutput);

  const promptCtx = useMemo(
    () => ({
      globals: state.globals,
      characters: state.characters,
      promptOrder: state.promptOrder,
    }),
    [state.characters, state.globals, state.promptOrder],
  );

  async function handleCopy(value) {
    const ok = await copyText(value);
    toast(ok ? 'Copied!' : 'Copy failed');
  }

  function generateBatch() {
    const lines = batchBodies
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      toast('No scenes found');
      setBatchResults([]);
      return;
    }

    const next = lines.map((scene) => ({
      scene,
      prompt: buildPrompt({ sceneBody: scene, ...promptCtx }),
      open: false,
    }));

    setBatchResults(next);
    toast(`Generated ${lines.length} prompts`);
  }

  function generateSingle() {
    const res = buildPrompt({ sceneBody: singleBody, ...promptCtx });
    setSingleOutput(res);
  }

  return (
    <section className="card">
      <div className="hd">
        <div className="title">2. Build Prompts</div>
        <div className="tabs">
          <button type="button" className={`tab ${tab === 'batch' ? 'active' : ''}`} onClick={() => setTab('batch')}>
            Batch
          </button>
          <button type="button" className={`tab ${tab === 'single' ? 'active' : ''}`} onClick={() => setTab('single')}>
            Single
          </button>
        </div>
      </div>

      <div className="bd">
        {tab === 'batch' ? (
          <div>
            <label>Scene List (Press Enter for new prompt)</label>
            <textarea
              value={batchBodies}
              onChange={(e) => setBatchBodies(e.target.value)}
              style={{ minHeight: 150, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
              placeholder={`Scene 1: Cat kickflips...\nScene 2: Dragon cheers...`}
            />

            <div className="split">
              <button type="button" className="btn primary" style={{ flex: 2 }} onClick={generateBatch}>
                Generate All
              </button>
              <button
                type="button"
                className="btn"
                disabled={!canCopyAll}
                onClick={() => handleCopy(batchResults.map((r) => r.prompt).join('\n\n---\n\n'))}
              >
                Copy All
              </button>
            </div>

            <div className="result-list">
              {batchResults.map((r, i) => (
                <ResultCard
                  key={`${r.scene}-${i}`}
                  index={i + 1}
                  scene={r.scene}
                  prompt={r.prompt}
                  open={r.open}
                  onToggle={() =>
                    setBatchResults((prev) => prev.map((x, idx) => (idx === i ? { ...x, open: !x.open } : x)))
                  }
                  onCopy={() => handleCopy(r.prompt)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label>Single Scene</label>
            <textarea value={singleBody} onChange={(e) => setSingleBody(e.target.value)} style={{ minHeight: 150 }} />

            <div className="split">
              <button type="button" className="btn primary" style={{ flex: 2 }} onClick={generateSingle}>
                Generate
              </button>
              <button type="button" className="btn" disabled={!canCopySingle} onClick={() => handleCopy(singleOutput)}>
                Copy
              </button>
            </div>

            <div style={{ marginTop: 15, background: '#050608', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
              <pre style={{ color: singleOutput ? '#dfe4ff' : '#6b7280' }}>{singleOutput || '(Result here)'}</pre>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

