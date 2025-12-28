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

  const handleReset = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setImage(null)
    setImageUrl(null)
    setFileName(null)
    setError(null)
    setWarning(null)
    setSettings(DEFAULT_SETTINGS)
    setOutput('')
    setStats(getBaseStats(DEFAULT_ROWS, DEFAULT_COLUMNS))
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
          <nav className="hero-nav">
            <a href="#about">소개</a>
            <a href="#how">사용법</a>
            <a href="#faq">FAQ</a>
            <a href="#privacy">개인정보</a>
            <a href="#terms">이용약관</a>
          </nav>
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
        <Preview
          text={output}
          hasImage={Boolean(image)}
          onCopy={handleCopy}
          onReset={handleReset}
        />
        <Stats stats={stats} warning={warning} />
      </main>

      <section className="info-grid">
        <article className="panel info" id="about">
          <h2>소개</h2>
          <p>
            Dotart Comment Studio는 이미지를 점자(Braille) 문자로 변환해
            댓글에 붙여넣을 수 있게 만드는 도구입니다. 모든 처리는 브라우저
            내부에서만 진행되며, 업로드한 이미지는 서버로 전송되지 않습니다.
          </p>
        </article>
        <article className="panel info" id="how">
          <h2>사용법</h2>
          <ol>
            <li>이미지를 업로드하거나 업로드 영역을 클릭합니다.</li>
            <li>Columns/Rows로 해상도를 맞춥니다.</li>
            <li>밝기/선명도/명암 디더링을 조절합니다.</li>
            <li>클립보드에 복사한 뒤 댓글에 붙여넣습니다.</li>
          </ol>
        </article>
        <article className="panel info" id="faq">
          <h2>자주 묻는 질문</h2>
          <p>
            Q. 결과가 흐릿해요. A. Rows/Columns를 늘리거나 선명도를 올려
            보세요.
          </p>
          <p>
            Q. 줄 정렬이 깨져요. A. 댓글 폰트가 고정폭이 아니라서 생기는
            현상입니다.
          </p>
        </article>
      </section>

      <section className="policy-grid">
        <article className="panel info" id="privacy">
          <h2>개인정보 처리방침</h2>
          <p>
            이 서비스는 사용자의 이미지를 서버로 전송하지 않습니다. 모든
            변환은 브라우저 내에서만 이루어지며, 저장되는 개인정보는
            없습니다.
          </p>
          <p>
            향후 광고(예: Google AdSense)가 게재될 경우, 광고 제공자가 쿠키
            또는 유사한 기술을 사용할 수 있습니다.
          </p>
        </article>
        <article className="panel info" id="terms">
          <h2>서비스 이용약관</h2>
          <p>
            본 서비스는 이미지 변환 기능을 제공하는 도구로, 사용자는 본인의
            권리를 가진 콘텐츠만 업로드해야 합니다.
          </p>
          <p>
            서비스 이용 중 발생하는 결과물의 사용 및 배포에 대한 책임은
            사용자에게 있습니다.
          </p>
        </article>
      </section>

      <footer className="footer">
        <span>문의: </span>
        <a
          href="https://github.com/bkm1115/dot-art-generater"
          target="_blank"
          rel="noreferrer"
        >
          GitHub Repository
        </a>
      </footer>
    </div>
  )
}

export default App
