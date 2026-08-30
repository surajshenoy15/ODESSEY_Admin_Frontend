import { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCw, ServerOff } from 'lucide-react'
import { API_BASE_URL } from '../api/client'

export function ConnectionBanner() {
  const [state, setState] = useState({ checking: true, online: true })

  async function check() {
    setState((current) => ({ ...current, checking: true }))
    try {
      const healthUrl = API_BASE_URL.replace(/\/api\/v1$/, '') + '/health'
      const response = await fetch(healthUrl)
      setState({ checking: false, online: response.ok })
    } catch {
      setState({ checking: false, online: false })
    }
  }

  useEffect(() => {
    check()
    const timer = window.setInterval(check, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  if (state.checking && state.online) return null
  if (state.online) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-900">
      <div className="flex items-center gap-2"><ServerOff className="h-4 w-4" /><span><strong>Backend unavailable.</strong> Start FastAPI and confirm <code className="rounded bg-red-100 px-1 py-0.5">VITE_API_BASE_URL</code>.</span></div>
      <button type="button" onClick={check} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold hover:bg-red-100"><RefreshCw className="h-4 w-4" />Retry</button>
    </div>
  )
}
