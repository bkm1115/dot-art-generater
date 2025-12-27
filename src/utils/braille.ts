export const BRAILLE_BASE = 0x2800

const DOT_MAP = [
  { dx: 0, dy: 0, bit: 0x01 },
  { dx: 0, dy: 1, bit: 0x02 },
  { dx: 0, dy: 2, bit: 0x04 },
  { dx: 0, dy: 3, bit: 0x40 },
  { dx: 1, dy: 0, bit: 0x08 },
  { dx: 1, dy: 1, bit: 0x10 },
  { dx: 1, dy: 2, bit: 0x20 },
  { dx: 1, dy: 3, bit: 0x80 },
]

export function brailleCharFromPixels(
  pixels: Uint8Array,
  pixelWidth: number,
  baseX: number,
  baseY: number
): string {
  let mask = 0

  for (const dot of DOT_MAP) {
    const x = baseX + dot.dx
    const y = baseY + dot.dy
    const idx = y * pixelWidth + x
    if (pixels[idx] === 1) {
      mask |= dot.bit
    }
  }

  return String.fromCodePoint(BRAILLE_BASE + mask)
}
