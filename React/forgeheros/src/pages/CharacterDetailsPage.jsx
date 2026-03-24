import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, ProgressBar, Row, Spinner } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { mockParties } from '../data/mockParties'
import { fetchDragonballCharacters } from '../lib/api'
import { toSimpleCharacters } from '../lib/adapters'

export default function CharacterDetailsPage() {
  const { id } = useParams()
  const characterId = Number(id)
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const raw = await fetchDragonballCharacters()
        const mapped = toSimpleCharacters(raw)
        const found = mapped.find((c) => c.id === characterId) ?? null
        setCharacter(found)
      } catch (e) {
        setError(e?.message ?? 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [characterId])

  const parties = useMemo(
    () => mockParties.filter((p) => p.memberIds.includes(characterId)),
    [characterId],
  )

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
  if (error) return <Alert variant="danger">{error}</Alert>
  if (!character) return <Alert variant="warning">Character not found.</Alert>

  const stats = [
    ['STR', character.strength],
    ['DEX', character.dexterity],
    ['CON', character.constitution],
    ['INT', character.intelligence],
    ['WIS', character.wisdom],
    ['CHA', character.charisma],
  ]

  return (
    <>
      <Button as={Link} to="/characters" variant="outline-secondary" className="mb-3">Back</Button>
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-4">
            <Col md={4}>{character.image ? <img src={character.image} alt={character.name} style={{ width: '100%', borderRadius: 8 }} /> : null}</Col>
            <Col md={8}>
              <h2>{character.name}</h2>
              <div className="mb-2 text-muted">{character.className} • {character.race}</div>
              <div className="mb-2">Level: {character.level}</div>
              <div className="mb-3">{character.description || 'No description'}</div>
              <div className="mb-3"><strong>Skills:</strong> {character.skills.join(', ') || 'None'}</div>
              <h5 className="mb-2">Stats</h5>
              {stats.map(([label, value]) => <div key={label} className="mb-2">{label} ({value})<ProgressBar now={((value - 8) / 7) * 100} /></div>)}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h5 className="mb-3">Parties</h5>
          {parties.length === 0 && <div className="text-muted">No parties</div>}
          {parties.map((p) => <div key={p.id} className="mb-2"><Link to={`/parties/${p.id}`}>{p.name}</Link></div>)}
        </Card.Body>
      </Card>
    </>
  )
}
