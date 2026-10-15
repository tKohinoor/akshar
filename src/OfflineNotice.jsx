import { useOnline } from './useOnline'

function OfflineNotice() {
  const online = useOnline()
  if (online) return null

  return (
    <div className="offline-notice" role="status">
      You're offline. Saved books and chapters still work.
    </div>
  )
}

export default OfflineNotice