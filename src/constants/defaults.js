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

// Default Data for Frankensteiner Lighting Presets
export const LIGHTING_PRESETS_DEFAULTS = [
  {
    id: 'lp1',
    text: 'Golden hour sunlight',
    active: true
  },
  {
    id: 'lp2',
    text: 'Soft ambient glow',
    active: false
  },
  {
    id: 'lp3',
    text: 'Moody shadows',
    active: false
  }
]

// Default API configuration
export const DEFAULT_API_CONFIG = {
  provider: 'gemini',
  key: ''
}

// Default block order for Frankensteiner prompt assembly
export const DEFAULT_BLOCK_ORDER = [
  { id: 'style', label: 'Style Block' },
  { id: 'camera', label: 'Camera Block' },
  { id: 'lighting', label: 'Lighting / Atmosphere' },
  { id: 'characters', label: 'Character Blocks' },
  { id: 'scene', label: 'Scene Description' }
]

// Default collapsed states for sections
export const DEFAULT_COLLAPSED_SECTIONS = {
  configuration: false,
  globalSettings: false,
  characters: false,
  promptBuilder: false
}

// Storage key for localStorage
export const STORAGE_KEY = 'pawsville_refinery_v12'
export const FRANKENSTEINER_STORAGE_KEY = 'pawsville_frankensteiner_v1'
