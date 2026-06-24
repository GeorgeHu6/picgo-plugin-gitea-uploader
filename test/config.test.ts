import { describe, expect, it } from 'vitest'
import { DEFAULT_FILE_NAME_TEMPLATE, DEFAULT_MANUAL_UPLOAD_SHORTCUT, DEFAULT_RAW_URL_TEMPLATE, getConfig, renderRawUrl } from '../src/config'
import { GiteaUploaderConfig } from '../src/types'

const baseConfig: GiteaUploaderConfig = {
  serverUrl: 'https://gitea.example.com',
  token: 'token',
  owner: 'me',
  repo: 'images',
  branch: 'main',
  pathPrefix: '',
  fileNameTemplate: DEFAULT_FILE_NAME_TEMPLATE,
  uploadMode: 'immediate',
  rawUrlTemplate: DEFAULT_RAW_URL_TEMPLATE,
  manualUploadShortcut: DEFAULT_MANUAL_UPLOAD_SHORTCUT
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

  it('normalizes localized manual upload mode labels', () => {
    const config = getConfig({
      output: [],
      getConfig: () => ({
        uploadMode: '手动批量上传'
      })
    })

    expect(config.uploadMode).toBe('manual')
  })

  it('uses the default fileNameTemplate', () => {
    const config = getConfig({
      output: [],
      getConfig: () => ({})
    })

    expect(config.fileNameTemplate).toBe(DEFAULT_FILE_NAME_TEMPLATE)
  })

  it('uses the default manualUploadShortcut so PicGo can expose the command', () => {
    const config = getConfig({
      output: [],
      getConfig: () => ({})
    })

    expect(config.manualUploadShortcut).toBe(DEFAULT_MANUAL_UPLOAD_SHORTCUT)
  })
})
