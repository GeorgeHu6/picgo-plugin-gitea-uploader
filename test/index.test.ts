import { describe, expect, it } from 'vitest'
import plugin from '../src/index'

describe('plugin commands', () => {
  it('always exposes the manual upload shortcut command', () => {
    const instance = plugin({
      output: [],
      getConfig: () => ({})
    })

    const commands = instance.commands({
      output: [],
      getConfig: () => ({})
    })

    expect(commands).toHaveLength(1)
    expect(commands[0]).toMatchObject({
      name: 'manualUpload',
      label: 'Gitea: Upload Pending Images',
      key: 'Ctrl+Shift+G'
    })
  })
})
