import { useSettings } from './useSettings'

function ThemeToggle() {
  const { settings, update } = useSettings()
  const dark = settings.theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => update({ theme: dark ? 'light' : 'dark' })}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {dark ? 'Day' : 'Night'}
    </button>
  )
}

export default ThemeToggle