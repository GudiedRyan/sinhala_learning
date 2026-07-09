import { useEffect, useState } from 'react'
import { fetchCards } from './api/cards'
import Deck from './components/Deck'
import Translate from './components/Translate'
import Phrasebook from './components/Phrasebook'
import MatchingGame from './components/MatchingGame'
import './App.css'

const TABS = [
  { value: 'flashcards', label: 'Flashcards' },
  { value: 'translate', label: 'Translate' },
  { value: 'phrases', label: 'Phrases' },
  { value: 'matching', label: 'Matching Game' },
]

function App() {
  const [tab, setTab] = useState('flashcards')
  const [cards, setCards] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCards()
      .then(setCards)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="app">
      <h1>Sinhala Learning</h1>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.value}
            className={t.value === tab ? 'active' : ''}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'flashcards' && (
        <>
          {error && <p className="error">Could not load cards: {error}</p>}
          {!error && !cards && <p>Loading...</p>}
          {cards && <Deck cards={cards} />}
        </>
      )}

      {tab === 'translate' && <Translate />}

      {tab === 'phrases' && <Phrasebook />}

      {tab === 'matching' && <MatchingGame />}
    </div>
  )
}

export default App
