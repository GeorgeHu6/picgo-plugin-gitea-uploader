import { getConfig, getConfigItems } from './config'
import { registerLocales, translate } from './i18n'
import { manualUpload, handleUpload } from './uploader'
import { PicGoCommandItem, PicGoContext, PicGoGuiApi, PicGoGuiMenuItem } from './types'

const UPLOADER_ID = 'gitea-uploader'

function plugin(ctx: PicGoContext) {
  registerLocales(ctx)

  const uploader = {
    name: translate(ctx, 'GITEA_UPLOADER_NAME'),
    handle: handleUpload,
    config: (configCtx: PicGoContext) => getConfigItems(configCtx)
  }

  async function runManualUpload(actionCtx: PicGoContext, guiApi?: PicGoGuiApi): Promise<void> {
    await manualUpload(actionCtx)
    guiApi?.showNotification?.({
      title: translate(actionCtx, 'GITEA_UPLOADER_NAME'),
      body: translate(actionCtx, 'GITEA_NOTIFY_PENDING_UPLOADED')
    })
  }

  return {
    uploader: UPLOADER_ID,
    config: (configCtx: PicGoContext) => getConfigItems(configCtx),
    register() {
      registerLocales(ctx)
      ctx.helper?.uploader?.register(UPLOADER_ID, uploader)
    },
    guiMenu(_ctx: PicGoContext): PicGoGuiMenuItem[] {
      return [
        {
          label: translate(_ctx, 'GITEA_MENU_UPLOAD_PENDING'),
          handle: async (menuCtx: PicGoContext, guiApi?: PicGoGuiApi) => runManualUpload(menuCtx, guiApi)
        }
      ]
    },
    commands(commandCtx: PicGoContext): PicGoCommandItem[] {
      const config = getConfig(commandCtx)
      return [
        {
          name: 'manualUpload',
          label: translate(commandCtx, 'GITEA_MENU_UPLOAD_PENDING'),
          key: config.manualUploadShortcut,
          handle: async (shortcutCtx: PicGoContext, guiApi?: PicGoGuiApi) => runManualUpload(shortcutCtx, guiApi)
        }
      ]
    }
  }
}

export = plugin
