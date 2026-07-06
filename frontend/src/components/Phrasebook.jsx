import { useEffect, useMemo, useState } from 'react'
import { fetchPhrases } from '../api/phrases'
import './Phrasebook.css'

export default function Phrasebook() {
  const [phrases, setPhrases] = useState(null)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPhrases()
      .then(setPhrases)
      .catch((err) => setError(err.message))
  }, [])

  const categories = useMemo(() => {
    if (!phrases) return []
    return [...new Set(phrases.map((p) => p.category))].sort()
  }, [phrases])

  const filtered = useMemo(() => {
    if (!phrases) return []
    const query = search.trim().toLowerCase()

    return phrases.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!query) return true

      return (
        p.english.toLowerCase().includes(query) ||
        p.romanization.toLowerCase().includes(query) ||
        p.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  }, [phrases, category, search])

  if (error) return <p className="error">Could not load phrases: {error}</p>
  if (!phrases) return <p>Loading...</p>

  return (
    <div className="phrasebook">
      <input
        type="text"
        className="phrasebook-search"
        placeholder="Search phrases (e.g. bus, greeting)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="phrasebook-controls">
        <button
          className={category === 'all' ? 'active' : ''}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={c === category ? 'active' : ''}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>No phrases match.</p>
      ) : (
        <ul className="phrasebook-list">
          {filtered.map((p) => (
            <li key={p.id} className="phrasebook-row">
              <div className="phrasebook-sinhala-block">
                <span className="phrasebook-sinhala">{p.sinhala}</span>
                <span className="phrasebook-romanization">{p.romanization}</span>
              </div>
              <span className="phrasebook-english">{p.english}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
