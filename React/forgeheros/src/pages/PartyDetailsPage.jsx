import { useEffect, useState } from 'react'
import { Alert, Button, Card, Spinner } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { fetchParty } from '../lib/api'
import { normalizePartyDetail } from '../lib/adapters'

export default function PartyDetailsPage() {
  const { id } = useParams()
  const partyId = Number(id)
  const [party, setParty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const raw = await fetchParty(partyId)
        setParty(normalizePartyDetail(raw))
      } catch (e) {
        setError(e?.message ?? 'Unknown error')
        setParty(null)
      } finally {
        setLoading(false)
      }
    }
    if (Number.isFinite(partyId)) load()
  }, [partyId])

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
          <div className="mb-3">Members: {party.memberCount}/{party.maxSize}</div>
          <h5 className="mb-2">Members</h5>
          {party.members.length === 0 && <div className="text-muted">No members</div>}
          {party.members.map((m) => <div key={m.id} className="mb-2"><Link to={`/characters/${m.id}`}>{m.name}</Link></div>)}
        </Card.Body>
      </Card>
    </>
  )
}
