/**
 * Compress images to data URLs for Firestore (Spark plan — no Cloud Storage).
 * Keeps avatars/logos small enough for users/{uid} and workspace_settings docs.
 */

export type CompressImageOptions = {
  maxEdgePx: number
  maxBytes: number
  /** JPEG is smaller; WebP when supported. */
  preferWebp?: boolean
}

const DEFAULT_OPTS: CompressImageOptions = {
  maxEdgePx: 256,
  maxBytes: 90_000,
  preferWebp: true,
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read image file.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image.'))
    img.src = src
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

/**
 * Resize and compress an image file to a data URL under maxBytes.
 * Small SVGs are stored as-is when under the byte limit.
 */
export async function fileToCompressedDataUrl(
  file: File,
  options: Partial<CompressImageOptions> = {},
): Promise<string> {
  const opts = { ...DEFAULT_OPTS, ...options }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  if (file.type === 'image/svg+xml') {
    if (file.size > opts.maxBytes) {
      throw new Error(
        `Logo file is too large. Use a simpler SVG under ${Math.round(opts.maxBytes / 1024)} KB, or use PNG/JPG.`,
      )
    }
    return readFileAsDataUrl(file)
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    const scale = Math.min(1, opts.maxEdgePx / Math.max(img.width, img.height, 1))
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not process image.')
    ctx.drawImage(img, 0, 0, w, h)

    const mime = 'image/jpeg'

    let quality = 0.88
    let blob = await canvasToBlob(canvas, mime, quality)
    if (!blob) throw new Error('Could not compress image.')

    while (blob.size > opts.maxBytes && quality > 0.45) {
      quality -= 0.08
      blob = (await canvasToBlob(canvas, mime, quality)) ?? blob
    }

    if (blob.size > opts.maxBytes) {
      throw new Error(
        `Image is still too large after compression. Try a smaller photo (under ${Math.round(opts.maxBytes / 1024)} KB).`,
      )
    }

    return readFileAsDataUrl(new File([blob], 'photo', { type: mime }))
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
