import React, { useState } from 'react'

const SAMPLE = `Priya Sharma
priya.sharma@example.com

Summary: Frontend developer with 3 years of experience building responsive web apps.

Skills: JavaScript, React, CSS, HTML, Git, REST

Experience:
Frontend Developer at Brightwave
- Built responsive React interfaces used by 50k users

Education:
B.Tech in Computer Science, Example University`

const ROLES = [
  'Backend Engineer',
  'Frontend Engineer',
  'Full Stack Developer',
  'Machine Learning Engineer',
  'Data Scientist',
  'AI Engineer',
]

export default function ResumeForm({ onSubmit, loading }) {
  const [resumeText, setResumeText] = useState('')
  const [targetRole, setTargetRole] = useState(ROLES[0])

  const submit = (e) => {
    e.preventDefault()
    if (resumeText.trim().length < 20) return
    onSubmit({ resumeText, targetRole })
  }

  return (
    <form className="card form" onSubmit={submit}>
      <label className="field">
        <span>Target role</span>
        <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Paste your resume</span>
        <textarea
          rows={12}
          value={resumeText}
          placeholder="Paste your resume text here…"
          onChange={(e) => setResumeText(e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setResumeText(SAMPLE)}
        >
          Use sample resume
        </button>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Analyzing…' : 'Analyze my career'}
        </button>
      </div>
    </form>
  )
}
