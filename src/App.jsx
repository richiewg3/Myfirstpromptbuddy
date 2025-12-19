import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Frankensteiner } from './components/Frankensteiner'
import { Refinery } from './components/Refinery'
import { ApiModal } from './components/ApiModal'
import { Toast } from './components/Toast'
import { useToast } from './hooks/useToast'
import { copyToClipboard } from './utils/clipboard'
import { DEFAULT_API_CONFIG, STORAGE_KEY } from './constants/defaults'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [showApiModal, setShowApiModal] = useState(false)
  const [apiConfig, setApiConfig] = useState(() => {
    // Load API config from localStorage on init
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.api) return data.api
      }
    } catch {
      // ignore
    }
    return DEFAULT_API_CONFIG
  })

  const { toast, showToast } = useToast()

  const handleCopy = useCallback(async (text) => {
    const success = await copyToClipboard(text)
    showToast(success ? 'Copied to Clipboard!' : 'Failed to copy')
  }, [showToast])

  const handleSelectTool = useCallback((tool) => {
    setCurrentView(tool)
  }, [])

  const handleDashboard = useCallback(() => {
    setCurrentView('dashboard')
  }, [])

  const handleSaveApiConfig = useCallback((config) => {
    setApiConfig(config)
    // Also save to localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const data = saved ? JSON.parse(saved) : {}
      data.api = config
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore
    }
    setShowApiModal(false)
    showToast('API Settings Saved!')
  }, [showToast])

  return (
    <>
      <Header
        showNav={currentView !== 'dashboard'}
        onDashboard={handleDashboard}
        onApiModal={() => setShowApiModal(true)}
      />

      {currentView === 'dashboard' && (
        <Dashboard onSelectTool={handleSelectTool} />
      )}

      {currentView === 'frankensteiner' && (
        <Frankensteiner onCopy={handleCopy} />
      )}

      {currentView === 'refinery' && (
        <Refinery
          apiConfig={apiConfig}
          onCopy={handleCopy}
          onShowToast={showToast}
          onOpenApiModal={() => setShowApiModal(true)}
        />
      )}

      <ApiModal
        show={showApiModal}
        apiConfig={apiConfig}
        onSave={handleSaveApiConfig}
        onClose={() => setShowApiModal(false)}
      />

      <Toast show={toast.show} message={toast.message} />
    </>
  )
}

export default App
