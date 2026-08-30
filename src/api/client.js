const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://odessey-backend.onrender.com/api/v1').replace(/\/$/, '')
const SESSION_KEY = 'odyssey_admin_session'

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}

function buildHeaders(options = {}) {
  const headers = new Headers(options.headers || {})
  const session = getSession()
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return headers
}

async function parseError(response) {
  let detail = `Request failed with status ${response.status}`
  try {
    const payload = await response.json()
    if (typeof payload?.detail === 'string') detail = payload.detail
    else if (payload?.detail?.message) detail = payload.detail.message
    else if (Array.isArray(payload?.detail)) detail = payload.detail.map((item) => item.msg || JSON.stringify(item)).join(', ')
    else if (payload?.message) detail = payload.message
  } catch { /* Keep fallback. */ }
  const error = new Error(detail)
  error.status = response.status
  return error
}

export async function apiRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: buildHeaders(options) })
  } catch (cause) {
    const error = new Error('Cannot reach the backend. Confirm FastAPI is running and CORS allows this frontend URL.')
    error.cause = cause
    error.status = 0
    throw error
  }
  if (response.status === 401) window.dispatchEvent(new CustomEvent('odyssey:unauthorized'))
  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  return response
}

export const apiGet = (path) => apiRequest(path)
export const apiPost = (path, body) => apiRequest(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) })
export const apiPut = (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) })
export const apiPatch = (path, body) => apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) })
export const apiDelete = (path) => apiRequest(path, { method: 'DELETE' })

export function withQuery(path, params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  })
  const suffix = query.toString()
  return suffix ? `${path}?${suffix}` : path
}

export async function downloadFile(path, fallbackName) {
  const response = await apiRequest(path)
  const blob = await response.blob()
  const disposition = response.headers.get('content-disposition') || ''
  const match = disposition.match(/filename="?([^";]+)"?/i)
  const filename = match?.[1] || fallbackName
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function fetchProtectedBlobUrl(path) {
  const response = await apiRequest(path)
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export { API_BASE_URL, SESSION_KEY }
