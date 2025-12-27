import { useEffect, useRef, useState } from 'react'
import { Controls } from './components/Controls'
import { ImageUploader } from './components/ImageUploader'
import { Preview } from './components/Preview'
import { Stats } from './components/Stats'
import { floydSteinberg, thresholdToBinary } from './utils/dither'
import { DEFAULT_FORMATTER } from './utils/formatters'
import { drawImageToImageData, imageDataToLuminance } from './utils/image'
import {
  DEFAULT_BRIGHTNESS,
  DEFAULT_CONTRAST,
  DEFAULT_DITHERING,
  DEFAULT_COLUMNS,
  DEFAULT_ROWS,
  MAX_COLUMNS,
  MAX_ROWS,
  MIN_COLUMNS,
  MIN_ROWS,
} from './utils/constants'
import type { OutputStats, Settings } from './types'
import './App.css'

const FORMATTER = DEFAULT_FORMATTER

const DEFAULT_SETTINGS: Settings = {
  rows: DEFAULT_ROWS,
  cols: DEFAULT_COLUMNS,
  brightness: DEFAULT_BRIGHTNESS,
  contrast: DEFAULT_CONTRAST,
  dithering: DEFAULT_DITHERING,
}

const clampValue = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const getBaseStats = (rows: number, cols: number): OutputStats => ({
  rows,
  cols,
  charCount: 0,
  safeCharCount: rows * (cols + 1),
})

function computeOutput(image: HTMLImageElement, settings: Settings) {
  const { cellWidth, cellHeight } = FORMATTER
  const rows = clampValue(settings.rows, MIN_ROWS, MAX_ROWS)
  const cols = clampValue(settings.cols, MIN_COLUMNS, MAX_COLUMNS)

  const pixelWidth = cols * cellWidth
  const pixelHeight = rows * cellHeight

  const imageData = drawImageToImageData(image, pixelWidth, pixelHeight)
  const luminance = imageDataToLuminance(
    imageData,
    settings.brightness,
    settings.contrast
  )

  const pixels = settings.dithering
    ? floydSteinberg(luminance, pixelWidth, pixelHeight)
    : thresholdToBinary(luminance, pixelWidth, pixelHeight)

  const text = FORMATTER.format(pixels, cols, rows)
  const charCount = text.length
  const safeCharCount = rows * (cols + 1)

  return { text, cols, rows, charCount, safeCharCount }
}

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [output, setOutput] = useState('')
  const [stats, setStats] = useState<OutputStats>(
    getBaseStats(DEFAULT_ROWS, DEFAULT_COLUMNS)
  )
  const [warning, setWarning] = useState<string | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  useEffect(() => {
    if (!image) {
      setOutput('')
      setStats(getBaseStats(settings.rows, settings.cols))
      setWarning(null)
      return
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      try {
        const result = computeOutput(image, settings)
        setOutput(result.text)
        setStats({
          rows: result.rows,
          cols: result.cols,
          charCount: result.charCount,
          safeCharCount: result.safeCharCount,
        })
      } catch {
        setOutput('')
        setStats(getBaseStats(settings.rows, settings.cols))
        setWarning('이미지 처리 중 문제가 발생했어요. 다시 시도해 주세요.')
      }
    })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [image, settings])

  const handleSettingsChange = (next: Partial<Settings>) => {
    setSettings((prev) => {
      const rows = clampValue(
        next.rows ?? prev.rows,
        MIN_ROWS,
        MAX_ROWS
      )
      const cols = clampValue(
        next.cols ?? prev.cols,
        MIN_COLUMNS,
        MAX_COLUMNS
      )

      return {
        ...prev,
        ...next,
        rows,
        cols,
      }
    })
  }

  const handleImageLoaded = (payload: {
    image: HTMLImageElement
    url: string
    name: string
  }) => {
    setImage(payload.image)
    setError(null)
    setWarning(null)
    setFileName(payload.name)
    setImageUrl(payload.url)
  }

  const handleCopy = async () => {
    if (!output) return false

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard unavailable')
      }
      await navigator.clipboard.writeText(output)
      return true
    } catch {
      setWarning('클립보드 권한이 필요해요. 직접 복사해 주세요.')
      return false
    }
  }

  return (
    <div className="app">
      <header className="hero compact">
        <div className="hero-text">
          <p className="eyebrow">Dotart Comment</p>
          <h1>이미지 → 댓글용 점자 아트</h1>
          <p className="subtitle">
            모바일 기준 기본 크기(20x12)로 시작해요.
          </p>
        </div>
      </header>

      <main className="layout single">
        <ImageUploader
          previewUrl={imageUrl}
          fileName={fileName}
          onImageLoaded={handleImageLoaded}
          onError={setError}
          error={error}
        />
        <Controls
          fixedRows={DEFAULT_ROWS}
          fixedColumns={DEFAULT_COLUMNS}
          settings={settings}
          onChange={handleSettingsChange}
        />
        <Preview text={output} hasImage={Boolean(image)} onCopy={handleCopy} />
        <Stats stats={stats} warning={warning} />
      </main>
    </div>
  )
}

export default App
