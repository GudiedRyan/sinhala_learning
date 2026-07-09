import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { fetchPhrases } from '../api/phrases'
import { shuffle } from '../utils/shuffle'
import './MatchingGame.css'

const ROUND_SIZES = [6, 8, 10, 12]
const MISMATCH_DELAY_MS = 600
const FLIP_DURATION_MS = 400

function registerTileRef(refMap, id, el) {
  if (el) refMap.current.set(id, el)
  else refMap.current.delete(id)
}

const FLIP_THRESHOLD_PX = 1

function flipTiles(tiles, refMap, positionsRef) {
  const newPositions = new Map()

  tiles.forEach((tile) => {
    const el = refMap.current.get(tile.id)
    if (!el) return

    // measure relative to the document, not the viewport, so an unrelated
    // page scroll between measurements can't be mistaken for a tile move
    const top = el.getBoundingClientRect().top + window.scrollY
    newPositions.set(tile.id, top)

    const prevTop = positionsRef.current.get(tile.id)
    if (prevTop !== undefined && Math.abs(prevTop - top) > FLIP_THRESHOLD_PX) {
      const delta = prevTop - top
      el.style.transition = 'none'
      el.style.transform = `translateY(${delta}px)`
      // force reflow so the transform above is applied before we transition it away
      el.getBoundingClientRect()
      requestAnimationFrame(() => {
        el.style.transition = `transform ${FLIP_DURATION_MS}ms ease`
        el.style.transform = ''
      })
    }
  })

  positionsRef.current = newPositions
}

function buildRound(sourcePool, roundSize) {
  const sampled = shuffle(sourcePool).slice(0, Math.min(roundSize, sourcePool.length))
  const left = shuffle(sampled).map((p) => ({
    id: `${p.id}-si`,
    phraseId: p.id,
    sinhala: p.sinhala,
    romanization: p.romanization,
  }))
  const right = shuffle(sampled).map((p) => ({
    id: `${p.id}-en`,
    phraseId: p.id,
    english: p.english,
  }))
  return { sampled, left, right }
}

export default function MatchingGame() {
  const [phrases, setPhrases] = useState(null)
  const [error, setError] = useState(null)

  const [phase, setPhase] = useState('setup')
  const [selectedCategories, setSelectedCategories] = useState(new Set())
  const [randomMix, setRandomMix] = useState(false)
  const [roundSize, setRoundSize] = useState(8)
  const [showRomanization, setShowRomanization] = useState(true)

  const [roundPool, setRoundPool] = useState([])
  const [roundPhrases, setRoundPhrases] = useState([])
  const [leftTiles, setLeftTiles] = useState([])
  const [rightTiles, setRightTiles] = useState([])
  const [selectedLeftId, setSelectedLeftId] = useState(null)
  const [selectedRightId, setSelectedRightId] = useState(null)
  const [matchedPhraseIds, setMatchedPhraseIds] = useState(new Set())
  const [revealedPhraseIds, setRevealedPhraseIds] = useState(new Set())
  const [matchOrder, setMatchOrder] = useState({})
  const [mismatchIds, setMismatchIds] = useState(null)
  const [inputLocked, setInputLocked] = useState(false)

  const mismatchTimeoutRef = useRef(null)
  const matchCounterRef = useRef(0)
  const leftTileRefs = useRef(new Map())
  const rightTileRefs = useRef(new Map())
  const leftPositionsRef = useRef(new Map())
  const rightPositionsRef = useRef(new Map())

  useEffect(() => {
    fetchPhrases()
      .then(setPhrases)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => () => clearTimeout(mismatchTimeoutRef.current), [])

  useLayoutEffect(() => {
    flipTiles(leftTiles, leftTileRefs, leftPositionsRef)
    flipTiles(rightTiles, rightTileRefs, rightPositionsRef)
    // only reorder-animate in response to an actual match/reveal, not on every
    // render (e.g. a plain selection click should never move any tile)
  }, [matchedPhraseIds, matchOrder, leftTiles, rightTiles])

  const categories = useMemo(() => {
    if (!phrases) return []
    return [...new Set(phrases.map((p) => p.category))].sort()
  }, [phrases])

  const pool = useMemo(() => {
    if (!phrases) return []
    if (randomMix) return phrases
    if (selectedCategories.size === 0) return []
    return phrases.filter((p) => selectedCategories.has(p.category))
  }, [phrases, randomMix, selectedCategories])

  const canStart = pool.length >= 2
  const showClampNotice = pool.length > 0 && pool.length < roundSize

  useEffect(() => {
    if (phase === 'playing' && roundPhrases.length > 0 && matchedPhraseIds.size === roundPhrases.length) {
      setPhase('complete')
    }
  }, [matchedPhraseIds, phase, roundPhrases])

  function toggleCategory(cat) {
    setRandomMix(false)
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function enableRandomMix() {
    setSelectedCategories(new Set())
    setRandomMix(true)
  }

  function resetRoundInteractionState() {
    clearTimeout(mismatchTimeoutRef.current)
    setSelectedLeftId(null)
    setSelectedRightId(null)
    setMatchedPhraseIds(new Set())
    setRevealedPhraseIds(new Set())
    setMatchOrder({})
    setMismatchIds(null)
    setInputLocked(false)
    matchCounterRef.current = 0
    leftPositionsRef.current = new Map()
    rightPositionsRef.current = new Map()
  }

  function startRound() {
    const { sampled, left, right } = buildRound(pool, roundSize)
    setRoundPool(pool)
    setRoundPhrases(sampled)
    setLeftTiles(left)
    setRightTiles(right)
    resetRoundInteractionState()
    setPhase('playing')
  }

  function playAgain() {
    const { sampled, left, right } = buildRound(roundPool, roundSize)
    setRoundPhrases(sampled)
    setLeftTiles(left)
    setRightTiles(right)
    resetRoundInteractionState()
    setPhase('playing')
  }

  function changeSettings() {
    clearTimeout(mismatchTimeoutRef.current)
    setPhase('setup')
  }

  function attemptMatch(leftId, rightId) {
    const left = leftTiles.find((t) => t.id === leftId)
    const right = rightTiles.find((t) => t.id === rightId)

    if (left.phraseId === right.phraseId) {
      setMatchedPhraseIds((prev) => new Set(prev).add(left.phraseId))
      setMatchOrder((prev) => ({ ...prev, [left.phraseId]: matchCounterRef.current++ }))
      setSelectedLeftId(null)
      setSelectedRightId(null)
      return
    }

    setInputLocked(true)
    setMismatchIds({ leftId, rightId })
    mismatchTimeoutRef.current = setTimeout(() => {
      setMismatchIds(null)
      setSelectedLeftId(null)
      setSelectedRightId(null)
      setInputLocked(false)
    }, MISMATCH_DELAY_MS)
  }

  function handleLeftClick(tile) {
    if (inputLocked || matchedPhraseIds.has(tile.phraseId)) return
    if (selectedLeftId === tile.id) {
      setSelectedLeftId(null)
      return
    }
    setSelectedLeftId(tile.id)
    if (selectedRightId) attemptMatch(tile.id, selectedRightId)
  }

  function handleRightClick(tile) {
    if (inputLocked || matchedPhraseIds.has(tile.phraseId)) return
    if (selectedRightId === tile.id) {
      setSelectedRightId(null)
      return
    }
    setSelectedRightId(tile.id)
    if (selectedLeftId) attemptMatch(selectedLeftId, tile.id)
  }

  function giveUp() {
    clearTimeout(mismatchTimeoutRef.current)
    const remaining = roundPhrases.filter((p) => !matchedPhraseIds.has(p.id))

    setMatchedPhraseIds((prev) => {
      const next = new Set(prev)
      remaining.forEach((p) => next.add(p.id))
      return next
    })
    setRevealedPhraseIds((prev) => {
      const next = new Set(prev)
      remaining.forEach((p) => next.add(p.id))
      return next
    })
    setMatchOrder((prev) => {
      const next = { ...prev }
      remaining.forEach((p) => {
        next[p.id] = matchCounterRef.current++
      })
      return next
    })
    setSelectedLeftId(null)
    setSelectedRightId(null)
    setMismatchIds(null)
    setInputLocked(false)
  }

  function tileRow(phraseId, index) {
    // unmatched tiles keep a stable row based on their original position;
    // matched/revealed tiles move below all unmatched rows, paired by
    // phraseId so a pair always lands on the same grid row. Using a real
    // CSS grid (not independent flex columns) means the row height is the
    // max of both cells, so multiline phrases on either side can't throw
    // off alignment.
    return matchedPhraseIds.has(phraseId)
      ? roundPhrases.length + 1 + (matchOrder[phraseId] ?? 0)
      : index + 1
  }

  if (error) return <p className="error">Could not load phrases: {error}</p>
  if (!phrases) return <p>Loading...</p>

  return (
    <div className="matching-game">
      {phase === 'setup' && (
        <div className="matching-setup">
          <div className="matching-setup-section">
            <h3>Category</h3>
            <p className="matching-lorem">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="matching-controls">
              <button
                className={`matching-random-mix ${randomMix ? 'active' : ''}`}
                onClick={enableRandomMix}
              >
                🎲 Random Mix
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  className={!randomMix && selectedCategories.has(c) ? 'active' : ''}
                  onClick={() => toggleCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="matching-setup-section">
            <h3>Round size</h3>
            <p className="matching-lorem">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
              ex ea commodo consequat.
            </p>
            <div className="matching-controls">
              {ROUND_SIZES.map((size) => (
                <button
                  key={size}
                  className={size === roundSize ? 'active' : ''}
                  onClick={() => setRoundSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            {showClampNotice && (
              <p className="matching-clamp-notice">
                Only {pool.length} phrase{pool.length === 1 ? '' : 's'} available in this
                selection — playing a round of {pool.length}.
              </p>
            )}
          </div>

          <div className="matching-setup-section">
            <h3>Options</h3>
            <div className="matching-controls">
              <button
                className={showRomanization ? 'active' : ''}
                onClick={() => setShowRomanization((v) => !v)}
              >
                Show romanization (Singlish)
              </button>
            </div>
          </div>

          <button className="matching-start-btn" disabled={!canStart} onClick={startRound}>
            Start
          </button>
        </div>
      )}

      {(phase === 'playing' || phase === 'complete') && (
        <div className="matching-play-area">
          {phase === 'playing' && (
            <div className="matching-board-controls">
              <button className="matching-give-up-btn" onClick={giveUp}>
                Give Up / Reveal Answers
              </button>
            </div>
          )}

          {phase === 'complete' && (
            <div className="matching-complete">
              {revealedPhraseIds.size > 0 ? (
                <p>
                  Round complete — {roundPhrases.length - revealedPhraseIds.size} matched,{' '}
                  {revealedPhraseIds.size} revealed.
                </p>
              ) : (
                <p>You matched all {roundPhrases.length} pairs!</p>
              )}
              <div className="matching-controls">
                <button onClick={playAgain}>Play Again</button>
                <button onClick={changeSettings}>Change Settings</button>
              </div>
            </div>
          )}

          <div className="matching-board">
            {leftTiles.map((tile, index) => (
              <button
                key={tile.id}
                ref={(el) => registerTileRef(leftTileRefs, tile.id, el)}
                style={{ gridColumn: 1, gridRow: tileRow(tile.phraseId, index) }}
                className={[
                  'matching-tile',
                  selectedLeftId === tile.id ? 'selected' : '',
                  matchedPhraseIds.has(tile.phraseId) ? 'matched' : '',
                  revealedPhraseIds.has(tile.phraseId) ? 'revealed' : '',
                  mismatchIds?.leftId === tile.id ? 'mismatch' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleLeftClick(tile)}
              >
                <span className="matching-tile-sinhala">{tile.sinhala}</span>
                {showRomanization && (
                  <span className="matching-tile-romanization">{tile.romanization}</span>
                )}
              </button>
            ))}

            {rightTiles.map((tile, index) => (
              <button
                key={tile.id}
                ref={(el) => registerTileRef(rightTileRefs, tile.id, el)}
                style={{ gridColumn: 2, gridRow: tileRow(tile.phraseId, index) }}
                className={[
                  'matching-tile',
                  selectedRightId === tile.id ? 'selected' : '',
                  matchedPhraseIds.has(tile.phraseId) ? 'matched' : '',
                  revealedPhraseIds.has(tile.phraseId) ? 'revealed' : '',
                  mismatchIds?.rightId === tile.id ? 'mismatch' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleRightClick(tile)}
              >
                <span className="matching-tile-english">{tile.english}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
