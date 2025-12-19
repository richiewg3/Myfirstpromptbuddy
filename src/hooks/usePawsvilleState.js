import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DEFAULT_ORDER, STORAGE_KEY_V4, STORAGE_KEY_V5, getDefaultState } from '../constants/pawsvilleDefaults';

function deepClone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function normalizeCharacters(chars) {
  if (!Array.isArray(chars)) return deepClone(getDefaultState().characters);
  return chars
    .filter(Boolean)
    .map((c) => ({
      id: String(c.id ?? `c${Date.now()}${Math.random().toString(16).slice(2)}`),
      name: String(c.name ?? 'Unnamed'),
      text: String(c.text ?? ''),
      active: Boolean(c.active),
      isOpen: Boolean(c.isOpen),
    }));
}

function normalizeOrder(order) {
  if (!Array.isArray(order) || order.length === 0) return deepClone(DEFAULT_ORDER);
  const allowed = new Set(['global', 'chars', 'scene']);
  const normalized = order
    .filter((o) => o && allowed.has(o.id))
    .map((o) => ({
      id: o.id,
      name: o.id === 'global' ? 'Global Settings' : o.id === 'chars' ? 'Characters' : 'Scene Description',
    }));
  // Ensure all required items exist exactly once.
  const ids = new Set(normalized.map((x) => x.id));
  for (const item of DEFAULT_ORDER) if (!ids.has(item.id)) normalized.push(item);
  return normalized;
}

function deserializeState(raw) {
  const base = getDefaultState();
  const data = raw && typeof raw === 'object' ? raw : {};

  return {
    globals: {
      style: String(data.style ?? data.globals?.style ?? base.globals.style),
      camera: String(data.camera ?? data.globals?.camera ?? base.globals.camera),
      light: String(data.light ?? data.globals?.light ?? base.globals.light),
      texture: String(data.texture ?? data.globals?.texture ?? base.globals.texture),
      rules: String(data.rules ?? data.globals?.rules ?? base.globals.rules),
    },
    characters: normalizeCharacters(data.chars ?? data.characters ?? base.characters),
    promptOrder: normalizeOrder(data.order ?? data.promptOrder ?? base.promptOrder),
  };
}

function loadFromStorage() {
  if (typeof window === 'undefined') return { state: getDefaultState(), migratedFromV4: false };
  try {
    const rawV5 = window.localStorage.getItem(STORAGE_KEY_V5);
    if (rawV5) return { state: deserializeState(JSON.parse(rawV5)), migratedFromV4: false };

    const rawV4 = window.localStorage.getItem(STORAGE_KEY_V4);
    if (rawV4) return { state: deserializeState(JSON.parse(rawV4)), migratedFromV4: true };
  } catch {
    // ignore
  }
  return { state: getDefaultState(), migratedFromV4: false };
}

function serializeToV5(state) {
  return {
    style: state.globals.style,
    camera: state.globals.camera,
    light: state.globals.light,
    texture: state.globals.texture,
    rules: state.globals.rules,
    chars: state.characters,
    order: state.promptOrder,
  };
}

function swapInArray(arr, i, j) {
  const copy = arr.slice();
  const tmp = copy[j];
  copy[j] = copy[i];
  copy[i] = tmp;
  return copy;
}

function reducer(state, action) {
  switch (action.type) {
    case 'globals/set':
      return {
        ...state,
        globals: { ...state.globals, [action.key]: action.value },
      };
    case 'characters/add': {
      const id = `c${Date.now()}`;
      return {
        ...state,
        characters: [
          ...state.characters.map((c) => ({ ...c, isOpen: false })),
          { id, name: 'New Character', text: '', active: true, isOpen: true },
        ],
      };
    }
    case 'characters/delete':
      return { ...state, characters: state.characters.filter((c) => c.id !== action.id) };
    case 'characters/toggleActive':
      return {
        ...state,
        characters: state.characters.map((c) => (c.id === action.id ? { ...c, active: !c.active } : c)),
      };
    case 'characters/setName':
      return {
        ...state,
        characters: state.characters.map((c) => (c.id === action.id ? { ...c, name: action.value } : c)),
      };
    case 'characters/setText':
      return {
        ...state,
        characters: state.characters.map((c) => (c.id === action.id ? { ...c, text: action.value } : c)),
      };
    case 'characters/toggleOpen':
      return {
        ...state,
        characters: state.characters.map((c) => (c.id === action.id ? { ...c, isOpen: !c.isOpen } : c)),
      };
    case 'order/move': {
      const { index, direction } = action;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= state.promptOrder.length) return state;
      return { ...state, promptOrder: swapInArray(state.promptOrder, index, newIndex) };
    }
    case 'state/replace':
      return deserializeState(action.value);
    case 'state/reset':
      return getDefaultState();
    default:
      return state;
  }
}

export function usePawsvilleState() {
  const [boot] = useState(() => loadFromStorage());
  const [state, dispatch] = useReducer(reducer, boot.state);

  const debouncedTimerRef = useRef(null);

  const saveNow = useCallback((nextState) => {
    try {
      window.localStorage.setItem(STORAGE_KEY_V5, JSON.stringify(serializeToV5(nextState)));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Auto-persist (debounced).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (debouncedTimerRef.current) window.clearTimeout(debouncedTimerRef.current);
    debouncedTimerRef.current = window.setTimeout(() => {
      saveNow(state);
    }, 150);
    return () => {
      if (debouncedTimerRef.current) window.clearTimeout(debouncedTimerRef.current);
    };
  }, [state, saveNow]);

  const api = useMemo(() => {
    return {
      state,
      migratedFromV4: boot.migratedFromV4,
      actions: {
        setGlobal: (key, value) => dispatch({ type: 'globals/set', key, value }),
        addCharacter: () => dispatch({ type: 'characters/add' }),
        deleteCharacter: (id) => dispatch({ type: 'characters/delete', id }),
        toggleCharacterActive: (id) => dispatch({ type: 'characters/toggleActive', id }),
        toggleCharacterOpen: (id) => dispatch({ type: 'characters/toggleOpen', id }),
        setCharacterName: (id, value) => dispatch({ type: 'characters/setName', id, value }),
        setCharacterText: (id, value) => dispatch({ type: 'characters/setText', id, value }),
        moveOrder: (index, direction) => dispatch({ type: 'order/move', index, direction }),
        save: () => saveNow(state),
        load: () => {
          try {
            const raw = window.localStorage.getItem(STORAGE_KEY_V5);
            if (!raw) return { ok: false, reason: 'empty' };
            dispatch({ type: 'state/replace', value: JSON.parse(raw) });
            return { ok: true };
          } catch {
            return { ok: false, reason: 'parse' };
          }
        },
        reset: () => {
          try {
            window.localStorage.removeItem(STORAGE_KEY_V5);
          } catch {
            // ignore
          }
          dispatch({ type: 'state/reset' });
        },
      },
    };
  }, [boot.migratedFromV4, saveNow, state]);

  return api;
}

