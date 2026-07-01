export async function fetchCards(category) {
  const url = category ? `/api/cards?category=${category}` : '/api/cards'
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch cards: ${res.status}`)
  }
  return res.json()
}
