import { brailleCharFromPixels } from './braille'

export type TextFormatter = {
  id: string
  label: string
  cellWidth: number
  cellHeight: number
  format: (pixels: Uint8Array, cols: number, rows: number) => string
}

export const brailleFormatter: TextFormatter = {
  id: 'braille',
  label: 'Braille',
  cellWidth: 2,
  cellHeight: 4,
  format: (pixels, cols, rows) => {
    const pixelWidth = cols * 2
    const lines: string[] = []

    for (let row = 0; row < rows; row += 1) {
      let line = ''
      const baseY = row * 4

      for (let col = 0; col < cols; col += 1) {
        const baseX = col * 2
        line += brailleCharFromPixels(pixels, pixelWidth, baseX, baseY)
      }

      lines.push(line)
    }

    return lines.join('\n')
  },
}

export const DEFAULT_FORMATTER = brailleFormatter
