import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CharacterDetailsPage from './pages/CharacterDetailsPage.jsx'
import CharactersPage from './pages/CharactersPage.jsx'
import PartiesPage from './pages/PartiesPage.jsx'
import PartyDetailsPage from './pages/PartyDetailsPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/characters" replace /> },
      { path: 'characters', element: <CharactersPage /> },
      { path: 'characters/:id', element: <CharacterDetailsPage /> },
      { path: 'parties', element: <PartiesPage /> },
      { path: 'parties/:id', element: <PartyDetailsPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
