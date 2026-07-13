import path from 'path'
import { put, del } from '@vercel/blob'

// Saves an uploaded image to Vercel Blob storage and returns its public URL.
export async function saveUploadedImage(file: File): Promise<string> {
  const ext = path.extname(file.name).slice(0, 10)
  const filename = `${crypto.randomUUID()}${ext}`
  const blob = await put(filename, file, { access: 'public' })
  return blob.url
}

// Removes a previously uploaded image. No-ops for URLs we didn't generate
// (seed assets under /public, external URLs) so we never touch those files.
export async function deleteUploadedImage(url: string | null | undefined): Promise<void> {
  if (!url || !url.includes('.public.blob.vercel-storage.com/')) return
  await del(url).catch(() => {})
}
