import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBooks } from './api'
import { getProgress } from './progress'
import Cover from './Cover'
import ThemeToggle from './ThemeToggle'
import './BookPage.css'
import { getBooks, prefetchChapter } from './api'
import BackLink from './BackLink'

function BookPage() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | missing | error
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    getBooks((fresh) => {
      const updated = fresh.find((b) => b.id === id)
      if (updated) setBook(updated)
    })
      .then((books) => {
        const found = books.find((b) => b.id === id)
        if (found) {
          setBook(found)
          setStatus('ready')
        } else {
          setStatus('missing')
        }
      })
      .catch(() => setStatus('error'))
  }, [id])

  useEffect(() => {
    getProgress(id).then(setProgress)
  }, [id])

  const resume =
    progress && book
      ? book.chapters.find((c) => c.number === progress.chapter)
      : null

  useEffect(() => {
    if (!book) return
    const target = resume ?? book.chapters[0]
    if (target) prefetchChapter(book.id, target.number)
  }, [book, resume])

  return (
    <div className="page">
      <div className="page-top">
        <BackLink to="/" label="Back to library" />
        <ThemeToggle />
      </div>

      {status === 'loading' && <p className="note">Loading…</p>}
      {status === 'error' && (
        <p className="note">
          Could not load this book. Connect to the internet and try again.
        </p>
      )}
      {status === 'missing' && (
        <p className="note">This book isn't available.</p>
      )}

      {status === 'ready' && (
        <>
          <div className="book-hero">
            <Cover book={book} />
            <div>
              <h1>{book.title}</h1>
              <p className="author">{book.author}</p>
            </div>
          </div>

          {book.description && <p className="description">{book.description}</p>}

          {resume && (
            <Link
              to={`/book/${book.id}/chapter/${resume.number}`}
              className="continue-button"
            >
              Continue reading: {resume.title}
            </Link>
          )}

          <h2 className="index-heading">Chapters</h2>
          <ol className="chapter-list">
            {book.chapters.map((ch) => (
              <li key={ch.number}>
                <Link to={`/book/${book.id}/chapter/${ch.number}`}>
                  <span className="ch-number">{ch.number}</span>
                  <span className="ch-title">{ch.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

export default BookPage