import { getConfig, getConfigItems } from './config'
import { manualUpload, handleUpload } from './uploader'
import { PicGoCommandItem, PicGoContext, PicGoGuiApi, PicGoGuiMenuItem } from './types'

const UPLOADER_ID = 'gitea-uploader'

function plugin(ctx: PicGoContext) {
  const uploader = {
    name: 'Gitea Uploader',
    handle: handleUpload,
    config: () => getConfigItems()
  }

  async function runManualUpload(actionCtx: PicGoContext, guiApi?: PicGoGuiApi): Promise<void> {
    await manualUpload(actionCtx)
    guiApi?.showNotification?.({
      title: 'Gitea Uploader',
      body: 'Pending Gitea images uploaded.'
    })
  }

  return {
    uploader: UPLOADER_ID,
    config: getConfigItems,
    register() {
      ctx.helper?.uploader?.register(UPLOADER_ID, uploader)
    },
    guiMenu(_ctx: PicGoContext): PicGoGuiMenuItem[] {
      return [
        {
          label: 'Gitea: Upload Pending Images',
          handle: async (menuCtx: PicGoContext, guiApi?: PicGoGuiApi) => runManualUpload(menuCtx, guiApi)
        }
      ]
    },
    commands(commandCtx: PicGoContext): PicGoCommandItem[] {
      const config = getConfig(commandCtx)
      return [
        {
          name: 'manualUpload',
          label: 'Gitea: Upload Pending Images',
          key: config.manualUploadShortcut,
          handle: async (shortcutCtx: PicGoContext, guiApi?: PicGoGuiApi) => runManualUpload(shortcutCtx, guiApi)
        }
      ]
    }
  }
}

export = plugin
