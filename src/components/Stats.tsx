import type { OutputStats } from '../types'

type StatsProps = {
  stats: OutputStats
  warning: string | null
}

export function Stats({ stats, warning }: StatsProps) {
  return (
    <section className="stats">
      <div className="stats-grid">
        <div className="stat">
          <span>Characters</span>
          <strong>{stats.charCount}</strong>
        </div>
        <div className="stat">
          <span>Rows</span>
          <strong>{stats.rows}</strong>
        </div>
        <div className="stat">
          <span>Columns</span>
          <strong>{stats.cols}</strong>
        </div>
      </div>

      {warning ? <p className="warning-message">{warning}</p> : null}
    </section>
  )
}
