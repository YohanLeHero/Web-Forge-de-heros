import { useEffect, useState } from 'react'
import { Alert, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { fetchParties } from '../lib/api'
import { normalizePartySummary } from '../lib/adapters'

export default function PartiesPage() {
  const [parties, setParties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const raw = await fetchParties(onlyAvailable ? 'available' : undefined)
        setParties(raw.map(normalizePartySummary))
      } catch (e) {
        setError(e?.message ?? 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [onlyAvailable])

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
                  <div>Members: {p.memberCount}/{p.maxSize}</div>
                  <div>Places left: {p.placesLeft}</div>
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
