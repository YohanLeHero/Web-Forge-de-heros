import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { fetchCharacters } from '../lib/api'
import { normalizeCharacterSummaries } from '../lib/adapters'

export default function CharactersPage() {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [race, setRace] = useState('all')
  const [className, setClassName] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const raw = await fetchCharacters()
        setCharacters(normalizeCharacterSummaries(raw))
      } catch (e) {
        setError(e?.message ?? 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const raceOptions = ['all', ...new Set(characters.map((c) => c.race).filter(Boolean))]
  const classOptions = ['all', ...new Set(characters.map((c) => c.className).filter(Boolean))]
  const q = name.trim().toLowerCase()
  const sorted = characters
    .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
    .filter((c) => (race === 'all' ? true : c.race === race))
    .filter((c) => (className === 'all' ? true : c.className === className))
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1
      if (sortBy === 'level') return (a.level - b.level) * multiplier
      return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) * multiplier
    })

  return (
    <>
      <h2 className="mb-3">Characters</h2>
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-2">
            <Col md={3}><Form.Control placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /></Col>
            <Col md={2}><Form.Select value={race} onChange={(e) => setRace(e.target.value)}>{raceOptions.map((v) => <option key={v} value={v}>{v === 'all' ? 'All races' : v}</option>)}</Form.Select></Col>
            <Col md={2}><Form.Select value={className} onChange={(e) => setClassName(e.target.value)}>{classOptions.map((v) => <option key={v} value={v}>{v === 'all' ? 'All classes' : v}</option>)}</Form.Select></Col>
            <Col md={2}><Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="name">Sort: Name</option><option value="level">Sort: Level</option></Form.Select></Col>
            <Col md={2}><Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}><option value="asc">Asc</option><option value="desc">Desc</option></Form.Select></Col>
            <Col md={1}><Button variant="outline-secondary" onClick={() => { setName(''); setRace('all'); setClassName('all'); setSortBy('name'); setSortOrder('asc') }}>Reset</Button></Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>}
      {!loading && error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {sorted.map((c) => (
            <Col key={c.id}>
              <Card className="h-100">
                {c.image ? <Card.Img variant="top" src={c.image} alt={c.name} style={{ height: 220, objectFit: 'cover' }} /> : null}
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{c.name}</Card.Title>
                  <div className="text-muted mb-2">{c.className} • {c.race}</div>
                  <div className="mb-3">Level: {c.level}</div>
                  <Button as={Link} to={`/characters/${c.id}`} className="mt-auto">Details</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}
