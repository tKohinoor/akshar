import { Preferences } from '@capacitor/preferences'

const KEY = 'akshar-progress'

async function readAll() {
  try {
    const { value } = await Preferences.get({ key: KEY })
    return value ? JSON.parse(value) : {}
  } catch {
    return {} // storage unavailable or damaged: start fresh
  }
}

export async function saveProgress(bookId, chapter) {
  try {
    const all = await readAll()
    all[bookId] = { chapter, updatedAt: Date.now() }
    await Preferences.set({ key: KEY, value: JSON.stringify(all) })
  } catch {
    // If saving fails, reading still works, so we ignore it
  }
}

export async function getProgress(bookId) {
  const all = await readAll()
  return all[bookId] ?? null
}

export async function getLastRead() {
  const all = await readAll()
  const entries = Object.entries(all)
  if (entries.length === 0) return null
  entries.sort((a, b) => b[1].updatedAt - a[1].updatedAt)
  const [bookId, progress] = entries[0]
  return { bookId, chapter: progress.chapter }
}