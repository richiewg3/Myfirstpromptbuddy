// Default Data for Refinery Characters
export const REFINERY_DEFAULTS = [
  {
    id: 'rc1',
    name: 'Tabby',
    tag: '@cat',
    desc: 'orange tabby cat, anthropomorphic',
    outfits: [{ name: 'Hoodie', desc: 'blue hoodie' }],
    activeOutfit: 0,
    open: true
  }
]

// Default Data for Frankensteiner Characters
export const FRANKENSTEINER_DEFAULTS = [
  {
    id: 'fc1',
    name: 'Skater Cat',
    text: 'Orange tabby cat on a skateboard',
    active: true
  }
]

// Default API configuration
export const DEFAULT_API_CONFIG = {
  provider: 'gemini',
  key: ''
}

// Storage key for localStorage
export const STORAGE_KEY = 'pawsville_refinery_v12'
