import { getConfigItems } from './config'
import { manualUpload, handleUpload } from './uploader'
import { PicGoContext, PicGoGuiApi } from './types'

const UPLOADER_ID = 'gitea-uploader'

function plugin(ctx: PicGoContext) {
  const uploader = {
    name: 'Gitea Uploader',
    handle: handleUpload,
    config: () => getConfigItems()
  }

  return {
    uploader: UPLOADER_ID,
    config: getConfigItems,
    register() {
      ctx.helper?.uploader?.register(UPLOADER_ID, uploader)
    },
    guiMenu() {
      return [
        {
          label: 'Upload pending Gitea images',
          handle: async (_ctx: PicGoContext, guiApi?: PicGoGuiApi) => {
            await manualUpload(ctx)
            guiApi?.showNotification?.({
              title: 'Gitea Uploader',
              body: 'Pending Gitea images uploaded.'
            })
          }
        }
      ]
    },
    commands: [
      {
        name: 'manualUpload',
        label: 'Upload pending Gitea images',
        handle: () => manualUpload(ctx)
      }
    ]
  }
}

export = plugin
