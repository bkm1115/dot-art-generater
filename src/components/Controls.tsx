import type { Settings } from '../types'
import {
  MAX_COLUMNS,
  MAX_ROWS,
  MIN_COLUMNS,
  MIN_ROWS,
} from '../utils/constants'

type ControlsProps = {
  fixedRows: number
  fixedColumns: number
  settings: Settings
  onChange: (next: Partial<Settings>) => void
}

export function Controls({
  fixedRows,
  fixedColumns,
  settings,
  onChange,
}: ControlsProps) {
  return (
    <section className="panel controls">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2>변환 설정</h2>
          <p className="panel-subtitle">
            출력 사이즈와 톤을 간단히 조절해요.
          </p>
        </div>
      </div>

      <div className="control-group">
        <div>
          <p className="control-label">Output Size</p>
          <p className="control-hint">
            {fixedColumns} columns x {fixedRows} rows (모바일 댓글 기본값)
          </p>
        </div>
      </div>

      <div className="control-group">
        <div className="control-row">
          <p className="control-label">Columns</p>
          <span className="control-value">{settings.cols}</span>
        </div>
        <input
          type="range"
          min={MIN_COLUMNS}
          max={MAX_COLUMNS}
          value={settings.cols}
          onChange={(event) =>
            onChange({ cols: Number(event.target.value) })
          }
        />
      </div>

      <div className="control-group">
        <div className="control-row">
          <p className="control-label">Rows</p>
          <span className="control-value">{settings.rows}</span>
        </div>
        <input
          type="range"
          min={MIN_ROWS}
          max={MAX_ROWS}
          value={settings.rows}
          onChange={(event) =>
            onChange({ rows: Number(event.target.value) })
          }
        />
      </div>

      <div className="control-group">
        <div className="control-row">
          <p className="control-label">밝기</p>
          <span className="control-value">{settings.brightness}</span>
        </div>
        <input
          type="range"
          min={-50}
          max={50}
          value={settings.brightness}
          onChange={(event) =>
            onChange({ brightness: Number(event.target.value) })
          }
        />
      </div>

      <div className="control-group">
        <div className="control-row">
          <p className="control-label">선명도</p>
          <span className="control-value">{settings.contrast}</span>
        </div>
        <input
          type="range"
          min={-50}
          max={50}
          value={settings.contrast}
          onChange={(event) =>
            onChange({ contrast: Number(event.target.value) })
          }
        />
      </div>

      <div className="control-group">
        <div className="control-row">
          <p className="control-label">Dithering (명암)</p>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.dithering}
              onChange={(event) =>
                onChange({ dithering: event.target.checked })
              }
              aria-label="Dithering"
            />
          </label>
        </div>
      </div>
    </section>
  )
}
