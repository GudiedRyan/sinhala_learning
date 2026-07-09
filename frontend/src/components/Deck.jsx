import { useMemo, useState } from 'react'
import Flashcard from './Flashcard'
import { shuffle } from '../utils/shuffle'
import './Deck.css'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'consonant', label: 'Consonants' },
  { value: 'vowel', label: 'Vowels' },
  { value: 'mahaprana', label: 'Mahaprana' },
]

export default function Deck({ cards }) {
  const [category, setCategory] = useState('all')
  const [baseOrder, setBaseOrder] = useState(cards)
  const [index, setIndex] = useState(0)

  const deck = useMemo(
    () => (category === 'all' ? baseOrder : baseOrder.filter((c) => c.category === category)),
    [baseOrder, category],
  )

  const cardsBySortOrder = useMemo(
    () => Object.fromEntries(cards.map((c) => [c.sort_order, c])),
    [cards],
  )

  function goTo(newIndex) {
    setIndex((newIndex + deck.length) % deck.length)
  }

  function handleCategoryChange(value) {
    setCategory(value)
    setIndex(0)
  }

  function handleShuffle() {
    setBaseOrder(shuffle(cards))
    setIndex(0)
  }

  if (deck.length === 0) {
    return <p>No cards to show.</p>
  }

  return (
    <div className="deck">
      <div className="deck-controls">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={c.value === category ? 'active' : ''}
            onClick={() => handleCategoryChange(c.value)}
          >
            {c.label}
          </button>
        ))}
        <button onClick={handleShuffle}>Shuffle</button>
      </div>

      <Flashcard
        card={deck[index % deck.length]}
        linkedCard={cardsBySortOrder[deck[index % deck.length].linked_char]}
      />

      <div className="deck-nav">
        <button onClick={() => goTo(index - 1)}>Prev</button>
        <span>
          {(index % deck.length) + 1} / {deck.length}
        </span>
        <button onClick={() => goTo(index + 1)}>Next</button>
      </div>
    </div>
  )
}
