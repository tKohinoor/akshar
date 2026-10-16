import { useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { useOnline } from './useOnline'
import {
  showBannerAd,
  resumeBannerAd,
  hideBannerAd,
  removeBannerAd,
} from './ads'

function ChapterEndAd() {
  const slot = useRef(null)
  const online = useOnline()
  const enabled = Capacitor.isNativePlatform() && online

  useEffect(() => {
    if (!enabled || !slot.current) return

    let created = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (created) {
            resumeBannerAd()
          } else {
            created = true
            showBannerAd()
          }
        } else if (created) {
          hideBannerAd()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(slot.current)

    return () => {
      observer.disconnect()
      if (created) removeBannerAd()
    }
  }, [enabled])

  if (!enabled) return null
  return <div ref={slot} className="ad-slot" aria-hidden="true" />
}

export default ChapterEndAd