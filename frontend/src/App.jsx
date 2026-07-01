import { useEffect, useState } from 'react'
import { fetchCards } from './api/cards'
import Deck from './components/Deck'
import './App.css'

function App() {
  const [cards, setCards] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCards()
      .then(setCards)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="app">
      <h1>Sinhala Alphabet Flashcards</h1>
      {error && <p className="error">Could not load cards: {error}</p>}
      {!error && !cards && <p>Loading...</p>}
      {cards && <Deck cards={cards} />}
    </div>
  )
}

export default App
