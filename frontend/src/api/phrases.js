export async function fetchPhrases() {
  const res = await fetch('/api/phrases')
  if (!res.ok) {
    throw new Error(`Failed to fetch phrases: ${res.status}`)
  }
  return res.json()
}
