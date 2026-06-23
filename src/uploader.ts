import fs from 'fs/promises'
import { getConfig, renderRawUrl, validateConfig } from './config'
import { GiteaClient, isConflict } from './gitea'
import { buildRemotePath, contentHash, createUploadId, withConflictSuffix } from './path'
import {
  addHistory,
  loadState,
  readPendingContent,
  removePendingContent,
  savePendingContent,
  saveState
} from './state'
import { GiteaCommitResult, GiteaFileChange, GiteaUploaderConfig, PicGoContext, PicGoImage, PluginState } from './types'

export async function handleUpload(ctx: PicGoContext): Promise<PicGoContext> {
  const config = getConfig(ctx)
  validateConfig(config)
  const state = await loadState()
  const client = new GiteaClient(config)

  for (const image of ctx.output) {
    const content = await getImageContent(image)
    if (config.uploadMode === 'manual') {
      await queueImage(config, state, image, content)
    } else {
      await uploadImage(config, client, state, image, content)
    }
  }

  await saveState(state)
  return ctx
}

export async function manualUpload(ctx: PicGoContext): Promise<void> {
  const config = getConfig(ctx)
  validateConfig(config)
  const state = await loadState()

  if (state.pending.length === 0) {
    ctx.log?.info?.('No pending Gitea uploads.')
    return
  }

  const client = new GiteaClient(config)
  const now = new Date().toISOString()
  const pending = [...state.pending]
  const files: GiteaFileChange[] = []

  for (const item of pending) {
    const content = await readPendingContent(item)
    const remotePath = await resolveAvailablePath(client, item.remotePath, content)
    if (remotePath !== item.remotePath) {
      item.remotePath = remotePath
      item.rawUrl = renderRawUrl(config, remotePath)
    }
    files.push({
      operation: 'create',
      path: item.remotePath,
      content: content.toString('base64')
    })
  }

  const result = await client.changeFiles(files, `Upload ${files.length} image(s) via PicGo`)
  state.pending = []

  for (const item of pending) {
    state.history.unshift({
      id: item.id,
      importedAt: item.importedAt,
      uploadedAt: now,
      sourceName: item.sourceName,
      remotePath: item.remotePath,
      rawUrl: item.rawUrl,
      commitSha: getCommitSha(result)
    })
    await removePendingContent(item)
  }

  state.history = state.history.slice(0, 1000)
  await saveState(state)
  ctx.log?.success?.(`Uploaded ${files.length} pending image(s) to Gitea.`)
}

async function uploadImage(
  config: GiteaUploaderConfig,
  client: GiteaClient,
  state: PluginState,
  image: PicGoImage,
  content: Buffer
): Promise<void> {
  const importedAt = new Date().toISOString()
  let remotePath = await resolveAvailablePath(client, buildRemotePath(config, image), content)
  let result: GiteaCommitResult

  try {
    result = await client.createFile(remotePath, content, `Upload ${remotePath} via PicGo`)
  } catch (error) {
    if (!isConflict(error)) {
      throw error
    }
    remotePath = withConflictSuffix(remotePath, contentHash(Buffer.concat([content, Buffer.from(Date.now().toString())]), 6))
    result = await client.createFile(remotePath, content, `Upload ${remotePath} via PicGo`)
  }

  const rawUrl = renderRawUrl(config, remotePath)
  image.imgUrl = rawUrl

  const next = addHistory(state, {
    id: createUploadId(),
    importedAt,
    uploadedAt: new Date().toISOString(),
    sourceName: getSourceName(image),
    remotePath,
    rawUrl,
    commitSha: getCommitSha(result)
  })
  state.history = next.history
}

async function queueImage(config: GiteaUploaderConfig, state: PluginState, image: PicGoImage, content: Buffer): Promise<void> {
  const id = createUploadId()
  const remotePath = avoidLocalPendingConflict(state, buildRemotePath(config, image), content)
  const rawUrl = renderRawUrl(config, remotePath)
  const localPath = await savePendingContent(id, remotePath, content)

  image.imgUrl = rawUrl
  state.pending.push({
    id,
    importedAt: new Date().toISOString(),
    sourceName: getSourceName(image),
    localPath,
    remotePath,
    rawUrl
  })
}

async function resolveAvailablePath(client: GiteaClient, desiredPath: string, content: Buffer): Promise<string> {
  if (!(await client.pathExists(desiredPath))) {
    return desiredPath
  }

  const hash = contentHash(content, 8)
  let candidate = withConflictSuffix(desiredPath, hash)
  let index = 1

  while (await client.pathExists(candidate)) {
    candidate = withConflictSuffix(desiredPath, `${hash}-${index}`)
    index += 1
  }

  return candidate
}

function avoidLocalPendingConflict(state: PluginState, desiredPath: string, content: Buffer): string {
  const used = new Set(state.pending.map((item) => item.remotePath))
  if (!used.has(desiredPath)) {
    return desiredPath
  }

  const hash = contentHash(content, 8)
  let candidate = withConflictSuffix(desiredPath, hash)
  let index = 1

  while (used.has(candidate)) {
    candidate = withConflictSuffix(desiredPath, `${hash}-${index}`)
    index += 1
  }

  return candidate
}

async function getImageContent(image: PicGoImage): Promise<Buffer> {
  if (Buffer.isBuffer(image.buffer)) {
    return image.buffer
  }

  if (typeof image.base64Image === 'string' && image.base64Image.length > 0) {
    return Buffer.from(stripDataUrlPrefix(image.base64Image), 'base64')
  }

  if (typeof image.filePath === 'string' && image.filePath.length > 0) {
    return fs.readFile(image.filePath)
  }

  throw new Error('PicGo image does not contain buffer, base64Image, or filePath.')
}

function stripDataUrlPrefix(value: string): string {
  return value.replace(/^data:[^;]+;base64,/, '')
}

function getSourceName(image: PicGoImage): string {
  if (typeof image.fileName === 'string' && image.fileName) {
    return image.fileName
  }
  if (typeof image.filePath === 'string' && image.filePath) {
    return image.filePath
  }
  return 'image'
}

function getCommitSha(result: GiteaCommitResult): string | undefined {
  return result.commit?.sha ?? result.sha
}
