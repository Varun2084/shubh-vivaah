import React, { useEffect, useState } from 'react'
import ResumeForm from './components/ResumeForm.jsx'
import PipelineProgress from './components/PipelineProgress.jsx'
import Results from './components/Results.jsx'
import { analyzeStream, getStatus } from './api/client.js'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    getStatus().then(setStatus).catch(() => setStatus(null))
  }, [])

  const handleSubmit = async (form) => {
    setLoading(true)
    setError('')
    setResult(null)
    setEvents([])
    try {
      const data = await analyzeStream(form, (ev) =>
        setEvents((prev) => [...prev, ev]),
      )
      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <h1>
          Career<span>Atlas</span>
        </h1>
        <p>
          AI career planning — parse your resume, find skill gaps, get a
          grounded learning roadmap, and match to jobs.
        </p>
        {status && (
          <div className="badges">
            {Object.entries(status.integrations).map(([k, v]) => (
              <span key={k} className={`badge ${v ? 'on' : 'off'}`}>
                {k.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </header>

      <main className="layout">
        <div className="col">
          <ResumeForm onSubmit={handleSubmit} loading={loading} />
          {(loading || events.length > 0) && (
            <PipelineProgress events={events} />
          )}
          {error && <div className="card error">{error}</div>}
        </div>
        <div className="col">
          {result ? (
            <Results data={result} />
          ) : (
            !loading && (
              <div className="card placeholder">
                <p>
                  Your personalized analysis will appear here. Paste a resume,
                  pick a target role, and hit <strong>Analyze</strong>.
                </p>
              </div>
            )
          )}
        </div>
      </main>

      <footer className="footer">
        <span>
          Built with React · Vite · FastAPI · Groq · Gemini · Pinecone ·
          Tavily · Supabase
        </span>
      </footer>
    </div>
  )
}
