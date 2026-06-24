import { createHash, randomInt, randomUUID } from 'crypto'
import path from 'path'
import { GiteaUploaderConfig, PicGoImage } from './types'

const DEFAULT_FILE_NAME_TEMPLATE = '{filename}'
const RANDOM_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz'

export interface BuildRemotePathOptions {
  now?: Date
  uuid?: () => string
  randomString?: (length: number) => string
}

interface OriginalNameParts {
  baseName: string
  extension: string
}

export function createUploadId(): string {
  return randomUUID()
}

export function buildRemotePath(
  config: GiteaUploaderConfig,
  image: PicGoImage,
  content: Buffer = Buffer.alloc(0),
  options: BuildRemotePathOptions = {}
): string {
  const original = getOriginalNameParts(image)
  const template = config.fileNameTemplate || DEFAULT_FILE_NAME_TEMPLATE
  const renderedName = renderFileNameTemplate(template, original.baseName, content, options)
  const safeName = sanitizeTemplatePath(renderedName) || sanitizeTemplatePath(original.baseName) || 'image'
  const fileName = safeName + original.extension
  return [config.pathPrefix, fileName].filter(Boolean).join('/')
}

export function withConflictSuffix(remotePath: string, suffix: string): string {
  const parsed = path.posix.parse(remotePath)
  return path.posix.join(parsed.dir, parsed.name + '_' + suffix + parsed.ext)
}

export function contentHash(buffer: Buffer, length = 8): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, length)
}

export function renderFileNameTemplate(
  template: string,
  originalBaseName: string,
  content: Buffer,
  options: BuildRemotePathOptions = {}
): string {
  const now = options.now ?? new Date()
  const md5 = createHash('md5').update(content).digest('hex')
  const sha256 = createHash('sha256').update(content).digest('hex')
  const uuid = options.uuid ?? randomUUID
  const randomString = options.randomString ?? createRandomString

  return (template || DEFAULT_FILE_NAME_TEMPLATE).replace(
    /\{(YYYY|MM|M|DD|D|HH|H|mm|m|ss|s|timestamp|weekday|md5|sha256|filename|uuid4|uuid|rand(?::(\d+))?)\}/g,
    (match, token: string, randomLength: string | undefined) => {
      switch (token) {
        case 'YYYY':
          return String(now.getFullYear())
        case 'MM':
          return pad2(now.getMonth() + 1)
        case 'M':
          return String(now.getMonth() + 1)
        case 'DD':
          return pad2(now.getDate())
        case 'D':
          return String(now.getDate())
        case 'HH':
          return pad2(now.getHours())
        case 'H':
          return String(now.getHours())
        case 'mm':
          return pad2(now.getMinutes())
        case 'm':
          return String(now.getMinutes())
        case 'ss':
          return pad2(now.getSeconds())
        case 's':
          return String(now.getSeconds())
        case 'timestamp':
          return String(Math.floor(now.getTime() / 1000))
        case 'weekday':
          return String(toIsoWeekday(now))
        case 'md5':
          return md5
        case 'sha256':
          return sha256
        case 'filename':
          return originalBaseName
        case 'uuid4':
        case 'uuid':
          return uuid()
        default:
          if (token.startsWith('rand')) {
            return randomString(normalizeRandomLength(randomLength))
          }
          return match
      }
    }
  )
}

function getOriginalNameParts(image: PicGoImage): OriginalNameParts {
  const fileName = getPicGoFileName(image)
  const extension = path.extname(fileName) || normalizeExt(image.extname) || '.png'
  const baseName = path.basename(fileName, path.extname(fileName) || extension)
  return {
    baseName: baseName || 'image',
    extension
  }
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
  return 'image_' + Date.now() + (extname || '.png')
}

function ensureExtension(fileName: string, extname: unknown): string {
  const parsed = path.parse(fileName)
  const normalizedExt = normalizeExt(extname)
  if (parsed.ext || !normalizedExt) {
    return fileName
  }
  return fileName + normalizedExt
}

function normalizeExt(extname: unknown): string {
  if (typeof extname !== 'string' || extname.length === 0) {
    return ''
  }
  return extname.startsWith('.') ? extname : '.' + extname
}

function sanitizeTemplatePath(value: string): string {
  return value
    .split(/[\\/]+/g)
    .map(sanitizePathSegment)
    .filter(Boolean)
    .join('/')
}

function sanitizePathSegment(segment: string): string {
  return segment
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^\.+$/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 240)
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function toIsoWeekday(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

function normalizeRandomLength(value: string | undefined): number {
  if (!value) {
    return 8
  }
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) {
    return 8
  }
  return Math.min(Math.max(parsed, 1), 128)
}

function createRandomString(length: number): string {
  let output = ''
  for (let index = 0; index < length; index += 1) {
    output += RANDOM_CHARS[randomInt(RANDOM_CHARS.length)]
  }
  return output
}
