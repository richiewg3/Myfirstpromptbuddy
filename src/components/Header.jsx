export function Header({ showNav, onDashboard, onApiModal }) {
  return (
    <header>
      <div className="wrap flex-split">
        <div className="brand">Pawsville <span>Studio</span></div>
        {showNav && (
          <div className="flex-row">
            <button className="nav-btn" onClick={onDashboard}>⌂ Dashboard</button>
            <button className="nav-btn" onClick={onApiModal}>🔑 API Key</button>
          </div>
        )}
      </div>
    </header>
  )
}
