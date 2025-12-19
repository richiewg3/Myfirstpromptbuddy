import { useState } from 'react'

export function Accordion({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`accordion ${isOpen ? 'open' : ''}`}>
      <div className="acc-head" onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <span className="acc-arrow">▼</span>
      </div>
      <div className="acc-body">
        {children}
      </div>
    </div>
  )
}
