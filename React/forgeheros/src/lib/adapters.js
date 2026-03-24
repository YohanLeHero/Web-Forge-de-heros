function toDataUrl(base64) {
  if (base64 == null || base64 === '') return ''
  if (typeof base64 !== 'string') return ''
  if (base64.startsWith('data:') || base64.startsWith('http://') || base64.startsWith('https://')) {
    return base64
  }
  return `data:image/png;base64,${base64}`
}

/** @param {Record<string, unknown>} c */
export function normalizeCharacterSummary(c) {
  return {
    id: c.id,
    name: c.name ?? 'Unknown',
    level: c.level ?? 0,
    image: toDataUrl(c.image),
    race: c.race?.name ?? '',
    className: c.characterClass?.name ?? '',
  }
}

/** @param {Record<string, unknown>} c */
export function normalizeCharacterDetail(c) {
  const base = normalizeCharacterSummary(c)
  return {
    ...base,
    strength: c.strength ?? 0,
    dexterity: c.dexterity ?? 0,
    constitution: c.constitution ?? 0,
    intelligence: c.intelligence ?? 0,
    wisdom: c.wisdom ?? 0,
    charisma: c.charisma ?? 0,
    healthPoint: c.healthPoint ?? 0,
    description: '',
    skills: Array.isArray(c.skills) ? c.skills.map((s) => s.name ?? '') : [],
    parties: Array.isArray(c.parties)
      ? c.parties.map((p) => ({
          id: p.id,
          name: p.name ?? '',
          maxSize: p.maxSize,
          memberCount: p.memberCount,
        }))
      : [],
  }
}

export function normalizeCharacterSummaries(items) {
  return items.map(normalizeCharacterSummary)
}

/** @param {Record<string, unknown>} p */
export function normalizePartySummary(p) {
  return {
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    maxSize: p.maxSize ?? 0,
    memberCount: p.memberCount ?? 0,
    placesLeft: p.placesLeft ?? 0,
  }
}

/** @param {Record<string, unknown>} p */
export function normalizePartyDetail(p) {
  const base = normalizePartySummary(p)
  return {
    ...base,
    members: Array.isArray(p.members) ? normalizeCharacterSummaries(p.members) : [],
  }
}
