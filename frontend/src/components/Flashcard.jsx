import { useState, useEffect } from 'react'
import './Flashcard.css'

export default function Flashcard({ card, linkedCard }) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [card])

  return (
    <div className="flashcard" onClick={() => setFlipped((f) => !f)}>
      <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
        <div className="flashcard-face flashcard-front">
          <span className="sinhala-char">{card.sinhala_char}</span>
        </div>
        <div className="flashcard-face flashcard-back">
          <span className="romanization">{card.romanization}</span>
          <span className="sound-description">{card.sound_description}</span>
          {linkedCard && (
            <span className="linked-char">
              Aspirated version of {linkedCard.sinhala_char} ({linkedCard.romanization})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
