export async function translateText(text, direction) {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, direction }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Translation failed')
  }
  return { translation: data.translation, pronunciation: data.pronunciation }
}
