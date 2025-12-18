export function Layout({ left, right }) {
  return (
    <>
      <header>
        <div className="wrap">
          <div>
            <h1>Pawsville Frankensteiner v5</h1>
            <div className="sub">Custom Ordering. Dynamic Chars. Batch Cards.</div>
          </div>
          <div
            className="pill"
            style={{
              fontSize: 12,
              color: 'var(--accent2)',
              border: '1px solid var(--border)',
              padding: '4px 10px',
              borderRadius: 12,
            }}
          >
            Ready
          </div>
        </div>
      </header>

      <main>
        {left}
        {right}
      </main>
    </>
  );
}

