export type UploadMode = 'immediate' | 'manual'

export interface PicGoImage {
  fileName?: string
  extname?: string
  filePath?: string
  buffer?: Buffer
  base64Image?: string
  imgUrl?: string
  [key: string]: unknown
}

export interface PicGoContext {
  output: PicGoImage[]
  helper?: {
    uploader?: {
      register: (id: string, uploader: PicGoUploader) => void
    }
  }
  getConfig?: <T = unknown>(key: string) => T | undefined
  saveConfig?: (config: Record<string, unknown>) => void
  emit?: (event: string, payload?: unknown) => void
  log?: {
    info?: (message: string) => void
    success?: (message: string) => void
    warn?: (message: string) => void
    error?: (message: string | Error) => void
  }
  [key: string]: unknown
}

export interface PicGoGuiApi {
  showNotification?: (options: { title: string; body?: string; text?: string }) => void
  showMessageBox?: (options: { title?: string; message: string; type?: string }) => void
}

export interface PicGoUploader {
  name: string
  handle: (ctx: PicGoContext) => Promise<PicGoContext>
  config: (ctx: PicGoContext) => PicGoConfigItem[]
}

export interface PicGoGuiMenuItem {
  label: string
  handle: (ctx: PicGoContext, guiApi?: PicGoGuiApi) => Promise<void>
}

export interface PicGoCommandItem {
  key: string
  name: string
  label: string
  handle: (ctx: PicGoContext, guiApi?: PicGoGuiApi) => Promise<void>
}

export interface PicGoConfigItem {
  name: string
  type: 'input' | 'password' | 'list' | 'confirm'
  alias: string
  default?: string | boolean
  required?: boolean
  choices?: string[]
  message?: string
}

export interface GiteaUploaderConfig {
  serverUrl: string
  token: string
  owner: string
  repo: string
  branch: string
  pathPrefix: string
  uploadMode: UploadMode
  rawUrlTemplate: string
  manualUploadShortcut: string
}

export interface PendingUpload {
  id: string
  importedAt: string
  sourceName: string
  localPath: string
  remotePath: string
  rawUrl: string
}

export interface UploadHistoryItem {
  id: string
  importedAt: string
  uploadedAt: string
  sourceName: string
  remotePath: string
  rawUrl: string
  commitSha?: string
}

export interface PluginState {
  pending: PendingUpload[]
  history: UploadHistoryItem[]
}

export interface GiteaFileChange {
  operation: 'create'
  path: string
  content: string
}

export interface GiteaCommitResult {
  sha?: string
  commit?: {
    sha?: string
  }
  content?: {
    path?: string
  }
}
