import React from 'react'

function ScoreRing({ score, label }) {
  return (
    <div className="ring" style={{ '--pct': score }}>
      <div className="ring-inner">
        <strong>{score}</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function importanceClass(importance) {
  return `pill pill-${importance}`
}

export default function Results({ data }) {
  const { gap_analysis, roadmap, roadmap_evaluation, jobs, resume } = data

  return (
    <div className="results">
      <section className="card">
        <div className="results-header">
          <div>
            <h2>{data.target_role}</h2>
            <p className="muted">
              Parsed {resume.skills.length} skills
              {resume.years_of_experience
                ? ` · ${resume.years_of_experience} yrs experience`
                : ''}
              {data.mock_mode ? ' · mock mode' : ''}
            </p>
          </div>
          <div className="score-row">
            <ScoreRing score={gap_analysis.readiness_score} label="readiness" />
            <ScoreRing score={roadmap_evaluation.score} label="roadmap" />
          </div>
        </div>
        <p>{gap_analysis.summary}</p>
      </section>

      <section className="card">
        <h3>Skill gaps</h3>
        <div className="skills">
          <div>
            <h4>You already have</h4>
            <div className="tag-row">
              {gap_analysis.matched_skills.length ? (
                gap_analysis.matched_skills.map((s) => (
                  <span key={s} className="tag tag-good">
                    {s}
                  </span>
                ))
              ) : (
                <span className="muted">No direct matches yet.</span>
              )}
            </div>
          </div>
          <div>
            <h4>To learn</h4>
            <ul className="gap-list">
              {gap_analysis.missing_skills.map((g) => (
                <li key={g.skill}>
                  <span className={importanceClass(g.importance)}>
                    {g.importance}
                  </span>
                  <span className="gap-skill">{g.skill}</span>
                  <span className="muted">{g.rationale}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="results-header">
          <h3>Learning roadmap</h3>
          <span className="muted">{roadmap.total_weeks} weeks total</span>
        </div>
        <ol className="roadmap">
          {roadmap.milestones.map((m, i) => (
            <li key={i} className="milestone">
              <div className="milestone-head">
                <strong>{m.title}</strong>
                <span className="muted">{m.estimated_weeks}w</span>
              </div>
              <p>{m.description}</p>
              {m.resources.length > 0 && (
                <div className="tag-row">
                  {m.resources.map((r, j) => (
                    <a
                      key={j}
                      className="resource"
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.type} · {r.title}
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
        {roadmap_evaluation.feedback && (
          <p className="muted eval-note">⚖ {roadmap_evaluation.feedback}</p>
        )}
      </section>

      <section className="card">
        <h3>Recommended jobs</h3>
        <div className="jobs">
          {jobs.map((job, i) => (
            <a
              key={i}
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="job"
            >
              <div className="job-head">
                <strong>{job.title}</strong>
                <span className="match">{job.match_score}% match</span>
              </div>
              <span className="muted">
                {job.company}
                {job.location ? ` · ${job.location}` : ''}
              </span>
              <p>{job.reason}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
