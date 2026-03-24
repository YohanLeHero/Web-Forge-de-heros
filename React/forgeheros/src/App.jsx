import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { NavLink, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md">
        <Container>
          <Navbar.Brand as={NavLink} to="/">
            Forge de Heros
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/characters">
              Characters
            </Nav.Link>
            <Nav.Link as={NavLink} to="/parties">
              Parties
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  )
}

