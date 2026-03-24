import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Spinner } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { mockParties } from '../data/mockParties'
import { fetchDragonballCharacters } from '../lib/api'
import { toSimpleCharacters } from '../lib/adapters'

export default function PartyDetailsPage() {
  const { id } = useParams()
  const partyId = Number(id)
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const raw = await fetchDragonballCharacters()
        setCharacters(toSimpleCharacters(raw))
      } catch (e) {
        setError(e?.message ?? 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const charactersById = useMemo(
    () => Object.fromEntries(characters.map((c) => [c.id, c])),
    [characters],
  )

  const party = useMemo(() => {
    const found = mockParties.find((p) => p.id === partyId)
    if (!found) return null
    return { ...found, members: found.memberIds.map((memberId) => charactersById[memberId]).filter(Boolean) }
  }, [partyId, charactersById])

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
  if (error) return <Alert variant="danger">{error}</Alert>
  if (!party) return <Alert variant="warning">Party not found.</Alert>

  return (
    <>
      <Button as={Link} to="/parties" variant="outline-secondary" className="mb-3">Back</Button>
      <Card>
        <Card.Body>
          <h2>{party.name}</h2>
          <div className="text-muted mb-2">{party.description}</div>
          <div className="mb-3">Members: {party.members.length}/{party.maxSize}</div>
          <h5 className="mb-2">Members</h5>
          {party.members.length === 0 && <div className="text-muted">No members</div>}
          {party.members.map((m) => <div key={m.id} className="mb-2"><Link to={`/characters/${m.id}`}>{m.name}</Link></div>)}
        </Card.Body>
      </Card>
    </>
  )
}
