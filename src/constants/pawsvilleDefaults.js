export const STORAGE_KEY_V5 = 'pawsville_v5';
export const STORAGE_KEY_V4 = 'pawsville_v4';

export const DEFAULT_CHARS = [
  { id: 'c1', name: 'Orange Tabby', text: '', active: true, isOpen: false },
  { id: 'c2', name: 'Baby Dragon', text: '', active: true, isOpen: false },
  { id: 'c3', name: 'Duckling', text: '', active: false, isOpen: false },
  { id: 'c4', name: 'Queen', text: '', active: false, isOpen: false },
  { id: 'c5', name: 'Bully', text: '', active: false, isOpen: false },
];

export const DEFAULT_ORDER = [
  { id: 'global', name: 'Global Settings' },
  { id: 'chars', name: 'Characters' },
  { id: 'scene', name: 'Scene Description' },
];

function deepClone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function getDefaultState() {
  return {
    globals: {
      style: '',
      camera: '',
      light: '',
      rules: '',
    },
    characters: deepClone(DEFAULT_CHARS),
    promptOrder: deepClone(DEFAULT_ORDER),
  };
}

