let sharedCanvas: HTMLCanvasElement | null = null
let sharedContext: CanvasRenderingContext2D | null = null

export async function loadImageFromFile(file: File): Promise<{
  image: HTMLImageElement
  url: string
}> {
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.decoding = 'async'
  image.src = url

  if ('decode' in image) {
    try {
      await image.decode()
      return { image, url }
    } catch {
      // Fallback to onload below.
    }
  }

  if (image.complete && image.naturalWidth > 0) {
    return { image, url }
  }

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Image load failed'))
  })

  return { image, url }
}

export function drawImageToImageData(
  image: HTMLImageElement,
  width: number,
  height: number
): ImageData {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas')
  }

  if (!sharedContext) {
    sharedContext = sharedCanvas.getContext('2d', {
      willReadFrequently: true,
    })
  }

  if (!sharedContext) {
    throw new Error('Canvas context not available')
  }

  if (sharedCanvas.width !== width) {
    sharedCanvas.width = width
  }

  if (sharedCanvas.height !== height) {
    sharedCanvas.height = height
  }

  sharedContext.clearRect(0, 0, width, height)
  sharedContext.fillStyle = '#ffffff'
  sharedContext.fillRect(0, 0, width, height)
  sharedContext.imageSmoothingEnabled = true
  sharedContext.imageSmoothingQuality = 'high'
  sharedContext.drawImage(image, 0, 0, width, height)

  return sharedContext.getImageData(0, 0, width, height)
}

export function imageDataToLuminance(
  imageData: ImageData,
  brightness: number,
  contrast: number
): Float32Array {
  const { data, width, height } = imageData
  const output = new Float32Array(width * height)

  const brightnessOffset = brightness * 2.55
  const contrastValue = contrast * 2.55
  const contrastFactor =
    (259 * (contrastValue + 255)) / (255 * (259 - contrastValue))

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    let value = contrastFactor * (luminance - 128) + 128 + brightnessOffset

    if (value < 0) value = 0
    if (value > 255) value = 255

    output[i / 4] = value
  }

  return output
}
