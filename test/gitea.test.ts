import { afterEach, describe, expect, it, vi } from 'vitest'
import { GiteaClient } from '../src/gitea'
import { GiteaUploaderConfig } from '../src/types'

const config: GiteaUploaderConfig = {
  serverUrl: 'https://gitea.example.com',
  token: 'secret',
  owner: 'me',
  repo: 'images',
  branch: 'main',
  pathPrefix: '',
  fileNameTemplate: '{filename}',
  uploadMode: 'immediate',
  rawUrlTemplate: '',
  manualUploadShortcut: ''
}

describe('GiteaClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a single file with base64 content', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ commit: { sha: 'abc' } }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await new GiteaClient(config).createFile('foo/bar.png', Buffer.from('image'), 'Upload')

    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://gitea.example.com/api/v1/repos/me/images/contents/foo/bar.png'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          branch: 'main',
          message: 'Upload',
          content: Buffer.from('image').toString('base64')
        })
      })
    )
  })

  it('submits multi-file changes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ sha: 'abc' }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    await new GiteaClient(config).changeFiles(
      [{ operation: 'create', path: 'a.png', content: 'YQ==' }],
      'Batch upload'
    )

    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://gitea.example.com/api/v1/repos/me/images/contents'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          branch: 'main',
          message: 'Batch upload',
          files: [{ operation: 'create', path: 'a.png', content: 'YQ==' }]
        })
      })
    )
  })
})
