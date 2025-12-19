export function Layout({ left, right, headerRight, title = 'Pawsville Refinery', subtitle = 'Texture Engine • Dashboard' }) {
  return (
    <>
      <header>
        <div className="wrap">
          <div>
            <h1>{title}</h1>
            <div className="sub">{subtitle}</div>
          </div>
          <div>{headerRight}</div>
        </div>
      </header>

      <main>
        {left}
        {right}
      </main>
    </>
  );
}

