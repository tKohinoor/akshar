import { Preferences } from '@capacitor/preferences'

const KEY = 'akshar-settings'

// Text sizes in rem. The reader uses the entry chosen by sizeIndex.
export const FONT_SIZES = [1, 1.15, 1.3, 1.5, 1.75]

export const DEFAULTS = { sizeIndex: 1, theme: 'dark' }

let cache = null

export function getCachedSettings() {
  return cache
}

export async function loadSettings() {
  let result = DEFAULTS
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value) {
      const saved = JSON.parse(value)
      const validSize =
        Number.isInteger(saved.sizeIndex) &&
        saved.sizeIndex >= 0 &&
        saved.sizeIndex < FONT_SIZES.length
      result = {
        sizeIndex: validSize ? saved.sizeIndex : DEFAULTS.sizeIndex,
        theme: saved.theme === 'light' ? 'light' : 'dark',
      }
    }
  } catch {
    // Storage unavailable or damaged: use the defaults
  }
  cache = result
  return result
}

export async function saveSettings(settings) {
  cache = settings
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(settings) })
  } catch {
    // If saving fails, the choice still works until the app closes
  }
}