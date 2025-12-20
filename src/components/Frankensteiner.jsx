import { useState, useCallback, useEffect } from 'react'
import { ResultItem } from './ResultItem'
import { 
  FRANKENSTEINER_DEFAULTS, 
  FRANKENSTEINER_STORAGE_KEY,
  DEFAULT_BLOCK_ORDER,
  DEFAULT_COLLAPSED_SECTIONS,
  LIGHTING_PRESETS_DEFAULTS
} from '../constants/defaults'

// Helper to load state from localStorage
function loadSavedState() {
  try {
    const saved = localStorage.getItem(FRANKENSTEINER_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // ignore
  }
  return null
}

export function Frankensteiner({ onCopy }) {
  const savedState = loadSavedState()
  
  const [style, setStyle] = useState(savedState?.style || '')
  const [camera, setCamera] = useState(savedState?.camera || '')
  const [lightingPresets, setLightingPresets] = useState(() => 
    savedState?.lightingPresets || JSON.parse(JSON.stringify(LIGHTING_PRESETS_DEFAULTS))
  )
  const [negativePrompt, setNegativePrompt] = useState(savedState?.negativePrompt || '')
  const [chars, setChars] = useState(() => 
    savedState?.chars || JSON.parse(JSON.stringify(FRANKENSTEINER_DEFAULTS))
  )
  const [sceneInput, setSceneInput] = useState('')
  const [results, setResults] = useState([])
  
  // Global suffix state
  const [globalSuffix, setGlobalSuffix] = useState(savedState?.globalSuffix || '')
  
  // Block ordering state
  const [blockOrder, setBlockOrder] = useState(() => 
    savedState?.blockOrder || JSON.parse(JSON.stringify(DEFAULT_BLOCK_ORDER))
  )
  
  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState(() => 
    savedState?.collapsedSections || { ...DEFAULT_COLLAPSED_SECTIONS }
  )

  // Drag state for reordering
  const [draggedBlock, setDraggedBlock] = useState(null)

  // Save to localStorage whenever relevant state changes
  const saveState = useCallback(() => {
    const data = {
      style,
      camera,
      lightingPresets,
      negativePrompt,
      chars,
      globalSuffix,
      blockOrder,
      collapsedSections
    }
    localStorage.setItem(FRANKENSTEINER_STORAGE_KEY, JSON.stringify(data))
  }, [style, camera, lightingPresets, negativePrompt, chars, globalSuffix, blockOrder, collapsedSections])

  // Auto-save on state changes
  useEffect(() => {
    saveState()
  }, [saveState])

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

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

  // Lighting preset management functions
  const addLightingPreset = () => {
    setLightingPresets([...lightingPresets, {
      id: 'lp' + Date.now(),
      text: '',
      active: true
    }])
  }

  const deleteLightingPreset = (id) => {
    setLightingPresets(lightingPresets.filter(p => p.id !== id))
  }

  const updateLightingPreset = (id, text) => {
    setLightingPresets(lightingPresets.map(p => p.id === id ? { ...p, text } : p))
  }

  const toggleLightingPreset = (id) => {
    setLightingPresets(lightingPresets.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  // Drag and drop handlers for block ordering
  const handleDragStart = (e, blockId) => {
    setDraggedBlock(blockId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, targetBlockId) => {
    e.preventDefault()
    if (draggedBlock === targetBlockId) return
    
    const draggedIndex = blockOrder.findIndex(b => b.id === draggedBlock)
    const targetIndex = blockOrder.findIndex(b => b.id === targetBlockId)
    
    if (draggedIndex === -1 || targetIndex === -1) return
    
    const newOrder = [...blockOrder]
    const [removed] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, removed)
    setBlockOrder(newOrder)
  }

  const handleDragEnd = () => {
    setDraggedBlock(null)
  }

  const moveBlock = (blockId, direction) => {
    const index = blockOrder.findIndex(b => b.id === blockId)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= blockOrder.length) return
    
    const newOrder = [...blockOrder]
    const [removed] = newOrder.splice(index, 1)
    newOrder.splice(newIndex, 0, removed)
    setBlockOrder(newOrder)
  }

  const buildPrompts = () => {
    // Build labeled character blocks
    const activeCharBlocks = chars.filter(c => c.active && c.text.trim())
    const scenes = sceneInput.split('\n').filter(x => x.trim())

    const newResults = scenes.map((scene) => {
      // Build prompt parts according to user-defined order with labels
      const parts = []
      
      for (const block of blockOrder) {
        switch (block.id) {
          case 'style':
            if (style.trim()) parts.push('STYLE: ' + style.trim())
            break
          case 'camera':
            if (camera.trim()) parts.push('CAMERA: ' + camera.trim())
            break
          case 'lighting': {
            const activeLighting = lightingPresets
              .filter(p => p.active && p.text.trim())
              .map(p => p.text.trim())
            if (activeLighting.length > 0) {
              parts.push('LIGHTING: ' + activeLighting.join(', '))
            }
            break
          }
          case 'characters':
            if (activeCharBlocks.length > 0) {
              // Label each character block individually
              const charParts = activeCharBlocks.map(c => 
                'CHARACTER: ' + c.text.trim()
              )
              parts.push(charParts.join('\n'))
            }
            break
          case 'scene':
            parts.push('SCENE: ' + scene.trim())
            break
        }
      }
      
      // Join all parts
      let prompt = parts.filter(x => x).join('\n\n')
      
      // Append negative prompt with label
      if (negativePrompt.trim()) {
        prompt += '\n\nNEGATIVE: ' + negativePrompt.trim()
      }
      
      // Append global suffix at the very end (parameters don't need label)
      if (globalSuffix.trim()) {
        prompt += ' ' + globalSuffix.trim()
      }
      
      return prompt
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
          <div 
            className="card-hd clickable-header"
            onClick={() => toggleSection('configuration')}
          >
            <div className="card-title">
              <span className={`section-arrow ${collapsedSections.configuration ? '' : 'open'}`}>▶</span>
              Configuration
            </div>
          </div>
          <div className={`card-bd ${collapsedSections.configuration ? 'collapsed' : ''}`}>
            {/* Global Settings Section */}
            <div className="collapsible-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('globalSettings')}
              >
                <span className={`section-arrow ${collapsedSections.globalSettings ? '' : 'open'}`}>▶</span>
                <span className="section-label">GLOBAL SETTINGS</span>
              </div>
              <div className={`section-content ${collapsedSections.globalSettings ? 'collapsed' : ''}`}>
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
                <div className="input-group">
                  <label>Lighting / Atmosphere</label>
                  <div className="lighting-list">
                    {lightingPresets.map((preset) => (
                      <div key={preset.id} className="lighting-item">
                        <input
                          type="checkbox"
                          checked={preset.active}
                          onChange={() => toggleLightingPreset(preset.id)}
                        />
                        <input
                          type="text"
                          className="lighting-text"
                          value={preset.text}
                          onChange={(e) => updateLightingPreset(preset.id, e.target.value)}
                          placeholder="Enter lighting preset..."
                        />
                        <button
                          className="btn small danger"
                          onClick={() => deleteLightingPreset(preset.id)}
                          title="Delete preset"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      className="btn small primary"
                      style={{ marginTop: '8px' }}
                      onClick={addLightingPreset}
                    >
                      + Add Preset
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label>Negative Prompt</label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="blurry, low quality, text, watermark..."
                  />
                </div>
              </div>
            </div>

            <div className="hr" />

            {/* Characters Section */}
            <div className="collapsible-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('characters')}
              >
                <span className={`section-arrow ${collapsedSections.characters ? '' : 'open'}`}>▶</span>
                <span className="section-label">CHARACTER BLOCKS</span>
              </div>
              <div className={`section-content ${collapsedSections.characters ? 'collapsed' : ''}`}>
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
                <button
                  className="btn small primary"
                  style={{ marginTop: '10px' }}
                  onClick={addChar}
                >
                  + Add Block
                </button>
              </div>
            </div>

            <div className="hr" />

            {/* Block Order Section */}
            <div className="collapsible-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('blockOrder')}
              >
                <span className={`section-arrow ${collapsedSections.blockOrder ? '' : 'open'}`}>▶</span>
                <span className="section-label">PROMPT STRUCTURE ORDER</span>
              </div>
              <div className={`section-content ${collapsedSections.blockOrder ? 'collapsed' : ''}`}>
                <p className="helper-text">
                  Drag blocks or use arrows to reorder how prompts are assembled.
                </p>
                <div className="block-order-list">
                  {blockOrder.map((block, index) => (
                    <div
                      key={block.id}
                      className={`block-order-item ${draggedBlock === block.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, block.id)}
                      onDragOver={(e) => handleDragOver(e, block.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="drag-handle">⋮⋮</span>
                      <span className="block-number">{index + 1}</span>
                      <span className="block-label">{block.label}</span>
                      <div className="block-order-controls">
                        <button 
                          className="btn small"
                          onClick={() => moveBlock(block.id, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button 
                          className="btn small"
                          onClick={() => moveBlock(block.id, 'down')}
                          disabled={index === blockOrder.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hr" />

            {/* Global Suffix Section */}
            <div className="input-group">
              <label>
                <span className="suffix-icon">⚙️</span> Suffix / Parameters
              </label>
              <input
                type="text"
                value={globalSuffix}
                onChange={(e) => setGlobalSuffix(e.target.value)}
                placeholder="--ar 16:9 --v 6.1 --style raw"
                className="suffix-input"
              />
              <p className="helper-text">
                Appended to the end of every generated prompt (e.g., aspect ratios, version flags).
              </p>
            </div>
          </div>
        </section>

        {/* Prompt Builder Panel */}
        <section className="card">
          <div 
            className="card-hd clickable-header"
            onClick={() => toggleSection('promptBuilder')}
          >
            <div className="card-title">
              <span className={`section-arrow ${collapsedSections.promptBuilder ? '' : 'open'}`}>▶</span>
              Prompt Builder
            </div>
          </div>
          <div className={`card-bd ${collapsedSections.promptBuilder ? 'collapsed' : ''}`}>
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
