import { useState, useRef, useCallback, useEffect } from 'react'
import { ResultItem } from './ResultItem'
import { REFINERY_DEFAULTS, STORAGE_KEY, DEFAULT_COLLAPSED_SECTIONS } from '../constants/defaults'
import { callTextAI, callVisionAI } from '../utils/api'

// Helper function to load initial state from localStorage
function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return {
        chars: data.chars || JSON.parse(JSON.stringify(REFINERY_DEFAULTS)),
        style: data.style || '',
        negative: data.neg || '',
        texture: data.tex || 'standard',
        globalSuffix: data.globalSuffix || '',
        collapsedSections: data.collapsedSections || { ...DEFAULT_COLLAPSED_SECTIONS }
      }
    }
  } catch {
    // ignore parse errors
  }
  return {
    chars: JSON.parse(JSON.stringify(REFINERY_DEFAULTS)),
    style: '',
    negative: '',
    texture: 'standard',
    globalSuffix: '',
    collapsedSections: { ...DEFAULT_COLLAPSED_SECTIONS }
  }
}

export function Refinery({ apiConfig, onCopy, onShowToast, onOpenApiModal }) {
  const initialState = loadInitialState()
  const [chars, setChars] = useState(initialState.chars)
  const [texture, setTexture] = useState(initialState.texture)
  const [style, setStyle] = useState(initialState.style)
  const [negative, setNegative] = useState(initialState.negative)
  const [sceneInput, setSceneInput] = useState('')
  const [results, setResults] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Global suffix state
  const [globalSuffix, setGlobalSuffix] = useState(initialState.globalSuffix)
  
  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState(initialState.collapsedSections)

  // Vision state
  const [activeTab, setActiveTab] = useState('text')
  const [imageBase64, setImageBase64] = useState(null)
  const [imageMime, setImageMime] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [visionResult, setVisionResult] = useState('')

  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  
  // Toggle section collapse
  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }
  
  // Auto-save collapsed sections when they change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const data = saved ? JSON.parse(saved) : {}
      data.collapsedSections = collapsedSections
      data.globalSuffix = globalSuffix
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore
    }
  }, [collapsedSections, globalSuffix])

  // Save to localStorage
  const saveRefinery = useCallback(() => {
    const data = {
      chars,
      style,
      neg: negative,
      tex: texture,
      api: apiConfig,
      globalSuffix,
      collapsedSections
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    onShowToast('Saved!')
  }, [chars, style, negative, texture, apiConfig, globalSuffix, collapsedSections, onShowToast])

  const loadRefinery = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.chars) setChars(data.chars)
        if (data.style) setStyle(data.style)
        if (data.neg) setNegative(data.neg)
        if (data.tex) setTexture(data.tex)
        if (data.globalSuffix !== undefined) setGlobalSuffix(data.globalSuffix)
        if (data.collapsedSections) setCollapsedSections(data.collapsedSections)
        onShowToast('Loaded!')
      } catch {
        onShowToast('Failed to load')
      }
    }
  }, [onShowToast])

  // Character management
  const addChar = () => {
    setChars([...chars, {
      id: 'rc' + Date.now(),
      name: 'New',
      tag: '@new',
      desc: '',
      outfits: [{ name: 'Default', desc: '' }],
      activeOutfit: 0,
      open: true
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

  const updateOutfitDesc = (id, desc) => {
    setChars(chars.map(c => {
      if (c.id === id) {
        const newOutfits = [...c.outfits]
        newOutfits[c.activeOutfit] = { ...newOutfits[c.activeOutfit], desc }
        return { ...c, outfits: newOutfits }
      }
      return c
    }))
  }

  const addOutfit = (id) => {
    const name = prompt('Outfit Name:')
    if (name) {
      setChars(chars.map(c => {
        if (c.id === id) {
          return {
            ...c,
            outfits: [...c.outfits, { name, desc: '' }],
            activeOutfit: c.outfits.length
          }
        }
        return c
      }))
    }
  }

  const deleteOutfit = (id) => {
    const char = chars.find(c => c.id === id)
    if (char && char.outfits.length > 1 && confirm('Delete outfit?')) {
      setChars(chars.map(c => {
        if (c.id === id) {
          const newOutfits = c.outfits.filter((_, i) => i !== c.activeOutfit)
          return { ...c, outfits: newOutfits, activeOutfit: 0 }
        }
        return c
      }))
    }
  }

  const insertTag = (tag) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart
      const end = inputRef.current.selectionEnd
      const newValue = sceneInput.slice(0, start) + tag + ' ' + sceneInput.slice(end)
      setSceneInput(newValue)
      inputRef.current.focus()
    }
  }

  // AI Enhancement
  const runEnhance = async () => {
    if (!apiConfig.key) {
      onOpenApiModal()
      return
    }

    const inputs = sceneInput.split('\n').filter(x => x.trim())
    if (!inputs.length) return

    setIsProcessing(true)
    setResults([])

    const actors = chars.map(c =>
      `TRIGGER: ${c.tag}\nDESC: ${c.desc}\nOUTFIT: ${c.outfits[c.activeOutfit]?.desc || ''}`
    ).join('\n\n')

    let texInst = texture === 'extreme'
      ? 'MICRO-TEXTURE: Describe weave, pores, scratches.'
      : (texture === 'high' ? 'High detail.' : 'Standard.')

    const systemPrompt = `Role: Expert Image Prompt Engineer.
Style: ${style}
Negative: ${negative}
Actors:
${actors}
Instructions:
1. Replace tags (@cat) with DESC + OUTFIT. NO NAMES.
2. ${texInst}
3. Focus on Composition/Light.
4. Output ONLY prompt.`

    const newResults = []
    for (const input of inputs) {
      try {
        let result = await callTextAI(apiConfig, systemPrompt, input)
        // Append global suffix at the very end (after AI processing)
        if (globalSuffix.trim()) {
          result = result.trim() + ' ' + globalSuffix.trim()
        }
        newResults.push(result)
      } catch (error) {
        newResults.push(`Error: ${error.message}`)
      }
    }

    setResults(newResults)
    setIsProcessing(false)
  }

  // Vision handling
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target.result
        setImageBase64(result.split(',')[1])
        setImageMime(file.type)
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const runVision = async () => {
    if (!apiConfig.key) {
      onOpenApiModal()
      return
    }
    if (!imageBase64) return

    setIsProcessing(true)
    const systemPrompt = 'Analyze image. Write a detailed text-to-image prompt. Focus on Art Style, Lighting, Camera, Key Elements. Output ONLY prompt string.'

    try {
      const result = await callVisionAI(apiConfig, systemPrompt, imageBase64, imageMime)
      setVisionResult(result)
    } catch (error) {
      setVisionResult(`Error: ${error.message}`)
    }

    setIsProcessing(false)
  }

  const sendToWriter = () => {
    setSceneInput(prev => (prev ? prev + '\n' : '') + visionResult)
    setActiveTab('text')
  }

  const copyAll = () => {
    const allText = results.join('\n\n---\n\n')
    onCopy(allText)
  }

  return (
    <div className="wrap">
      <div className="grid-main">
        {/* Setup Panel */}
        <section className="card">
          <div className="card-hd">
            <div className="card-title">Refinery Setup</div>
            <div className="flex-row">
              <button className="btn small" onClick={saveRefinery}>Save</button>
              <button className="btn small" onClick={loadRefinery}>Load</button>
            </div>
          </div>
          <div className="card-bd">
            {/* Global Settings - Collapsible */}
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
                  <label>Texture Engine</label>
                  <select value={texture} onChange={(e) => setTexture(e.target.value)}>
                    <option value="standard">Standard</option>
                    <option value="high">High Detail</option>
                    <option value="extreme">Extreme (Macro)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Style Guide</label>
                  <textarea
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="High fidelity, octane render..."
                  />
                </div>
                <div className="input-group">
                  <label>Negative</label>
                  <textarea
                    value={negative}
                    onChange={(e) => setNegative(e.target.value)}
                    placeholder="--no text, logos..."
                  />
                </div>
              </div>
            </div>

            <div className="hr" />
            
            {/* Actors & Wardrobes - Collapsible */}
            <div className="collapsible-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('characters')}
              >
                <span className={`section-arrow ${collapsedSections.characters ? '' : 'open'}`}>▶</span>
                <span className="section-label">ACTORS & WARDROBES</span>
                <button 
                  className="btn small primary" 
                  onClick={(e) => { e.stopPropagation(); addChar(); }}
                  style={{ marginLeft: 'auto' }}
                >
                  + Add
                </button>
              </div>
              <div className={`section-content ${collapsedSections.characters ? 'collapsed' : ''}`}>
                {/* Characters */}
                {chars.map((char) => (
                  <div key={char.id} className={`accordion ${char.open ? 'open' : ''}`}>
                    <div
                      className="acc-head"
                      onClick={() => updateChar(char.id, 'open', !char.open)}
                    >
                      <div>
                        <span style={{ color: 'var(--accent)' }}>{char.tag}</span> {char.name}
                      </div>
                      <button
                        className="btn small danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChar(char.id)
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="acc-body">
                      <div className="input-group">
                        <label>Tag</label>
                        <input
                          type="text"
                          value={char.tag}
                          onChange={(e) => updateChar(char.id, 'tag', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Description</label>
                        <textarea
                          value={char.desc}
                          onChange={(e) => updateChar(char.id, 'desc', e.target.value)}
                        />
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
                        <label style={{ color: 'var(--accent2)' }}>WARDROBE</label>
                        <div className="flex-row">
                          <select
                            style={{ flex: 1 }}
                            value={char.activeOutfit}
                            onChange={(e) => updateChar(char.id, 'activeOutfit', parseInt(e.target.value))}
                          >
                            {char.outfits.map((outfit, i) => (
                              <option key={i} value={i}>{outfit.name}</option>
                            ))}
                          </select>
                          <button className="btn small" onClick={() => addOutfit(char.id)}>+</button>
                          <button className="btn small danger" onClick={() => deleteOutfit(char.id)}>-</button>
                        </div>
                        <textarea
                          style={{ marginTop: '5px' }}
                          placeholder="Outfit details..."
                          value={char.outfits[char.activeOutfit]?.desc || ''}
                          onChange={(e) => updateOutfitDesc(char.id, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                Appended to every generated prompt after AI enhancement.
              </p>
            </div>
          </div>
        </section>

        {/* Studio Panel */}
        <section className="card">
          <div className="card-hd">
            <div className="card-title">Studio</div>
            <div className="tabs">
              <div
                className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                onClick={() => setActiveTab('text')}
              >
                Text Writer
              </div>
              <div
                className={`tab ${activeTab === 'vision' ? 'active' : ''}`}
                onClick={() => setActiveTab('vision')}
              >
                Vision
              </div>
            </div>
          </div>
          <div className="card-bd">
            {/* Text Tab */}
            {activeTab === 'text' && (
              <div>
                <label>Quick Insert Chips</label>
                <div className="chip-container">
                  {chars.map((char) => (
                    <div
                      key={char.id}
                      className="chip"
                      onClick={() => insertTag(char.tag)}
                    >
                      + {char.tag}
                    </div>
                  ))}
                </div>

                <label style={{ marginTop: '10px' }}>Scene Ideas</label>
                <textarea
                  ref={inputRef}
                  style={{ height: '150px' }}
                  value={sceneInput}
                  onChange={(e) => setSceneInput(e.target.value)}
                  placeholder="@cat sitting on a bench..."
                />

                <div className="flex-row" style={{ marginTop: '10px' }}>
                  <button
                    className="btn magic"
                    style={{ flex: 1 }}
                    onClick={runEnhance}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Polishing...' : '✨ Enhance'}
                  </button>
                  <button className="btn" onClick={copyAll} disabled={results.length === 0}>
                    Copy All
                  </button>
                </div>

                <div style={{ marginTop: '20px' }}>
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
            )}

            {/* Vision Tab */}
            {activeTab === 'vision' && (
              <div>
                <div
                  className="dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {!imagePreview && <div>📷 Upload Image</div>}
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <button
                  className="btn magic"
                  style={{ width: '100%', marginTop: '10px' }}
                  onClick={runVision}
                  disabled={isProcessing || !imageBase64}
                >
                  {isProcessing ? 'Analyzing...' : '👁️ Reverse Engineer'}
                </button>

                <label style={{ marginTop: '15px' }}>Analysis</label>
                <textarea
                  style={{ height: '150px' }}
                  value={visionResult}
                  onChange={(e) => setVisionResult(e.target.value)}
                />

                <button
                  className="btn primary"
                  style={{ width: '100%', marginTop: '5px' }}
                  onClick={sendToWriter}
                  disabled={!visionResult}
                >
                  Send to Writer ↗
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
