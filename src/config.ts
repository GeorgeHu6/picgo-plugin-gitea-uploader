import { GiteaUploaderConfig, PicGoConfigItem, PicGoContext, UploadMode } from './types'

const CONFIG_KEY = 'picBed.gitea-uploader'

export const DEFAULT_RAW_URL_TEMPLATE = '{host}/{owner}/{repo}/raw/branch/{branch}/{path}'

export function getConfig(ctx: PicGoContext): GiteaUploaderConfig {
  const raw = ctx.getConfig?.<Partial<GiteaUploaderConfig>>(CONFIG_KEY) ?? {}

  return {
    serverUrl: normalizeHost(raw.serverUrl ?? ''),
    token: raw.token ?? '',
    owner: raw.owner ?? '',
    repo: raw.repo ?? '',
    branch: raw.branch || 'main',
    pathPrefix: trimSlashes(raw.pathPrefix ?? ''),
    uploadMode: normalizeMode(raw.uploadMode),
    rawUrlTemplate: raw.rawUrlTemplate || DEFAULT_RAW_URL_TEMPLATE
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

export function getConfigItems(): PicGoConfigItem[] {
  return [
    {
      name: 'serverUrl',
      type: 'input',
      alias: 'Gitea Server URL',
      required: true,
      message: 'For example: https://gitea.example.com'
    },
    {
      name: 'token',
      type: 'password',
      alias: 'Access Token',
      required: true
    },
    {
      name: 'owner',
      type: 'input',
      alias: 'Repository Owner',
      required: true
    },
    {
      name: 'repo',
      type: 'input',
      alias: 'Repository Name',
      required: true
    },
    {
      name: 'branch',
      type: 'input',
      alias: 'Branch',
      default: 'main',
      required: true
    },
    {
      name: 'pathPrefix',
      type: 'input',
      alias: 'Path Prefix',
      default: ''
    },
    {
      name: 'uploadMode',
      type: 'list',
      alias: 'Upload Mode',
      default: 'immediate',
      choices: ['immediate', 'manual']
    },
    {
      name: 'rawUrlTemplate',
      type: 'input',
      alias: 'Raw URL Template',
      default: DEFAULT_RAW_URL_TEMPLATE
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
  return value === 'manual' ? 'manual' : 'immediate'
}
