import { describe, expect, it } from 'vitest'
import { buildRemotePath, withConflictSuffix } from '../src/path'
import { GiteaUploaderConfig } from '../src/types'

const config: GiteaUploaderConfig = {
  serverUrl: 'https://gitea.example.com',
  token: 'token',
  owner: 'me',
  repo: 'images',
  branch: 'main',
  pathPrefix: 'assets/picgo',
  uploadMode: 'immediate',
  rawUrlTemplate: ''
}

describe('path helpers', () => {
  it('uses PicGo fileName and pathPrefix', () => {
    expect(buildRemotePath(config, { fileName: 'hello world', extname: '.PNG' })).toBe('assets/picgo/hello-world.png')
  })

  it('adds conflict suffix before extension', () => {
    expect(withConflictSuffix('assets/picgo/hello.png', 'abc123')).toBe('assets/picgo/hello_abc123.png')
  })
})
