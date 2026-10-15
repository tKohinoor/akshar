import { useState, useEffect } from 'react'
import { SettingsContext } from './useSettings'
import { loadSettings, saveSettings, DEFAULTS } from './settings'

function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)

  useEffect(() => {
    loadSettings().then(setSettings)
  }, [])

  // The whole app's colours follow this attribute on <html>
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  function update(changes) {
    const next = { ...settings, ...changes }
    setSettings(next)
    saveSettings(next)
  }

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsProvider