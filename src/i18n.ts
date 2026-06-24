import { PicGoContext } from './types'

export const LOCALE_EN = {
  GITEA_UPLOADER_NAME: 'Gitea',
  GITEA_MENU_UPLOAD_PENDING: 'Gitea: Upload Pending Images',
  GITEA_NOTIFY_PENDING_UPLOADED: 'Pending Gitea images uploaded.',
  GITEA_LOG_NO_PENDING: 'No pending Gitea uploads.',
  GITEA_LOG_PENDING_UPLOADED: 'Uploaded {count} pending image(s) to Gitea.',
  GITEA_CONFIG_SERVER_URL: 'Gitea Server URL',
  GITEA_CONFIG_SERVER_URL_MESSAGE: 'For example: https://gitea.example.com',
  GITEA_CONFIG_TOKEN: 'Access Token',
  GITEA_CONFIG_OWNER: 'Repository Owner',
  GITEA_CONFIG_REPO: 'Repository Name',
  GITEA_CONFIG_BRANCH: 'Branch',
  GITEA_CONFIG_PATH_PREFIX: 'Path Prefix',
  GITEA_CONFIG_FILE_NAME_TEMPLATE: 'File Name Template',
  GITEA_CONFIG_FILE_NAME_TEMPLATE_MESSAGE: 'Use tokens such as {filename}, {YYYY}, {MM}, {DD}, {md5}, {sha256}, {uuid4}, {rand:8}. Extension is always preserved.',
  GITEA_CONFIG_UPLOAD_MODE: 'Upload Mode',
  GITEA_CONFIG_RAW_URL_TEMPLATE: 'Raw URL Template',
  GITEA_CONFIG_MANUAL_UPLOAD_SHORTCUT: 'Manual Upload Shortcut',
  GITEA_CONFIG_MANUAL_UPLOAD_SHORTCUT_MESSAGE: 'Optional preset shortcut shown in PicGo shortcut settings. You can change or disable it there.'
}

export const LOCALE_ZH_CN = {
  GITEA_UPLOADER_NAME: 'Gitea',
  GITEA_MENU_UPLOAD_PENDING: 'Gitea：上传待提交图片',
  GITEA_NOTIFY_PENDING_UPLOADED: '待提交的 Gitea 图片已上传。',
  GITEA_LOG_NO_PENDING: '没有待上传的 Gitea 图片。',
  GITEA_LOG_PENDING_UPLOADED: '已上传 {count} 张待提交图片到 Gitea。',
  GITEA_CONFIG_SERVER_URL: 'Gitea 服务器地址',
  GITEA_CONFIG_SERVER_URL_MESSAGE: '例如：https://gitea.example.com',
  GITEA_CONFIG_TOKEN: '访问令牌',
  GITEA_CONFIG_OWNER: '仓库所有者',
  GITEA_CONFIG_REPO: '仓库名称',
  GITEA_CONFIG_BRANCH: '分支',
  GITEA_CONFIG_PATH_PREFIX: '上传路径前缀',
  GITEA_CONFIG_FILE_NAME_TEMPLATE: '文件命名模板',
  GITEA_CONFIG_FILE_NAME_TEMPLATE_MESSAGE: '可使用 {filename}、{YYYY}、{MM}、{DD}、{md5}、{sha256}、{uuid4}、{rand:8} 等模板；始终保留原始扩展名。',
  GITEA_CONFIG_UPLOAD_MODE: '上传模式',
  GITEA_CONFIG_RAW_URL_TEMPLATE: 'Raw URL 模板',
  GITEA_CONFIG_MANUAL_UPLOAD_SHORTCUT: '手动上传快捷键',
  GITEA_CONFIG_MANUAL_UPLOAD_SHORTCUT_MESSAGE: '显示在 PicGo 快捷键设置中的默认快捷键，可在 PicGo 中修改或禁用。'
}

export const LOCALE_ZH_TW = {
  ...LOCALE_ZH_CN,
  GITEA_UPLOADER_NAME: 'Gitea',
  GITEA_MENU_UPLOAD_PENDING: 'Gitea：上傳待提交圖片',
  GITEA_NOTIFY_PENDING_UPLOADED: '待提交的 Gitea 圖片已上傳。',
  GITEA_LOG_NO_PENDING: '沒有待上傳的 Gitea 圖片。',
  GITEA_LOG_PENDING_UPLOADED: '已上傳 {count} 張待提交圖片到 Gitea。',
  GITEA_CONFIG_SERVER_URL: 'Gitea 伺服器位址',
  GITEA_CONFIG_SERVER_URL_MESSAGE: '例如：https://gitea.example.com',
  GITEA_CONFIG_TOKEN: '存取權杖',
  GITEA_CONFIG_OWNER: '倉庫擁有者',
  GITEA_CONFIG_REPO: '倉庫名稱',
  GITEA_CONFIG_BRANCH: '分支',
  GITEA_CONFIG_PATH_PREFIX: '上傳路徑前綴',
  GITEA_CONFIG_FILE_NAME_TEMPLATE: '檔案命名模板',
  GITEA_CONFIG_FILE_NAME_TEMPLATE_MESSAGE: '可使用 {filename}、{YYYY}、{MM}、{DD}、{md5}、{sha256}、{uuid4}、{rand:8} 等模板；始終保留原始副檔名。',
  GITEA_CONFIG_UPLOAD_MODE: '上傳模式',
  GITEA_CONFIG_RAW_URL_TEMPLATE: 'Raw URL 模板',
  GITEA_CONFIG_MANUAL_UPLOAD_SHORTCUT: '手動上傳快捷鍵',
  GITEA_CONFIG_MANUAL_UPLOAD_SHORTCUT_MESSAGE: '顯示在 PicGo 快捷鍵設定中的預設快捷鍵，可在 PicGo 中修改或停用。'
}

export type I18nKey = keyof typeof LOCALE_EN

export function registerLocales(ctx: PicGoContext): void {
  ctx.i18n?.addLocale?.('en', LOCALE_EN)
  ctx.i18n?.addLocale?.('zh-CN', LOCALE_ZH_CN)
  ctx.i18n?.addLocale?.('zh-TW', LOCALE_ZH_TW)
}

export function translate(ctx: PicGoContext | undefined, key: I18nKey, args: Record<string, string | number> = {}): string {
  const translated = ctx?.i18n?.translate?.(key)
  const fallback = translated && translated !== key ? translated : LOCALE_EN[key]
  return Object.entries(args).reduce((message, [name, value]) => {
    return message.replace(new RegExp('\\{' + name + '\\}', 'g'), String(value))
  }, fallback)
}
