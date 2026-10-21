import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'

function BackButtonHandler() {
  const location = useLocation()
  const navigate = useNavigate()

  // Keep the latest values where the long-lived listener can read them
  const latest = useRef({ location, navigate })
  useEffect(() => {
    latest.current = { location, navigate }
  }, [location, navigate])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let handle = null
    let cancelled = false

    CapApp.addListener('backButton', () => {
      const { location: loc, navigate: go } = latest.current
      if (loc.pathname === '/') {
        CapApp.exitApp()
      } else if (loc.key !== 'default') {
        go(-1) // one step back
      } else {
        go('/', { replace: true }) // no earlier screen: go to the library
      }
    }).then((h) => {
      if (cancelled) h.remove()
      else handle = h
    })

    return () => {
      cancelled = true
      if (handle) handle.remove()
    }
  }, [])

  return null
}

export default BackButtonHandler