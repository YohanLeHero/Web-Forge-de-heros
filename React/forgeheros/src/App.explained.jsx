import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle'
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'

// Базовый URL внешнего API DragonBall.
// Если в окружении задана переменная VITE_DRAGONBALL_API_BASE_URL — будет использовано её значение.
const DRAGONBALL_API_BASE_URL =
  import.meta.env.VITE_DRAGONBALL_API_BASE_URL ?? '/dragonball-api/api'

export default function AppExplained() {
  // ------------------------------------------------------------
  // 1) State: данные и текущее состояние UI
  // ------------------------------------------------------------

  // Список персонажей, полученных из API.
  // Мы специально храним «сырые» объекты, которые возвращает DragonBall,
  // чтобы в дальнейшем легко было заменить источник данных на Symfony.
  const [characters, setCharacters] = useState([])

  // Пока идёт загрузка, показываем спиннер.
  const [loading, setLoading] = useState(true)

  // Если при запросе случится ошибка — покажем текст пользователю.
  const [error, setError] = useState(null)

  // Фильтр по имени (поиск по подстроке, без учёта регистра).
  const [nameQuery, setNameQuery] = useState('')

  // Фильтр по Race.
  // Значение 'all' означает «не фильтровать».
  const [selectedRace, setSelectedRace] = useState('all')

  // Фильтр по «Class».
  // В DragonBall поле называется affiliation, поэтому «класс» сейчас берём из него.
  const [selectedClass, setSelectedClass] = useState('all')

  // Порядок сортировки по имени: 'asc' (по возрастанию) или 'desc' (по убыванию).
  const [sortOrder, setSortOrder] = useState('asc')

  // ------------------------------------------------------------
  // 2) Загрузка данных (useEffect)
  // ------------------------------------------------------------

  // Эффект с пустым массивом зависимостей [] выполняется:
  // - один раз при первом монтировании компонента
  // - не выполняется при изменении state
  useEffect(() => {
    // Обёртка вокруг async, чтобы useEffect оставался синхронным.
    async function load() {
      // Поднимаем флаг загрузки и очищаем предыдущую ошибку.
      setLoading(true)
      setError(null)

      try {
        // По документации API есть лимит по умолчанию.
        // Фиксируем лимит явно, чтобы предсказуемо ходить по страницам.
        const limit = 10

        // Сначала запрашиваем страницу 1, чтобы узнать общее число страниц.
        const firstRes = await fetch(
          `${DRAGONBALL_API_BASE_URL}/characters?limit=${limit}&page=1`,
        )
        if (!firstRes.ok) {
          // Если сервер вернул HTTP-ошибку — выбрасываем исключение.
          throw new Error(`DragonBall request failed: ${firstRes.status}`)
        }

        // Парсим JSON.
        const firstData = await firstRes.json()

        // items — это массив персонажей.
        // Если API вернуло что-то неожиданное, защищаемся через Array.isArray.
        const items = Array.isArray(firstData?.items) ? firstData.items : []

        // meta.totalPages — количество страниц.
        const totalPages = Number(firstData?.meta?.totalPages ?? 1)

        // Загружаем страницы 2..totalPages и дополняем items.
        for (let page = 2; page <= totalPages; page += 1) {
          const res = await fetch(
            `${DRAGONBALL_API_BASE_URL}/characters?limit=${limit}&page=${page}`,
          )
          if (!res.ok) {
            throw new Error(`DragonBall request failed: ${res.status}`)
          }

          const data = await res.json()
          const pageItems = Array.isArray(data?.items) ? data.items : []

          // Добавляем персонажей текущей страницы к общему списку.
          items.push(...pageItems)
        }

        // Сохраняем итоговый массив в state.
        setCharacters(items)
      } catch (e) {
        // Показываем ошибку пользователю.
        setError(e?.message ?? 'Unknown error')
      } finally {
        // Это выполняется и при успехе, и при ошибке — отключаем спиннер.
        setLoading(false)
      }
    }

    // Старт загрузки.
    load()
  }, [])

  // ------------------------------------------------------------
  // 3) Динамические варианты фильтров
  // ------------------------------------------------------------

  // Список уникальных рас из загруженных персонажей.
  // Мы добавляем 'all' в начало, чтобы была опция «все расы».
  const raceOptions = [
    'all',
    ...Array.from(new Set(characters.map((c) => c.race).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'fr', { sensitivity: 'base' }),
    ),
  ]

  // Список уникальных affiliation (аналог «класса» в этой временной версии).
  const classOptions = [
    'all',
    ...Array.from(new Set(characters.map((c) => c.affiliation).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'fr', { sensitivity: 'base' }),
    ),
  ]

  // ------------------------------------------------------------
  // 4) Фильтрация и сортировка
  // ------------------------------------------------------------

  // Нормализуем запрос:
  // - обрезаем пробелы по краям
  // - приводим к нижнему регистру для нечувствительности к регистру
  const query = nameQuery.trim().toLowerCase()

  // В зависимости от выбранного порядка сортировки используем множитель.
  // Для 'asc' -> 1, для 'desc' -> -1.
  const sortMultiplier = sortOrder === 'asc' ? 1 : -1

  // filteredAndSorted:
  // 1) filter — оставляем только тех, кто подходит под все критерии
  // 2) sort   — сортируем по имени
  const filteredAndSorted = characters
    .filter((c) => {
      // Совпадение по имени:
      // - если query пустой, совпадают все
      // - иначе проверяем includes (подстроку)
      const matchesName =
        query === '' || String(c.name ?? '').toLowerCase().includes(query)

      // Совпадение по race:
      // - 'all' означает, что фильтр выключен
      // - иначе сравниваем точное значение c.race
      const matchesRace = selectedRace === 'all' || c.race === selectedRace

      // Совпадение по «классу»:
      // - 'all' выключает фильтр
      // - иначе сравниваем affiliation
      const matchesClass = selectedClass === 'all' || c.affiliation === selectedClass

      return matchesName && matchesRace && matchesClass
    })
    .sort((a, b) => {
      // localeCompare сравнивает строки корректнее, чем < или >.
      // Умножение на sortMultiplier разворачивает направление сортировки.
      const baseCmp = String(a.name ?? '').localeCompare(
        String(b.name ?? ''),
        'en',
        { sensitivity: 'base' },
      )
      return baseCmp * sortMultiplier
    })

  // ------------------------------------------------------------
  // 5) UI: отображение
  // ------------------------------------------------------------

  return (
    <Container className="py-4">
      <h1 className="mb-4">Forge de Héros</h1>

      {/* Карточка с фильтрами */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            {/* Поиск по имени */}
            <Col md={4}>
              <Form.Label>Nom</Form.Label>
              <Form.Control
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Rechercher un héros"
              />
            </Col>

            {/* Фильтр по расе */}
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

            {/* Фильтр по «классу» (в DragonBall это affiliation) */}
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

            {/* Сброс фильтров */}
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

          {/* Строка с параметром сортировки и показом статистики */}
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

      {/* Loading */}
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {/* Error */}
      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {/* Список карточек */}
      {!loading && !error && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredAndSorted.map((c) => (
            <Col key={c.id}>
              <Card className="h-100">
                {/* Картинка персонажа */}
                {c.image ? (
                  <Card.Img
                    variant="top"
                    src={c.image}
                    alt={c.name}
                    style={{ height: 220, objectFit: 'cover' }}
                  />
                ) : null}

                <Card.Body className="d-flex flex-column">
                  {/* Имя */}
                  <Card.Title>{c.name}</Card.Title>

                  {/* Race + affiliation */}
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

import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle'
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'

// Base URL de l'API DragonBall.
// Tu peux éventuellement le surcharger via la variable d'environnement VITE_DRAGONBALL_API_BASE_URL.
const DRAGONBALL_API_BASE_URL =
  import.meta.env.VITE_DRAGONBALL_API_BASE_URL ?? '/dragonball-api/api'

export default function AppExplained() {
  // ------------------------------------------------------------
  // 1) Etat (state) : données + UI
  // ------------------------------------------------------------

  // Liste des personnages chargés depuis l'API.
  // On stocke directement les objets reçus par DragonBall pour rester simple.
  const [characters, setCharacters] = useState([])

  // Indique si on est en train de charger les données.
  const [loading, setLoading] = useState(true)

  // Si une erreur arrive pendant le fetch, on la stocke ici.
  const [error, setError] = useState(null)

  // Filtre "Nom": texte saisi par l'utilisateur.
  const [nameQuery, setNameQuery] = useState('')

  // Filtre "Race": valeur sélectionnée dans la dropdown (ou 'all').
  const [selectedRace, setSelectedRace] = useState('all')

  // Filtre "Classe": valeur sélectionnée dans la dropdown (ou 'all').
  // Dans DragonBall, le champ s'appelle "affiliation".
  const [selectedClass, setSelectedClass] = useState('all')

  // Tri: 'asc' pour ascendant, 'desc' pour descendant.
  const [sortOrder, setSortOrder] = useState('asc')

  // ------------------------------------------------------------
  // 2) Chargement initial des données (useEffect)
  // ------------------------------------------------------------

  // useEffect(..., []) signifie :
  // - ce bloc s'exécute une seule fois, au premier rendu (montage du composant)
  // - pas de re-exécution lors des changements d'état
  useEffect(() => {
    // Chargement dans une fonction async pour utiliser await.
    async function load() {
      // On affiche le spinner pendant le chargement.
      setLoading(true)
      // On enlève l'erreur précédente au lancement.
      setError(null)

      try {
        // La doc annonce un limit par défaut, mais on fixe explicitement pour contrôler.
        const limit = 10

        // Première page : pour récupérer totalPages.
        const firstRes = await fetch(
          `${DRAGONBALL_API_BASE_URL}/characters?limit=${limit}&page=1`,
        )
        if (!firstRes.ok) {
          throw new Error(`DragonBall request failed: ${firstRes.status}`)
        }

        // Réponse JSON.
        const firstData = await firstRes.json()

        // items = liste de personnages.
        const items = Array.isArray(firstData?.items) ? firstData.items : []

        // totalPages sert à savoir combien de pages récupérer.
        const totalPages = Number(firstData?.meta?.totalPages ?? 1)

        // On récupère les pages 2..totalPages.
        for (let page = 2; page <= totalPages; page += 1) {
          const res = await fetch(
            `${DRAGONBALL_API_BASE_URL}/characters?limit=${limit}&page=${page}`,
          )
          if (!res.ok) {
            throw new Error(`DragonBall request failed: ${res.status}`)
          }

          const data = await res.json()
          const pageItems = Array.isArray(data?.items) ? data.items : []

          // On concatène les personnages de la page courante.
          items.push(...pageItems)
        }

        // Fin du chargement : on stocke tout dans l'état.
        setCharacters(items)
      } catch (e) {
        // En cas d'erreur réseau, erreur HTTP, ou JSON invalide.
        setError(e?.message ?? 'Unknown error')
      } finally {
        // On termine toujours : même en cas d'erreur.
        setLoading(false)
      }
    }

    load()
  }, [])

  // ------------------------------------------------------------
  // 3) Options de filtres (race / class) calculées à partir des données
  // ------------------------------------------------------------

  // Liste des races distinctes présentes dans characters.
  // On ajoute 'all' pour permettre "toutes les races".
  const raceOptions = [
    'all',
    ...Array.from(new Set(characters.map((c) => c.race).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'fr', { sensitivity: 'base' }),
    ),
  ]

  // Liste des affiliations distinctes présentes dans characters.
  // On ajoute 'all' pour permettre "toutes les classes".
  const classOptions = [
    'all',
    ...Array.from(new Set(characters.map((c) => c.affiliation).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'fr', { sensitivity: 'base' }),
    ),
  ]

  // ------------------------------------------------------------
  // 4) Filtrage + tri
  // ------------------------------------------------------------

  // Normalisation du texte saisi : minuscules + trim.
  const query = nameQuery.trim().toLowerCase()

  // sortMultiplier = 1 si asc, -1 si desc.
  // On le multiplie dans le compare pour inverser le tri.
  const sortMultiplier = sortOrder === 'asc' ? 1 : -1

  // 1) filter : on garde uniquement les personnages qui correspondent à tous les critères
  // 2) sort   : on trie par nom
  const filteredAndSorted = characters
    .filter((c) => {
      // Le nom correspond si :
      // - la recherche est vide, ou
      // - name contient query (insensible à la casse)
      const matchesName = query === '' || String(c.name ?? '').toLowerCase().includes(query)

      // La race correspond si :
      // - selectedRace = 'all', ou
      // - c.race === selectedRace
      const matchesRace = selectedRace === 'all' || c.race === selectedRace

      // La classe correspond si :
      // - selectedClass = 'all', ou
      // - c.affiliation === selectedClass
      const matchesClass = selectedClass === 'all' || c.affiliation === selectedClass

      return matchesName && matchesRace && matchesClass
    })
    .sort(
      (a, b) =>
        // localeCompare compare deux strings selon une locale.
        String(a.name ?? '').localeCompare(String(b.name ?? ''), 'en', { sensitivity: 'base' }) *
        sortMultiplier,
    )

  // ------------------------------------------------------------
  // 5) UI : rendu (render)
  // ------------------------------------------------------------

  return (
    <Container className="py-4">
      <h1 className="mb-4">Forge de Héros</h1>

      {/* Bloc de filtres */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            {/* Filtre par nom */}
            <Col md={4}>
              <Form.Label>Nom</Form.Label>
              <Form.Control
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Rechercher un héros"
              />
            </Col>

            {/* Filtre par race */}
            <Col md={3}>
              <Form.Label>Race</Form.Label>
              <Form.Select
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
              >
                {raceOptions.map((race) => (
                  <option key={race} value={race}>
                    {race === 'all' ? 'Toutes' : race}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Filtre par classe/affiliation */}
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

            {/* Reset */}
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
            {/* Ordre de tri */}
            <Col md={2}>
              <Form.Label>Ordre</Form.Label>
              <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">Ascendant</option>
                <option value="desc">Décroissant</option>
              </Form.Select>
            </Col>

            {/* Résumé */}
            <Col md={10} className="text-md-end">
              <div className="text-muted">
                {filteredAndSorted.length} résultat(s) sur {characters.length}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {/* Error */}
      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {/* Cards */}
      {!loading && !error && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredAndSorted.map((c) => (
            <Col key={c.id}>
              <Card className="h-100">
                {/* Image */}
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

                  {/* Race + affiliation */}
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

