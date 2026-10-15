import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBooks } from './api'
import Cover from './Cover'
import './Home.css'
import { getLastRead } from './progress'
import ThemeToggle from './ThemeToggle'

function Home() {
  const [books, setBooks] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [query, setQuery] = useState('')
  const [lastRead, setLastRead] = useState(null)

  useEffect(() => {
    getLastRead().then(setLastRead)
  }, [])

  useEffect(() => {
    getBooks((fresh) => setBooks(fresh))
      .then((data) => {
        setBooks(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const q = query.trim().toLowerCase()
  const results = books.filter(
    (b) =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  )

  const continueBook = lastRead
    ? books.find((b) => b.id === lastRead.bookId)
    : null
  const continueChapter = continueBook
    ? continueBook.chapters.find((c) => c.number === lastRead.chapter)
    : null

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-top">
          <h1>अक्षर</h1>
          <ThemeToggle />
        </div>
        <input
          className="search"
          type="search"
          placeholder="Search by title or author"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      {status === 'ready' && continueChapter && q === '' && (
        <Link
          to={`/book/${continueBook.id}/chapter/${continueChapter.number}`}
          className="continue-card"
        >
          <span className="continue-label">Continue reading</span>
          <span className="continue-title">{continueBook.title}</span>
          <span className="continue-chapter">
            Chapter {continueChapter.number}: {continueChapter.title}
          </span>
        </Link>
      )}

      {status === 'loading' && <p className="note">Loading books…</p>}

      {status === 'error' && (
        <p className="note">
          Could not load books. Check your internet connection and try again.
        </p>
      )}

      {status === 'ready' && results.length === 0 && (
        <p className="note">
          Could not load the library. Connect to the internet and try again.
        </p>
      )}

      <ul className="book-list">
        {results.map((book) => (
          <li key={book.id}>
            <Link to={`/book/${book.id}`} className="book-card">
              <Cover book={book} />
              <div className="book-info">
                <h2>{book.title}</h2>
                <p className="author">{book.author}</p>
                <p className="chapters">{book.chapters.length} chapters</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Home