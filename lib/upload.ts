import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const UPLOAD_URL_PREFIX = '/uploads/'

// Saves an uploaded image to public/uploads and returns its public URL path.
export async function saveUploadedImage(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true })
  const ext = path.extname(file.name).slice(0, 10)
  const filename = `${crypto.randomUUID()}${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOAD_DIR, filename), buffer)
  return `${UPLOAD_URL_PREFIX}${filename}`
}

// Removes a previously uploaded image. No-ops for URLs we didn't generate
// (seed assets under /public, external URLs) so we never touch those files.
export async function deleteUploadedImage(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith(UPLOAD_URL_PREFIX)) return
  const filename = url.slice(UPLOAD_URL_PREFIX.length)
  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {})
}
