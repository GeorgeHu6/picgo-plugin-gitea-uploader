import { translate } from './i18n'
import { GiteaUploaderConfig, PicGoConfigItem, PicGoContext, UploadMode } from './types'

const CONFIG_KEY = 'picBed.gitea-uploader'

export const DEFAULT_RAW_URL_TEMPLATE = '{host}/{owner}/{repo}/raw/branch/{branch}/{path}'
export const DEFAULT_MANUAL_UPLOAD_SHORTCUT = 'Ctrl+Shift+G'
export const DEFAULT_FILE_NAME_TEMPLATE = '{filename}'

export function getConfig(ctx: PicGoContext): GiteaUploaderConfig {
  const raw = ctx.getConfig?.<Partial<GiteaUploaderConfig>>(CONFIG_KEY) ?? {}

  return {
    serverUrl: normalizeHost(raw.serverUrl ?? ''),
    token: raw.token ?? '',
    owner: raw.owner ?? '',
    repo: raw.repo ?? '',
    branch: raw.branch || 'main',
    pathPrefix: trimSlashes(raw.pathPrefix ?? ''),
    fileNameTemplate: normalizeFileNameTemplate(raw.fileNameTemplate),
    uploadMode: normalizeMode(raw.uploadMode),
    rawUrlTemplate: raw.rawUrlTemplate || DEFAULT_RAW_URL_TEMPLATE,
    manualUploadShortcut: normalizeShortcut(raw.manualUploadShortcut) || DEFAULT_MANUAL_UPLOAD_SHORTCUT
  }
}

export function validateConfig(config: GiteaUploaderConfig): void {
  const missing = [
    ['serverUrl', config.serverUrl],
    ['token', config.token],
    ['owner', config.owner],
    ['repo', config.repo]
  ].filter(([, value]) => !value)

  if (missing.length > 0) {
    throw new Error(`Missing required Gitea uploader config: ${missing.map(([key]) => key).join(', ')}`)
  }
}

export function getConfigItems(ctx?: PicGoContext): PicGoConfigItem[] {
  return [
    {
      name: 'serverUrl',
      type: 'input',
      alias: translate(ctx, 'GITEA_CONFIG_SERVER_URL'),
      required: true,
      message: translate(ctx, 'GITEA_CONFIG_SERVER_URL_MESSAGE')
    },
    {
      name: 'token',
      type: 'password',
      alias: translate(ctx, 'GITEA_CONFIG_TOKEN'),
      required: true
    },
    {
      name: 'owner',
      type: 'input',
      alias: translate(ctx, 'GITEA_CONFIG_OWNER'),
      required: true
    },
    {
      name: 'repo',
      type: 'input',
      alias: translate(ctx, 'GITEA_CONFIG_REPO'),
      required: true
    },
    {
      name: 'branch',
      type: 'input',
      alias: translate(ctx, 'GITEA_CONFIG_BRANCH'),
      default: 'main',
      required: true
    },
    {
      name: 'pathPrefix',
      type: 'input',
      alias: translate(ctx, 'GITEA_CONFIG_PATH_PREFIX'),
      default: ''
    },
    {
      name: 'fileNameTemplate',
      type: 'input',
      alias: translate(ctx, 'GITEA_CONFIG_FILE_NAME_TEMPLATE'),
      default: DEFAULT_FILE_NAME_TEMPLATE,
      message: translate(ctx, 'GITEA_CONFIG_FILE_NAME_TEMPLATE_MESSAGE')
    },
    {
      name: 'uploadMode',
      type: 'list',
      alias: translate(ctx, 'GITEA_CONFIG_UPLOAD_MODE'),
      default: translate(ctx, 'GITEA_UPLOAD_MODE_IMMEDIATE'),
      choices: [translate(ctx, 'GITEA_UPLOAD_MODE_IMMEDIATE'), translate(ctx, 'GITEA_UPLOAD_MODE_MANUAL')]
    },
    {
      name: 'rawUrlTemplate',
      type: 'input',
      alias: translate(ctx, 'GITEA_CONFIG_RAW_URL_TEMPLATE'),
      default: DEFAULT_RAW_URL_TEMPLATE
    },
    {
      name: 'manualUploadShortcut',
      type: 'input',
      alias: translate(ctx, 'GITEA_CONFIG_MANUAL_UPLOAD_SHORTCUT'),
      default: DEFAULT_MANUAL_UPLOAD_SHORTCUT,
      message: translate(ctx, 'GITEA_CONFIG_MANUAL_UPLOAD_SHORTCUT_MESSAGE')
    }
  ]
}

export function renderRawUrl(config: GiteaUploaderConfig, remotePath: string): string {
  const values: Record<string, string> = {
    host: config.serverUrl,
    owner: encodeURIComponent(config.owner),
    repo: encodeURIComponent(config.repo),
    branch: encodeURIComponent(config.branch),
    path: remotePath.split('/').map(encodeURIComponent).join('/')
  }

  return config.rawUrlTemplate.replace(/\{(host|owner|repo|branch|path)\}/g, (_, key: string) => values[key])
}

function normalizeHost(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function trimSlashes(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, '')
}

function normalizeMode(value: unknown): UploadMode {
  if (typeof value !== 'string') {
    return 'immediate'
  }

  const normalized = value.trim().toLowerCase()
  const manualLabels = new Set([
    'manual',
    'manual batch upload',
    '手动批量上传',
    '手動批次上傳'
  ])

  return manualLabels.has(normalized) ? 'manual' : 'immediate'
}

function normalizeShortcut(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeFileNameTemplate(value: unknown): string {
  if (typeof value !== 'string') {
    return DEFAULT_FILE_NAME_TEMPLATE
  }
  return value.trim() || DEFAULT_FILE_NAME_TEMPLATE
}
