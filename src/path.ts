import { createHash, randomUUID } from 'crypto'
import path from 'path'
import { GiteaUploaderConfig, PicGoImage } from './types'

export function createUploadId(): string {
  return randomUUID()
}

export function buildRemotePath(config: GiteaUploaderConfig, image: PicGoImage): string {
  const fileName = sanitizeFileName(getPicGoFileName(image))
  return [config.pathPrefix, fileName].filter(Boolean).join('/')
}

export function withConflictSuffix(remotePath: string, suffix: string): string {
  const parsed = path.posix.parse(remotePath)
  return path.posix.join(parsed.dir, `${parsed.name}_${suffix}${parsed.ext}`)
}

export function contentHash(buffer: Buffer, length = 8): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, length)
}

function getPicGoFileName(image: PicGoImage): string {
  const fileName = typeof image.fileName === 'string' ? image.fileName : ''
  if (fileName) {
    return ensureExtension(fileName, image.extname)
  }

  const filePath = typeof image.filePath === 'string' ? image.filePath : ''
  if (filePath) {
    return ensureExtension(path.basename(filePath), image.extname)
  }

  const extname = normalizeExt(image.extname)
  return `image_${Date.now()}${extname || '.png'}`
}

function ensureExtension(fileName: string, extname: unknown): string {
  const parsed = path.parse(fileName)
  const normalizedExt = normalizeExt(extname)
  if (parsed.ext || !normalizedExt) {
    return fileName
  }
  return `${fileName}${normalizedExt}`
}

function normalizeExt(extname: unknown): string {
  if (typeof extname !== 'string' || extname.length === 0) {
    return ''
  }
  return extname.startsWith('.') ? extname : `.${extname}`
}

function sanitizeFileName(fileName: string): string {
  const ext = path.extname(fileName)
  const base = path.basename(fileName, ext)
  const cleanBase = base
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)

  return `${cleanBase || 'image'}${ext.toLowerCase()}`
}
