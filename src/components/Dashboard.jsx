export function Dashboard({ onSelectTool }) {
  return (
    <div className="view-dashboard">
      <div className="dash-container">
        <div className="dash-title">Welcome back, Sir Meowington.</div>
        <div className="dash-subtitle">Select your tool to begin.</div>

        <div className="dash-grid">
          {/* Card 1: Frankensteiner */}
          <div className="dash-card" onClick={() => onSelectTool('frankensteiner')}>
            <span className="tag tag-manual">Manual Builder</span>
            <span className="dash-icon">🛠️</span>
            <h3>The Frankensteiner</h3>
            <p>Classic block-builder. Manually stack Global Settings, Characters, and Scenes. No API required.</p>
          </div>

          {/* Card 2: Refinery */}
          <div className="dash-card" onClick={() => onSelectTool('refinery')}>
            <span className="tag tag-ai">AI Enhancer</span>
            <span className="dash-icon">✨</span>
            <h3>The Refinery</h3>
            <p>AI-powered studio. Includes Vision (Image-to-Text), Wardrobes, Texture Engine, and Auto-Enhance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
