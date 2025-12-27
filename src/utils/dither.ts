const DEFAULT_THRESHOLD = 128

export function thresholdToBinary(
  data: Float32Array,
  width: number,
  height: number,
  threshold = DEFAULT_THRESHOLD
): Uint8Array {
  const size = width * height
  const output = new Uint8Array(size)

  for (let i = 0; i < size; i += 1) {
    output[i] = data[i] < threshold ? 1 : 0
  }

  return output
}

export function floydSteinberg(
  data: Float32Array,
  width: number,
  height: number,
  threshold = DEFAULT_THRESHOLD
): Uint8Array {
  const output = new Uint8Array(width * height)
  const buffer = new Float32Array(data)

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x
      const oldValue = buffer[idx]
      const newValue = oldValue < threshold ? 0 : 255
      output[idx] = newValue === 0 ? 1 : 0

      const error = oldValue - newValue

      if (x + 1 < width) {
        buffer[idx + 1] += (error * 7) / 16
      }

      if (y + 1 < height) {
        if (x > 0) {
          buffer[idx + width - 1] += (error * 3) / 16
        }

        buffer[idx + width] += (error * 5) / 16

        if (x + 1 < width) {
          buffer[idx + width + 1] += error / 16
        }
      }
    }
  }

  return output
}
