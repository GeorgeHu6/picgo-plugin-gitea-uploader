import { GiteaCommitResult, GiteaFileChange, GiteaUploaderConfig } from './types'

interface RequestOptions {
  method?: string
  body?: unknown
}

export class GiteaClient {
  constructor(private readonly config: GiteaUploaderConfig) {}

  async pathExists(remotePath: string): Promise<boolean> {
    const url = this.apiUrl(`/repos/${this.owner}/${this.repo}/contents/${encodePath(remotePath)}`)
    url.searchParams.set('ref', this.config.branch)
    const response = await fetch(url, {
      headers: this.headers()
    })

    if (response.status === 404) {
      return false
    }
    if (!response.ok) {
      throw await toError(response, `Failed to check remote path ${remotePath}`)
    }
    return true
  }

  async createFile(remotePath: string, content: Buffer, message: string): Promise<GiteaCommitResult> {
    return this.request<GiteaCommitResult>(`/repos/${this.owner}/${this.repo}/contents/${encodePath(remotePath)}`, {
      method: 'POST',
      body: {
        branch: this.config.branch,
        message,
        content: content.toString('base64')
      }
    })
  }

  async changeFiles(files: GiteaFileChange[], message: string): Promise<GiteaCommitResult> {
    return this.request<GiteaCommitResult>(`/repos/${this.owner}/${this.repo}/contents`, {
      method: 'POST',
      body: {
        branch: this.config.branch,
        message,
        files
      }
    })
  }

  private async request<T>(pathname: string, options: RequestOptions): Promise<T> {
    const response = await fetch(this.apiUrl(pathname), {
      method: options.method ?? 'GET',
      headers: this.headers(true),
      body: options.body ? JSON.stringify(options.body) : undefined
    })

    if (!response.ok) {
      throw await toError(response, `Gitea API request failed: ${options.method ?? 'GET'} ${pathname}`)
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json() as Promise<T>
  }

  private apiUrl(pathname: string): URL {
    return new URL(`/api/v1${pathname}`, `${this.config.serverUrl}/`)
  }

  private headers(json = false): HeadersInit {
    return {
      Authorization: `token ${this.config.token}`,
      Accept: 'application/json',
      ...(json ? { 'Content-Type': 'application/json' } : {})
    }
  }

  private get owner(): string {
    return encodeURIComponent(this.config.owner)
  }

  private get repo(): string {
    return encodeURIComponent(this.config.repo)
  }
}

export function isConflict(error: unknown): boolean {
  return error instanceof GiteaApiError && error.status === 409
}

export class GiteaApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: string
  ) {
    super(`${message}: HTTP ${status}${details ? ` - ${details}` : ''}`)
    this.name = 'GiteaApiError'
  }
}

async function toError(response: Response, message: string): Promise<GiteaApiError> {
  const details = await response.text().catch(() => '')
  return new GiteaApiError(message, response.status, details)
}

function encodePath(remotePath: string): string {
  return remotePath.split('/').map(encodeURIComponent).join('/')
}
