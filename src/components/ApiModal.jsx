import { useState } from 'react'

export function ApiModal({ show, apiConfig, onSave, onClose }) {
  const [provider, setProvider] = useState(apiConfig.provider)
  const [apiKey, setApiKey] = useState(apiConfig.key)

  const handleSave = () => {
    onSave({ provider, key: apiKey })
  }

  const handleOpen = () => {
    setProvider(apiConfig.provider)
    setApiKey(apiConfig.key)
  }

  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`} onTransitionEnd={show ? handleOpen : undefined}>
      <div className="modal">
        <h3>API Settings</h3>
        <label>Provider</label>
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="gemini">Google Gemini (Recommended)</option>
          <option value="openai">OpenAI (GPT-4o)</option>
        </select>
        <label style={{ marginTop: '10px' }}>API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste key here..."
        />
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
          Stored in local browser storage only.
        </div>
        <div className="flex-row" style={{ marginTop: '20px' }}>
          <button className="btn primary" style={{ flex: 1 }} onClick={handleSave}>
            Save
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
