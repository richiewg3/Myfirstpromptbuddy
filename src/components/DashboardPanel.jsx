import { useMemo, useState } from 'react';
import { copyText } from '../utils/clipboard';

function formatTime(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(
      new Date(ts),
    );
  } catch {
    return '';
  }
}

function textureLabel(val) {
  if (val === 'high') return 'High';
  if (val === 'extreme') return 'Extreme';
  return 'Standard';
}

export function DashboardPanel({ state, history, onRemoveHistoryItem, onClearHistory, onExportHistory, toast }) {
  const [openIds, setOpenIds] = useState(() => new Set());

  const stats = useMemo(() => {
    const totalChars = state.characters.length;
    const activeChars = state.characters.filter((c) => c.active).length;
    const texture = textureLabel(state.globals.texture);
    const prompts = history.length;
    const lastGenerated = history[0]?.ts ? formatTime(history[0].ts) : '—';
    return { totalChars, activeChars, texture, prompts, lastGenerated };
  }, [history, state.characters, state.globals.texture]);

  async function handleCopy(value) {
    const ok = await copyText(value);
    toast(ok ? 'Copied!' : 'Copy failed');
  }

  return (
    <section className="card">
      <div className="hd">
        <div className="title">2. Dashboard</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn small"
            onClick={() => {
              const text = onExportHistory?.();
              if (!text) return toast('Nothing to export');
              handleCopy(text);
            }}
            disabled={history.length === 0}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="btn small danger"
            onClick={() => {
              if (history.length === 0) return;
              if (!window.confirm('Clear prompt history?')) return;
              onClearHistory?.();
              toast('History cleared');
            }}
            disabled={history.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bd">
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-label">Characters</div>
            <div className="stat-value">{stats.totalChars}</div>
            <div className="stat-sub">{stats.activeChars} active</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Texture</div>
            <div className="stat-value">{stats.texture}</div>
            <div className="stat-sub">Global intensity</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Prompts Generated</div>
            <div className="stat-value">{stats.prompts}</div>
            <div className="stat-sub">Last: {stats.lastGenerated}</div>
          </div>
        </div>

        <div className="hr" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <div className="title" style={{ fontSize: 12, color: 'var(--accent)' }}>
            PROMPT HISTORY
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 11 }}>{history.length ? 'Newest first' : 'No history yet'}</div>
        </div>

        <div className="result-list">
          {history.map((item, i) => {
            const open = openIds.has(item.id);
            return (
              <div key={item.id} className={`result-card ${open ? 'open' : ''}`}>
                <div
                  className="result-head"
                  onClick={() =>
                    setOpenIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setOpenIds((prev) => new Set(prev.has(item.id) ? [...prev].filter((x) => x !== item.id) : [...prev, item.id]))}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '70%',
                    }}
                    title={item.scene}
                  >
                    {i + 1}. {item.scene || '(no scene)'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn small"
                      style={{ pointerEvents: 'all' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.prompt);
                      }}
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      className="btn small danger"
                      style={{ pointerEvents: 'all' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveHistoryItem?.(item.id);
                      }}
                      aria-label="Delete history item"
                    >
                      &times;
                    </button>
                  </div>
                </div>
                <div className="result-body">
                  <div style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 10 }}>
                    {item.mode === 'single' ? 'Single' : 'Batch'} • {formatTime(item.ts)}
                  </div>
                  <pre>{item.prompt}</pre>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

