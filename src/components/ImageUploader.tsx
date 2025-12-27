import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { loadImageFromFile } from '../utils/image'

const MAX_FILE_SIZE_MB = 8
const SUPPORTED_TYPES = ['image/jpeg', 'image/png']

type ImageUploaderProps = {
  previewUrl: string | null
  fileName: string | null
  onImageLoaded: (payload: {
    image: HTMLImageElement
    url: string
    name: string
  }) => void
  onError: (message: string) => void
  error: string | null
}

export function ImageUploader({
  previewUrl,
  fileName,
  onImageLoaded,
  onError,
  error,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canSelect = !previewUrl

  const triggerFileDialog = () => {
    if (!canSelect) return
    inputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!SUPPORTED_TYPES.includes(file.type)) {
      onError('JPG 또는 PNG 파일만 업로드할 수 있어요.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError(`파일이 너무 커요. ${MAX_FILE_SIZE_MB}MB 이하로 올려주세요.`)
      event.target.value = ''
      return
    }

    try {
      const { image, url } = await loadImageFromFile(file)
      onImageLoaded({ image, url, name: file.name })
      event.target.value = ''
    } catch {
      onError('이미지를 불러오지 못했어요. 다른 파일을 시도해 주세요.')
      event.target.value = ''
    }
  }

  return (
    <section className="panel uploader">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Step 1</p>
          <h2>이미지 업로드</h2>
          <p className="panel-subtitle">
            JPG/PNG를 올리면 바로 미리보기가 시작돼요.
          </p>
        </div>
      </div>

      <div
        className={`uploader-drop ${previewUrl ? 'has-image' : 'clickable'}`}
        role={canSelect ? 'button' : undefined}
        tabIndex={canSelect ? 0 : undefined}
        onClick={canSelect ? triggerFileDialog : undefined}
        onKeyDown={
          canSelect
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  triggerFileDialog()
                }
              }
            : undefined
        }
      >
        {previewUrl ? (
          <img src={previewUrl} alt="업로드한 이미지 미리보기" />
        ) : (
          <div className="uploader-guide">
            <p>이미지를 올리면</p>
            <p>댓글용 점자 아트로 변환돼요.</p>
            <span>2x4 픽셀이 1글자가 됩니다.</span>
          </div>
        )}
      </div>

      <div className="uploader-actions">
        {canSelect ? (
          <button
            type="button"
            className="button primary"
            onClick={triggerFileDialog}
          >
            이미지 선택
          </button>
        ) : null}
        <div className="file-meta">
          {fileName ? fileName : '아직 업로드된 파일이 없어요.'}
        </div>
        <input
          ref={inputRef}
          className="uploader-input"
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
        />
      </div>

      {error ? <p className="error-message">{error}</p> : null}
    </section>
  )
}
