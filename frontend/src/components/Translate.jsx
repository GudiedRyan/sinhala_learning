import { useState } from 'react'
import { translateText } from '../api/translate'
import './Translate.css'

const DIRECTIONS = {
  'en-si': { label: 'English → Sinhala', placeholder: 'Type English text...' },
  'si-en': { label: 'Sinhala → English', placeholder: 'සිංහලෙන් type කරන්න...' },
}

export default function Translate() {
  const [direction, setDirection] = useState('en-si')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [pronunciation, setPronunciation] = useState(null)
  const [inputPronunciation, setInputPronunciation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function swapDirection() {
    setDirection((d) => (d === 'en-si' ? 'si-en' : 'en-si'))
    setInput(output)
    setOutput(input)
    setPronunciation(inputPronunciation)
    setInputPronunciation(pronunciation)
    setError(null)
  }

  async function handleTranslate(event) {
    event.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    try {
      const result = await translateText(input, direction)
      setOutput(result.translation)
      setPronunciation(result.pronunciation)
      setInputPronunciation(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="translate">
      <div className="translate-direction">
        <span>{DIRECTIONS[direction].label}</span>
        <button type="button" onClick={swapDirection}>
          Swap
        </button>
      </div>

      <form onSubmit={handleTranslate} className="translate-form">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={DIRECTIONS[direction].placeholder}
          rows={4}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Translating…' : 'Translate'}
        </button>
      </form>

      {loading && (
        <p className="translate-hint">
          First translation after a fresh backend start can take a minute or two while the model loads.
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {output && !error && (
        <div className="translate-output">
          <div>{output}</div>
          {pronunciation && <div className="translate-pronunciation">{pronunciation}</div>}
        </div>
      )}
    </div>
  )
}
