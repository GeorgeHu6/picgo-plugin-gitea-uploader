import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { PendingUpload, PluginState, UploadHistoryItem } from './types'

const STATE_DIR = path.join(os.homedir(), '.picgo-plugin-gitea-uploader')
const STATE_FILE = path.join(STATE_DIR, 'state.json')
const PENDING_DIR = path.join(STATE_DIR, 'pending')

export async function loadState(): Promise<PluginState> {
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<PluginState>
    return {
      pending: Array.isArray(parsed.pending) ? parsed.pending : [],
      history: Array.isArray(parsed.history) ? parsed.history : []
    }
  } catch (error) {
    if (isNotFound(error)) {
      return { pending: [], history: [] }
    }
    throw error
  }
}

export async function saveState(state: PluginState): Promise<void> {
  await fs.mkdir(STATE_DIR, { recursive: true })
  await fs.writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

export async function savePendingContent(id: string, fileName: string, content: Buffer): Promise<string> {
  await fs.mkdir(PENDING_DIR, { recursive: true })
  const safeExt = path.extname(fileName).replace(/[^\w.]/g, '') || '.bin'
  const localPath = path.join(PENDING_DIR, `${id}${safeExt}`)
  await fs.writeFile(localPath, content)
  return localPath
}

export async function readPendingContent(item: PendingUpload): Promise<Buffer> {
  return fs.readFile(item.localPath)
}

export async function removePendingContent(item: PendingUpload): Promise<void> {
  try {
    await fs.unlink(item.localPath)
  } catch (error) {
    if (!isNotFound(error)) {
      throw error
    }
  }
}

export function addHistory(state: PluginState, item: UploadHistoryItem): PluginState {
  return {
    pending: state.pending,
    history: [item, ...state.history].slice(0, 1000)
  }
}

function isNotFound(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
}
