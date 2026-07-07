import { useEffect, useState } from 'react'
import { fetchCards } from '../api/cards'
import './SinhalaKeyboard.css'

const VOWEL_SIGNS = [
  { sinhala_char: 'ා', romanization: 'ā' },
  { sinhala_char: 'ැ', romanization: 'æ' },
  { sinhala_char: 'ෑ', romanization: 'ǣ' },
  { sinhala_char: 'ි', romanization: 'i' },
  { sinhala_char: 'ී', romanization: 'ī' },
  { sinhala_char: 'ු', romanization: 'u' },
  { sinhala_char: 'ූ', romanization: 'ū' },
  { sinhala_char: 'ෙ', romanization: 'e' },
  { sinhala_char: 'ේ', romanization: 'ē' },
  { sinhala_char: 'ෛ', romanization: 'ai' },
  { sinhala_char: 'ො', romanization: 'o' },
  { sinhala_char: 'ෝ', romanization: 'ō' },
  { sinhala_char: 'ෞ', romanization: 'au' },
  { sinhala_char: '්', romanization: 'hal kirima' },
  { sinhala_char: 'ං', romanization: 'anusvara' },
]

export default function SinhalaKeyboard({ onKeyPress, onBackspace }) {
  const [cards, setCards] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCards()
      .then(setCards)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error">Could not load keyboard: {error}</p>
  if (!cards) return <p>Loading keyboard...</p>

  const vowels = cards.filter((c) => c.category === 'vowel').sort((a, b) => a.sort_order - b.sort_order)
  const consonants = cards
    .filter((c) => c.category === 'consonant' || c.category === 'mahaprana')
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="sinhala-keyboard">
      <div className="sinhala-keyboard-row">
        {vowels.map((c) => (
          <button
            key={c.id}
            type="button"
            className="sinhala-key"
            onClick={() => onKeyPress(c.sinhala_char)}
          >
            <span className="sinhala-key-char">{c.sinhala_char}</span>
            <span className="sinhala-key-label">{c.romanization}</span>
          </button>
        ))}
      </div>

      <div className="sinhala-keyboard-row">
        {consonants.map((c) => (
          <button
            key={c.id}
            type="button"
            className="sinhala-key"
            onClick={() => onKeyPress(c.sinhala_char)}
          >
            <span className="sinhala-key-char">{c.sinhala_char}</span>
            <span className="sinhala-key-label">{c.romanization}</span>
          </button>
        ))}
      </div>

      <div className="sinhala-keyboard-row">
        {VOWEL_SIGNS.map((v) => (
          <button
            key={v.sinhala_char}
            type="button"
            className="sinhala-key"
            onClick={() => onKeyPress(v.sinhala_char)}
          >
            <span className="sinhala-key-char">{v.sinhala_char}</span>
            <span className="sinhala-key-label">{v.romanization}</span>
          </button>
        ))}
      </div>

      <div className="sinhala-keyboard-row sinhala-keyboard-utility-row">
        <button type="button" className="sinhala-key sinhala-key-space" onClick={() => onKeyPress(' ')}>
          space
        </button>
        <button type="button" className="sinhala-key sinhala-key-backspace" onClick={onBackspace}>
          ⌫
        </button>
      </div>
    </div>
  )
}
