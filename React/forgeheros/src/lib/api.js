const DRAGONBALL_API_BASE_URL = '/dragonball-api/api'

export async function fetchDragonballCharacters() {
  const limit = 10
  const firstRes = await fetch(`${DRAGONBALL_API_BASE_URL}/characters?limit=${limit}&page=1`)
  if (!firstRes.ok) throw new Error(`DragonBall request failed: ${firstRes.status}`)
  const firstData = await firstRes.json()
  const items = Array.isArray(firstData?.items) ? firstData.items : []
  const totalPages = Number(firstData?.meta?.totalPages ?? 1)

  for (let page = 2; page <= totalPages; page += 1) {
    const res = await fetch(`${DRAGONBALL_API_BASE_URL}/characters?limit=${limit}&page=${page}`)
    if (!res.ok) throw new Error(`DragonBall request failed: ${res.status}`)
    const data = await res.json()
    const pageItems = Array.isArray(data?.items) ? data.items : []
    items.push(...pageItems)
  }

  return items
}
