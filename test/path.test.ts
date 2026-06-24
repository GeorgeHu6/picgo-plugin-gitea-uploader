import { createHash } from 'crypto'
import { describe, expect, it } from 'vitest'
import { buildRemotePath, renderFileNameTemplate, withConflictSuffix } from '../src/path'
import { GiteaUploaderConfig } from '../src/types'

const config: GiteaUploaderConfig = {
  serverUrl: 'https://gitea.example.com',
  token: 'token',
  owner: 'me',
  repo: 'images',
  branch: 'main',
  pathPrefix: 'assets/picgo',
  fileNameTemplate: '{filename}',
  uploadMode: 'immediate',
  rawUrlTemplate: '',
  manualUploadShortcut: ''
}

const contentBuffer = Buffer.from('image-content')

describe('path helpers', () => {
  it('uses original file name by default with pathPrefix', () => {
    expect(buildRemotePath(config, { fileName: 'hello world', extname: '.PNG' }, contentBuffer)).toBe(
      'assets/picgo/hello-world.PNG'
    )
  })

  it('preserves non-ASCII file names', () => {
    expect(buildRemotePath(config, { fileName: '乔治头像_阅读创新点.jpg' }, contentBuffer)).toBe(
      'assets/picgo/乔治头像_阅读创新点.jpg'
    )
  })

  it('renders date and time tokens', () => {
    const now = new Date(2026, 5, 24, 3, 4, 5)
    const remotePath = buildRemotePath(
      {
        ...config,
        fileNameTemplate: '{YYYY}-{MM}-{M}-{DD}-{D}-{HH}-{H}-{mm}-{m}-{ss}-{s}-{timestamp}-{weekday}'
      },
      { fileName: 'photo.jpg' },
      contentBuffer,
      { now }
    )

    expect(remotePath).toBe('assets/picgo/2026-06-6-24-24-03-3-04-4-05-5-' + Math.floor(now.getTime() / 1000) + '-3.jpg')
  })

  it('renders hash, filename, uuid4, and fixed-length random tokens', () => {
    const md5 = createHash('md5').update(contentBuffer).digest('hex')
    const sha256 = createHash('sha256').update(contentBuffer).digest('hex')

    const remotePath = buildRemotePath(
      {
        ...config,
        fileNameTemplate: '{filename}_{md5}_{sha256}_{uuid4}_{rand:6}'
      },
      { fileName: 'my photo.jpg' },
      contentBuffer,
      {
        uuid: () => '00000000-0000-4000-8000-000000000000',
        randomString: (length) => 'a'.repeat(length)
      }
    )

    expect(remotePath).toBe(
      'assets/picgo/my-photo_' + md5 + '_' + sha256 + '_00000000-0000-4000-8000-000000000000_aaaaaa.jpg'
    )
  })

  it('allows template subdirectories and still preserves the original extension', () => {
    const remotePath = buildRemotePath(
      { ...config, fileNameTemplate: '{YYYY}/{MM}/{filename}_{rand:4}' },
      { fileName: 'avatar.JPEG' },
      contentBuffer,
      {
        now: new Date(2026, 5, 24, 3, 4, 5),
        randomString: (length) => 'z'.repeat(length)
      }
    )

    expect(remotePath).toBe('assets/picgo/2026/06/avatar_zzzz.JPEG')
  })

  it('uses an 8-character random token by default', () => {
    expect(renderFileNameTemplate('{rand}', 'photo', contentBuffer, { randomString: (length) => 'b'.repeat(length) })).toBe(
      'bbbbbbbb'
    )
  })

  it('adds conflict suffix before extension', () => {
    expect(withConflictSuffix('assets/picgo/hello.png', 'abc123')).toBe('assets/picgo/hello_abc123.png')
  })
})
