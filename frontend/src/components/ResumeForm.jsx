import React, { useRef, useState } from 'react'
import { extractResume } from '../api/client.js'

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
  const [fileInfo, setFileInfo] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    if (resumeText.trim().length < 20) return
    onSubmit({ resumeText, targetRole })
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    setFileInfo('')
    try {
      const { text, characters } = await extractResume(file)
      setResumeText(text)
      setFileInfo(`Loaded ${file.name} · ${characters.toLocaleString()} chars`)
    } catch (err) {
      setUploadError(err.message || 'Could not read that file.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
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
        <span>Paste your resume — or upload a file</span>
        <textarea
          rows={12}
          value={resumeText}
          placeholder="Paste your resume text here…"
          onChange={(e) => setResumeText(e.target.value)}
        />
      </label>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        onChange={onFile}
        hidden
      />
      {fileInfo && <p className="muted">{fileInfo}</p>}
      {uploadError && <p className="muted upload-error">{uploadError}</p>}

      <div className="form-actions">
        <div className="form-actions-left">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Reading…' : 'Upload file'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setResumeText(SAMPLE)}
          >
            Use sample resume
          </button>
        </div>
        <button type="submit" className="btn" disabled={loading || uploading}>
          {loading ? 'Analyzing…' : 'Analyze my career'}
        </button>
      </div>
    </form>
  )
}
