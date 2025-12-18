export function ResultCard({ index, scene, prompt, open, onToggle, onCopy }) {
  return (
    <div className={`result-card ${open ? 'open' : ''}`}>
      <div className="result-head" onClick={onToggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onToggle?.()}>
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
        >
          {index}. {scene}
        </span>
        <button
          type="button"
          className="btn small"
          style={{ pointerEvents: 'all' }}
          onClick={(e) => {
            e.stopPropagation();
            onCopy?.();
          }}
        >
          Copy
        </button>
      </div>
      <div className="result-body">
        <pre>{prompt}</pre>
      </div>
    </div>
  );
}

