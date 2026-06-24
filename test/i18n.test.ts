import { describe, expect, it, vi } from 'vitest'
import { getConfigItems } from '../src/config'
import plugin from '../src/index'
import { LOCALE_EN, LOCALE_ZH_CN, registerLocales, translate } from '../src/i18n'
import { PicGoContext } from '../src/types'

function createI18nContext(locale: Record<string, string>): PicGoContext {
  return {
    output: [],
    i18n: {
      addLocale: vi.fn(() => true),
      translate: vi.fn((key: string) => locale[key] ?? key)
    },
    getConfig: () => ({})
  }
}

describe('i18n', () => {
  it('registers English, Simplified Chinese, and Traditional Chinese locales', () => {
    const ctx = createI18nContext(LOCALE_EN)

    registerLocales(ctx)

    expect(ctx.i18n?.addLocale).toHaveBeenCalledWith('en', expect.any(Object))
    expect(ctx.i18n?.addLocale).toHaveBeenCalledWith('zh-CN', expect.any(Object))
    expect(ctx.i18n?.addLocale).toHaveBeenCalledWith('zh-TW', expect.any(Object))
  })

  it('translates config aliases in Simplified Chinese', () => {
    const ctx = createI18nContext(LOCALE_ZH_CN)
    const items = getConfigItems(ctx)

    expect(items.find((item) => item.name === 'serverUrl')?.alias).toBe('Gitea 服务器地址')
    expect(items.find((item) => item.name === 'fileNameTemplate')?.alias).toBe('文件命名模板')
    expect(items.find((item) => item.name === 'manualUploadShortcut')?.alias).toBe('手动上传快捷键')
  })

  it('translates upload mode choices in Simplified Chinese', () => {
    const ctx = createI18nContext(LOCALE_ZH_CN)
    const uploadMode = getConfigItems(ctx).find((item) => item.name === 'uploadMode')

    expect(uploadMode?.default).toBe('立即上传')
    expect(uploadMode?.choices).toEqual(['立即上传', '手动批量上传'])
  })

  it('translates menu and command labels in Simplified Chinese', () => {
    const ctx = createI18nContext(LOCALE_ZH_CN)
    const instance = plugin(ctx)

    expect(instance.guiMenu(ctx)[0].label).toBe('Gitea：上传待提交图片')
    expect(instance.commands(ctx)[0].label).toBe('Gitea：上传待提交图片')
  })

  it('falls back to English when PicGo returns the untranslated key', () => {
    const ctx = createI18nContext({})

    expect(translate(ctx, 'GITEA_CONFIG_TOKEN')).toBe('Access Token')
  })
})
