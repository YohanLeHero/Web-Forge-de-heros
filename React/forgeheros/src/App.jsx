import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle'
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'

const DRAGONBALL_API_BASE_URL =
  import.meta.env.VITE_DRAGONBALL_API_BASE_URL ?? '/dragonball-api/api'

export default function App() {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [nameQuery, setNameQuery] = useState('')
  const [selectedRace, setSelectedRace] = useState('all')
  const [selectedClass, setSelectedClass] = useState('all')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
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

        setCharacters(items)
      } catch (e) {
        setError(e?.message ?? 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const raceOptions = [
    'all',
    ...Array.from(new Set(characters.map((c) => c.race).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })),
  ]

  const classOptions = [
    'all',
    ...Array.from(new Set(characters.map((c) => c.affiliation).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })),
  ]

  const query = nameQuery.trim().toLowerCase()
  const sortMultiplier = sortOrder === 'asc' ? 1 : -1
  const filteredAndSorted = characters
    .filter((c) => {
      const matchesName = query === '' || c.name.toLowerCase().includes(query)
      const matchesRace = selectedRace === 'all' || c.race === selectedRace
      const matchesClass = selectedClass === 'all' || c.affiliation === selectedClass
      return matchesName && matchesRace && matchesClass
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }) * sortMultiplier)

  return (
    <Container className="py-4">
      <h1 className="mb-4">Forge de Héros</h1>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label>Nom</Form.Label>
              <Form.Control
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Rechercher un héros"
              />
            </Col>

            <Col md={3}>
              <Form.Label>Race</Form.Label>
              <Form.Select value={selectedRace} onChange={(e) => setSelectedRace(e.target.value)}>
                {raceOptions.map((race) => (
                  <option key={race} value={race}>
                    {race === 'all' ? 'Toutes' : race}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label>Classe</Form.Label>
              <Form.Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classOptions.map((characterClass) => (
                  <option key={characterClass} value={characterClass}>
                    {characterClass === 'all' ? 'Toutes' : characterClass}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label>&nbsp;</Form.Label>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setNameQuery('')
                  setSelectedRace('all')
                  setSelectedClass('all')
                  setSortOrder('asc')
                }}
              >
                Réinitialiser
              </Button>
            </Col>
          </Row>

          <Row className="g-3 align-items-end mt-1">
            <Col md={2}>
              <Form.Label>Ordre</Form.Label>
              <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="asc">Ascendant</option>
                <option value="desc">Décroissant</option>
              </Form.Select>
            </Col>

            <Col md={10} className="text-md-end">
              <div className="text-muted">
                {filteredAndSorted.length} résultat(s) sur {characters.length}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredAndSorted.map((c) => (
            <Col key={c.id}>
              <Card className="h-100">
                {c.image ? (
                  <Card.Img
                    variant="top"
                    src={c.image}
                    alt={c.name}
                    style={{ height: 220, objectFit: 'cover' }}
                  />
                ) : null}

                <Card.Body className="d-flex flex-column">
                  <Card.Title>{c.name}</Card.Title>
                  <div className="text-muted mb-2">
                    {c.affiliation || '—'} • {c.race || '—'}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}

