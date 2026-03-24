/**
 * Base API path. In dev, Vite proxies `/api` to the Symfony server (see vite.config.js).
 * Override with VITE_API_BASE_URL e.g. http://127.0.0.1:8000/api/v1 for direct calls.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '')

async function apiGet(path) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    let msg = `Request failed (${res.status})`
    try {
      const j = JSON.parse(text)
      if (j?.error) msg = j.error
    } catch {
      if (text) msg = text.slice(0, 200)
    }
    throw new Error(msg)
  }
  return res.json()
}

export function fetchCharacters(params = {}) {
  const sp = new URLSearchParams()
  if (params.name) sp.set('name', params.name)
  if (params.race != null && params.race !== '') sp.set('race', String(params.race))
  if (params.class != null && params.class !== '') sp.set('class', String(params.class))
  const q = sp.toString()
  return apiGet(`/characters${q ? `?${q}` : ''}`)
}

export function fetchCharacter(id) {
  return apiGet(`/characters/${id}`)
}

/** @param {'full'|'available'|undefined} filter */
export function fetchParties(filter) {
  const q = filter ? `?filter=${encodeURIComponent(filter)}` : ''
  return apiGet(`/parties${q}`)
}

export function fetchParty(id) {
  return apiGet(`/parties/${id}`)
}
