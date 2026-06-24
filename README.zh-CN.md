# picgo-plugin-gitea-uploader

简体中文 | [English](README.md)

一个 PicGo 上传插件，通过 Gitea REST API 将图片保存到 Gitea 仓库中，用作图床。

## 功能

- 立即上传模式：每张导入的图片会立刻作为单独文件提交到仓库。
- 手动批量上传模式：PicGo 先拿到预测 raw URL，图片进入本地待上传队列，之后可以一次性提交。
- 支持自定义 raw URL 模板，适配自建 Gitea、反向代理和 CDN。
- 维护本地上传历史和持久化待上传队列。
- 远端路径冲突时自动改名，不覆盖已有文件。
- 通过 PicGo i18n 支持英文、简体中文和繁体中文界面文案。

## 国际化

插件会注册 PicGo i18n 语言包：`en`、`zh-CN`、`zh-TW`。PicGo 会根据应用语言显示对应的插件配置项、菜单项、快捷键名称和通知文案。

## 配置

| 字段 | 说明 |
| --- | --- |
| `serverUrl` | Gitea 服务器地址，例如 `https://gitea.example.com` |
| `token` | 具有目标仓库写权限的 Gitea access token |
| `owner` | 仓库所有者或组织名 |
| `repo` | 仓库名称 |
| `branch` | 目标分支，默认 `main` |
| `pathPrefix` | 图片上传路径前缀，可选 |
| `fileNameTemplate` | 文件命名模板，不包含扩展名。默认 `{filename}`；插件始终保留原始扩展名 |
| `uploadMode` | `immediate` 或 `manual` |
| `rawUrlTemplate` | raw URL 模板。支持占位符：`{host}`、`{owner}`、`{repo}`、`{branch}`、`{path}` |
| `manualUploadShortcut` | 手动批量上传的默认快捷键，默认 `Ctrl+Shift+G`。可在 PicGo 快捷键设置中修改或禁用 |

默认 raw URL 模板：

```text
{host}/{owner}/{repo}/raw/branch/{branch}/{path}
```

## 文件命名模板

`fileNameTemplate` 控制远端路径中“不含扩展名”的部分。插件始终会追加 PicGo 提供的原始扩展名，因此图片格式后缀不会被模板改变。模板中可以使用 `/` 创建子目录。

默认值：

```text
{filename}
```

支持的 token：

| Token | 说明 |
| --- | --- |
| `{YYYY}` | 4 位年份 |
| `{MM}` / `{M}` | 带前导零 / 不带前导零的月份 |
| `{DD}` / `{D}` | 带前导零 / 不带前导零的日期 |
| `{HH}` / `{H}` | 带前导零 / 不带前导零的小时 |
| `{mm}` / `{m}` | 带前导零 / 不带前导零的分钟 |
| `{ss}` / `{s}` | 带前导零 / 不带前导零的秒 |
| `{timestamp}` | Unix 秒级时间戳 |
| `{weekday}` | ISO 星期，1-7 表示周一到周日 |
| `{md5}` / `{sha256}` | 文件内容 hash |
| `{filename}` | 原始文件名，不含扩展名 |
| `{uuid4}` / `{uuid}` | UUID v4 |
| `{rand}` / `{rand:8}` | 由 `0-9a-z` 组成的随机字符串，默认 8 位 |

示例：

```text
{YYYY}/{MM}/{DD}/{filename}_{rand:8}
```

## 模板清洗与非法输入

插件采用容错策略：非法或异常模板会被清洗后继续上传，而不是直接中断上传。

- 空字符串或纯空白的 `fileNameTemplate` 会回退到 `{filename}`。
- 未知或不完整的 token 不会展开，会作为普通文本进入文件名清洗流程。
- 模板输出可以包含 `/` 来创建子目录，空路径片段会被移除。
- `.` 和 `..` 这类路径穿越片段会被移除，模板无法逃逸出配置的上传路径。
- 每个路径片段会保留 Unicode 字母、Unicode 数字、`.`、`_`、`-`；其他字符会被替换为 `-`。
- 每个路径片段在清洗后最多保留 240 个字符。
- `{rand}` 默认生成 8 位随机串。`{rand:0}` 会被限制为 1 位，超过 128 的长度会被限制为 128 位。
- 如果模板渲染后清洗为空，插件会回退到原始文件名；如果原始文件名也不可用，则使用 `image`。
- 原始扩展名始终会在清洗后追加，模板不能改变或移除图片扩展名。

可容错的模板示例：

```text
../{filename}
./{filename}
{filename}//{rand:8}
{unknown}_{filename}_{rand:8}
{rand:999}_{filename}
```

## 手动批量上传

当 `uploadMode` 设置为 `manual` 时，导入的图片会先复制到本地待上传队列中，PicGo 会立即收到预测 raw URL。

使用 PicGo 插件菜单项 `Gitea：上传待提交图片` 可以将所有待上传图片一次性提交到仓库。插件也会注册同名快捷键命令；`manualUploadShortcut` 只控制默认快捷键，用户可以在 PicGo 快捷键设置中修改或禁用它。
