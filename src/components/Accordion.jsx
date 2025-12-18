export function Accordion({ id, open, onToggle, headLeft, headRight, children, className = '' }) {
  return (
    <div className={`accordion ${open ? 'open' : ''} ${className}`.trim()} id={id}>
      <div className="accordion-head" onClick={onToggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onToggle?.()}>
        <div className="left">{headLeft}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {headRight}
          <div className="arrow">▼</div>
        </div>
      </div>
      <div className="accordion-body">{children}</div>
    </div>
  );
}

