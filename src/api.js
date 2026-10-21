import { Preferences } from '@capacitor/preferences'
import { CONTENT_BASE } from './config'

const BOOKS_KEY = 'akshar-books'
const REFRESH_EVERY = 5 * 60 * 1000 // check for new books at most every 5 minutes

// ---------- saved data on the device ----------

async function readSaved(key) {
  try {
    const { value } = await Preferences.get({ key })
    return value
  } catch {
    return null
  }
}

async function writeSaved(key, value) {
  try {
    await Preferences.set({ key, value })
  } catch {
    // If saving fails (for example storage is full), reading still works
  }
}

// ---------- the book list ----------

let booksMemory = null
let booksText = null
let refreshPromise = null
let initialLoad = null
let lastCheck = 0

async function downloadBooks() {
  const res = await fetch(`${CONTENT_BASE}/books.json`)
  if (!res.ok) throw new Error('Request failed')
  const text = await res.text()
  const data = JSON.parse(text) // throws if this is not real JSON
  if (!Array.isArray(data)) throw new Error('Unexpected data')

  const changed = text !== booksText
  booksMemory = data
  booksText = text
  if (changed) await writeSaved(BOOKS_KEY, text)
  return changed
}

function checkForNewBooks() {
  if (refreshPromise) return refreshPromise
  if (Date.now() - lastCheck < REFRESH_EVERY) return Promise.resolve(false)
  lastCheck = Date.now()
  refreshPromise = downloadBooks()
    .catch(() => false) // offline or server problem: keep what we have
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// Runs once: use the saved copy if there is one, otherwise download
async function loadInitial() {
  const saved = await readSaved(BOOKS_KEY)
  if (saved) {
    try {
      booksMemory = JSON.parse(saved)
      booksText = saved
    } catch {
      // damaged copy: ignore it and download a fresh one
    }
  }
  if (!booksMemory) {
    await downloadBooks()
    lastCheck = Date.now()
  }
}

export async function getBooks(onFresh) {
  if (!booksMemory) {
    // Everyone who asks while the first load is running shares that one load
    if (!initialLoad) {
      initialLoad = loadInitial().finally(() => {
        initialLoad = null
      })
    }
    await initialLoad
  }

  checkForNewBooks().then((changed) => {
    if (changed && onFresh) onFresh(booksMemory)
  })
  return booksMemory
}

// ---------- chapters ----------

const checkedThisSession = new Set()
const inflight = new Map()

function chapterKey(bookId, number) {
  return `akshar-ch-${bookId}-${String(number).padStart(2, '0')}`
}

async function downloadChapter(bookId, number) {
  const name = String(number).padStart(2, '0')
  const res = await fetch(`${CONTENT_BASE}/books/${bookId}/${name}.md`)
  if (!res.ok) throw new Error('Request failed')
  const text = await res.text()
  // The dev server answers unknown files with the app's own page
  if (text.trimStart().toLowerCase().startsWith('<!doctype')) {
    throw new Error('Chapter not found')
  }
  return text
}

// If the same chapter is already downloading, share that download
function downloadChapterOnce(bookId, number) {
  const key = chapterKey(bookId, number)
  if (!inflight.has(key)) {
    inflight.set(
      key,
      downloadChapter(bookId, number).finally(() => inflight.delete(key))
    )
  }
  return inflight.get(key)
}

export async function getChapter(bookId, number) {
  const key = chapterKey(bookId, number)
  const saved = await readSaved(key)

  if (saved) {
    // Saved on this device: show it now, and check for a newer copy once per session
    if (!checkedThisSession.has(key)) {
      checkedThisSession.add(key)
      downloadChapterOnce(bookId, number)
        .then((text) => {
          if (text !== saved) writeSaved(key, text)
        })
        .catch(() => {})
    }
    return saved
  }

  // Not saved yet: download it, then save it for next time
  const text = await downloadChapterOnce(bookId, number)
  await writeSaved(key, text)
  return text
}

// Quietly download a chapter the reader is likely to open next
export async function prefetchChapter(bookId, number) {
  const key = chapterKey(bookId, number)
  try {
    if (await readSaved(key)) return
    const text = await downloadChapterOnce(bookId, number)
    await writeSaved(key, text)
  } catch {
    // Offline or failed: the chapter downloads normally when opened
  }
}