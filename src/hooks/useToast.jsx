import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast({ durationMs = 1500 } = {}) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const toast = useCallback(
    (msg) => {
      setMessage(String(msg ?? ''));
      setVisible(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setVisible(false), durationMs);
    },
    [durationMs],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function Toast() {
    return (
      <div className={`toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">
        {message}
      </div>
    );
  }

  return { toast, Toast };
}

