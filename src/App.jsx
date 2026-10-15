import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import SplashScreen from './SplashScreen'
import Home from './Home'
import BookPage from './BookPage'
import Reader from './Reader'
import OfflineNotice from './OfflineNotice'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2600)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2600)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <SplashScreen />

  return (
    <>
      <OfflineNotice />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book/:id" element={<BookPage />} />
        <Route path="/book/:id/chapter/:n" element={<Reader />} />
        <Route
          path="*"
          element={
            <div className="page">
              <p className="note">This page doesn't exist.</p>
              <p className="note">
                <Link to="/" className="back">
                  Go to library
                </Link>
              </p>
            </div>
          }
        />
      </Routes>
    </>
  )
}

export default App