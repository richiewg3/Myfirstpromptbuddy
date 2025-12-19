import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ show: false, message: '' })

  const showToast = useCallback((message) => {
    setToast({ show: true, message })
    setTimeout(() => {
      setToast({ show: false, message: '' })
    }, 2000)
  }, [])

  return { toast, showToast }
}
