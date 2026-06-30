import React from 'react'

const STAGES = [
  { key: 'resume_parser', label: 'Parsing resume' },
  { key: 'gap_analyzer', label: 'Analyzing skill gaps' },
  { key: 'roadmap_researcher', label: 'Researching roadmap' },
  { key: 'evaluator', label: 'Evaluating quality' },
  { key: 'job_matcher', label: 'Matching jobs' },
]

export default function PipelineProgress({ events }) {
  const statusFor = (key) => {
    const matching = events.filter((e) => e.stage === key)
    if (matching.some((e) => e.status === 'completed')) return 'done'
    if (matching.some((e) => e.status === 'started')) return 'active'
    return 'pending'
  }
  const detailFor = (key) => {
    const completed = [...events].reverse().find(
      (e) => e.stage === key && e.status === 'completed',
    )
    return completed?.detail || ''
  }

  return (
    <div className="card pipeline">
      <h3>Agent pipeline</h3>
      <ol className="stages">
        {STAGES.map((s) => {
          const state = statusFor(s.key)
          return (
            <li key={s.key} className={`stage ${state}`}>
              <span className="dot" />
              <span className="stage-label">{s.label}</span>
              <span className="stage-detail">{detailFor(s.key)}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
