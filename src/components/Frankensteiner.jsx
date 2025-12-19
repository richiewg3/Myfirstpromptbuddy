import { useState } from 'react'
import { ResultItem } from './ResultItem'
import { FRANKENSTEINER_DEFAULTS } from '../constants/defaults'

export function Frankensteiner({ onCopy }) {
  const [style, setStyle] = useState('')
  const [camera, setCamera] = useState('')
  const [chars, setChars] = useState(() => JSON.parse(JSON.stringify(FRANKENSTEINER_DEFAULTS)))
  const [sceneInput, setSceneInput] = useState('')
  const [results, setResults] = useState([])

  const addChar = () => {
    setChars([...chars, {
      id: 'fc' + Date.now(),
      name: 'New Block',
      text: '',
      active: true
    }])
  }

  const deleteChar = (id) => {
    if (confirm('Delete?')) {
      setChars(chars.filter(c => c.id !== id))
    }
  }

  const updateChar = (id, key, value) => {
    setChars(chars.map(c => c.id === id ? { ...c, [key]: value } : c))
  }

  const toggleCharActive = (id) => {
    setChars(chars.map(c => c.id === id ? { ...c, active: !c.active } : c))
  }

  const buildPrompts = () => {
    const activeChars = chars.filter(c => c.active && c.text.trim())
      .map(c => c.text.trim())
      .join('\n\n')
    const scenes = sceneInput.split('\n').filter(x => x.trim())

    const newResults = scenes.map((scene) => {
      return [style, camera, activeChars, 'SCENE: ' + scene]
        .filter(x => x.trim())
        .join('\n\n')
    })

    setResults(newResults)
  }

  const copyAll = () => {
    const allText = results.join('\n\n---\n\n')
    onCopy(allText)
  }

  return (
    <div className="wrap">
      <div className="grid-main">
        {/* Configuration Panel */}
        <section className="card">
          <div className="card-hd">
            <div className="card-title">Configuration</div>
          </div>
          <div className="card-bd">
            <div className="input-group">
              <label>Style Block</label>
              <textarea
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Pixar style, 3D render..."
              />
            </div>
            <div className="input-group">
              <label>Camera Block</label>
              <textarea
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                placeholder="Wide angle, 35mm..."
              />
            </div>
            <div className="hr" />
            <label>Characters (Manual Blocks)</label>
            <div>
              {chars.map((char) => (
                <div key={char.id} className="accordion open">
                  <div className="acc-head" style={{ background: '#0b0d12' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={char.active}
                        onChange={() => toggleCharActive(char.id)}
                      />
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => updateChar(char.id, 'name', e.target.value)}
                        style={{
                          border: 'none',
                          padding: 0,
                          height: 'auto',
                          width: '150px',
                          fontWeight: 700
                        }}
                      />
                    </div>
                    <button
                      className="btn small danger"
                      onClick={() => deleteChar(char.id)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="acc-body" style={{ display: 'block' }}>
                    <textarea
                      placeholder="Character block..."
                      value={char.text}
                      onChange={(e) => updateChar(char.id, 'text', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn small primary"
              style={{ marginTop: '10px' }}
              onClick={addChar}
            >
              + Add Block
            </button>
          </div>
        </section>

        {/* Prompt Builder Panel */}
        <section className="card">
          <div className="card-hd">
            <div className="card-title">Prompt Builder</div>
          </div>
          <div className="card-bd">
            <label>Scene List (1 per line)</label>
            <textarea
              style={{ height: '200px' }}
              value={sceneInput}
              onChange={(e) => setSceneInput(e.target.value)}
              placeholder="Scene 1...\nScene 2..."
            />
            <div className="flex-row" style={{ marginTop: '10px' }}>
              <button
                className="btn primary"
                style={{ flex: 1 }}
                onClick={buildPrompts}
              >
                Build Prompts
              </button>
              <button className="btn" onClick={copyAll} disabled={results.length === 0}>
                Copy All
              </button>
            </div>
            <div className="hr" />
            <div>
              {results.map((result, index) => (
                <ResultItem
                  key={index}
                  index={index}
                  content={result}
                  onCopy={onCopy}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
