import { useState } from 'react'
type PreviewProps = {
  text: string
  hasImage: boolean
  onCopy: () => Promise<boolean>
}

export function Preview({ text, hasImage, onCopy }: PreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text) return
    const success = await onCopy()
    if (success) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <section className="panel preview">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Step 3</p>
          <h2>점자 아트 결과</h2>
          <p className="panel-subtitle">
            프리뷰는 모노스페이스로 보여줘요. 인스타에서는 폰트 차이가
            있을 수 있어요.
          </p>
        </div>
      </div>

      <div className="preview-box">
        {hasImage ? (
          <pre>{text}</pre>
        ) : (
          <div className="preview-placeholder">
            <p>이미지를 올리면 여기에 결과가 나타나요.</p>
            <p>복사 버튼으로 바로 인스타 댓글에 붙여넣을 수 있어요.</p>
          </div>
        )}
      </div>

      <div className="preview-actions">
        <button
          type="button"
          className="button primary"
          onClick={handleCopy}
          disabled={!text}
        >
          {copied ? '복사 완료!' : 'Copy to Clipboard'}
        </button>
      </div>
    </section>
  )
}
