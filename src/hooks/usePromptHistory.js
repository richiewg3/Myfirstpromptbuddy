import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pawsville_prompt_history_v1';
const MAX_ITEMS = 200;

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(Boolean)
    .map((x) => ({
      id: String(x.id ?? `h${Date.now()}${Math.random().toString(16).slice(2)}`),
      ts: Number.isFinite(x.ts) ? x.ts : Date.now(),
      mode: x.mode === 'single' ? 'single' : 'batch',
      scene: String(x.scene ?? ''),
      prompt: String(x.prompt ?? ''),
    }))
    .filter((x) => x.scene || x.prompt)
    .slice(0, MAX_ITEMS);
}

export function usePromptHistory() {
  const [history, setHistory] = useState(() => {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return normalizeHistory(safeParse(raw));
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  const addEntries = useCallback((entries) => {
    const next = normalizeHistory(entries);
    if (next.length === 0) return;
    setHistory((prev) => normalizeHistory([...next, ...prev]).slice(0, MAX_ITEMS));
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const exportJson = useCallback(() => {
    return JSON.stringify({ exportedAt: Date.now(), items: history }, null, 2);
  }, [history]);

  const stats = useMemo(() => {
    const total = history.length;
    const lastTs = history[0]?.ts ?? null;
    return { total, lastTs };
  }, [history]);

  return { history, addEntries, removeEntry, clear, exportJson, stats };
}

