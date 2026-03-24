import { useEffect, useMemo, useState } from 'react'
import { Alert, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { mockParties } from '../data/mockParties'
import { fetchDragonballCharacters } from '../lib/api'
import { toSimpleCharacters } from '../lib/adapters'

export default function PartiesPage() {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

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

  const parties = mockParties
    .map((p) => ({ ...p, members: p.memberIds.map((id) => charactersById[id]).filter(Boolean) }))
    .filter((p) => (onlyAvailable ? p.members.length < p.maxSize : true))

  return (
    <>
      <h2 className="mb-3">Parties</h2>
      <Form.Check type="switch" id="available-switch" label="Only available places" className="mb-4" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
      {loading && <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>}
      {!loading && error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Row xs={1} md={2} className="g-4">
          {parties.map((p) => (
            <Col key={p.id}>
              <Card className="h-100">
                <Card.Body>
                  <h5>{p.name}</h5>
                  <div className="text-muted mb-2">{p.description}</div>
                  <div>Members: {p.members.length}/{p.maxSize}</div>
                  <div>Places left: {p.maxSize - p.members.length}</div>
                  <Link to={`/parties/${p.id}`}>Open details</Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}
