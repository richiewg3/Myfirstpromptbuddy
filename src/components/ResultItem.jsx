import { useState } from 'react'

export function ResultItem({ index, content, onCopy }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={`result-item ${isOpen ? 'open' : ''}`}>
      <div className="result-hd" onClick={() => setIsOpen(!isOpen)}>
        <span>Prompt {index + 1}</span>
        <button
          className="btn small"
          onClick={(e) => {
            e.stopPropagation()
            onCopy(content)
          }}
        >
          Copy
        </button>
      </div>
      <div className="result-bd">{content}</div>
    </div>
  )
}
