import { describe, expect, it } from 'vitest'
import { DEFAULT_RAW_URL_TEMPLATE, getConfig, renderRawUrl } from '../src/config'
import { GiteaUploaderConfig } from '../src/types'

const baseConfig: GiteaUploaderConfig = {
  serverUrl: 'https://gitea.example.com',
  token: 'token',
  owner: 'me',
  repo: 'images',
  branch: 'main',
  pathPrefix: '',
  uploadMode: 'immediate',
  rawUrlTemplate: DEFAULT_RAW_URL_TEMPLATE,
  manualUploadShortcut: ''
}

describe('renderRawUrl', () => {
  it('renders the default Gitea raw URL', () => {
    expect(renderRawUrl(baseConfig, 'foo/bar.png')).toBe(
      'https://gitea.example.com/me/images/raw/branch/main/foo/bar.png'
    )
  })

  it('renders custom templates with encoded values', () => {
    expect(
      renderRawUrl(
        {
          ...baseConfig,
          owner: 'team name',
          branch: 'feat/raw urls',
          rawUrlTemplate: 'https://cdn.example.com/{owner}/{branch}/{path}'
        },
        'a b/c.png'
      )
    ).toBe('https://cdn.example.com/team%20name/feat%2Fraw%20urls/a%20b/c.png')
  })
})


describe('getConfig', () => {
  it('reads and trims manualUploadShortcut', () => {
    const config = getConfig({
      output: [],
      getConfig: () => ({
        serverUrl: 'https://gitea.example.com/',
        token: 'token',
        owner: 'me',
        repo: 'images',
        manualUploadShortcut: ' Ctrl+Shift+G '
      })
    })

    expect(config.serverUrl).toBe('https://gitea.example.com')
    expect(config.manualUploadShortcut).toBe('Ctrl+Shift+G')
  })
})
