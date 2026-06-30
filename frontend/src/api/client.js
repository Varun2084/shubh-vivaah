// API client for the CareerAtlas backend.

const BASE = import.meta.env.VITE_API_BASE || ''

export async function getStatus() {
  const res = await fetch(`${BASE}/status`)
  if (!res.ok) throw new Error('Failed to load status')
  return res.json()
}

// Uploads a resume file and returns its extracted plain text.
export async function extractResume(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/api/extract`, { method: 'POST', body: form })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || 'Could not read that file.')
  }
  return res.json()
}

export async function analyze({ resumeText, targetRole }) {
  const res = await fetch(`${BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_text: resumeText, target_role: targetRole }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail?.[0]?.msg || 'Analysis failed')
  }
  return res.json()
}

// Streams pipeline progress via SSE. onEvent receives PipelineEvent objects;
// the resolved promise returns the final AnalyzeResponse.
export async function analyzeStream({ resumeText, targetRole }, onEvent) {
  const res = await fetch(`${BASE}/api/analyze/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_text: resumeText, target_role: targetRole }),
  })
  if (!res.ok || !res.body) throw new Error('Streaming analysis failed')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''
    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data:')) continue
      const payload = JSON.parse(line.slice(5).trim())
      if (payload.type === 'event') onEvent?.(payload.data)
      else if (payload.type === 'result') result = payload.data
    }
  }
  return result
}
