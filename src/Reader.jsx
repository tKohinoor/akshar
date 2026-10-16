import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { getBooks, getChapter } from './api'
import { saveProgress } from './progress'
import { useSettings } from './useSettings'
import { FONT_SIZES } from './settings'
import './Reader.css'
import ThemeToggle from './ThemeToggle'
import ChapterEndAd from './ChapterEndAd'

function Reader() {
  const { id, n } = useParams()
  const number = Number(n)
  const { settings, update } = useSettings()

  const [book, setBook] = useState(null)
  const [text, setText] = useState('')
  const [status, setStatus] = useState('loading') // loading | ready | missing | error

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    Promise.all([getBooks(), getChapter(id, number)])
      .then(([books, chapterText]) => {
        if (cancelled) return
        const found = books.find((b) => b.id === id)
        if (!found) {
          setStatus('missing')
          return
        }
        setBook(found)
        setText(chapterText)
        setStatus('ready')
        saveProgress(id, number)
        window.scrollTo(0, 0)
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [id, number])


  const index = book ? book.chapters.findIndex((c) => c.number === number) : -1
  const prev = index > 0 ? book.chapters[index - 1] : null
  const next =
    index >= 0 && index < book.chapters.length - 1
      ? book.chapters[index + 1]
      : null

  const smaller = () => update({ sizeIndex: settings.sizeIndex - 1 })
  const larger = () => update({ sizeIndex: settings.sizeIndex + 1 })

  return (
    <div
      className="reader"
      style={{ '--reading-size': `${FONT_SIZES[settings.sizeIndex]}rem` }}
    >
      <div className="reader-inner">
        <nav className="reader-top">
          <Link to={`/book/${id}`} className="back">
            Chapters
          </Link>
          {book && <span className="reader-book">{book.title}</span>}
        </nav>

        <div className="reader-tools">
          <button
            type="button"
            className="tool-button"
            onClick={smaller}
            disabled={settings.sizeIndex === 0}
            aria-label="Smaller text"
          >
            A−
          </button>
          <button
            type="button"
            className="tool-button"
            onClick={larger}
            disabled={settings.sizeIndex === FONT_SIZES.length - 1}
            aria-label="Larger text"
          >
            A+
          </button>
          <ThemeToggle />
        </div>

        {status === 'loading' && <p className="note">Loading chapter…</p>}

        {status === 'error' && (
          <p className="note">
            This chapter isn't saved on your device yet. Connect to the
            internet to read it.
          </p>
        )}

        {status === 'missing' && (
          <p className="note">This book isn't available.</p>
        )}

        {status === 'ready' && (
          <>
            <article className="chapter-text">
              <Markdown>{text}</Markdown>
            </article>

            <div className="reader-nav">
              {prev ? (
                <Link
                  to={`/book/${id}/chapter/${prev.number}`}
                  className="nav-button"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to={`/book/${id}/chapter/${next.number}`}
                  className="nav-button nav-primary"
                >
                  Next chapter
                </Link>
              ) : (
                <Link to={`/book/${id}`} className="nav-button nav-primary">
                  Back to chapters
                </Link>
              )}
            </div>

            <ChapterEndAd />
          </>
        )}
      </div>
    </div>
  )
}

export default Reader