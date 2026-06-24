# picgo-plugin-gitea-uploader

[简体中文](README.zh-CN.md) | English

A PicGo uploader plugin that stores images in a Gitea repository through the Gitea REST API.

## Features

- Immediate upload mode: each imported image is committed as an individual file.
- Manual batch mode: PicGo receives a predicted raw URL first, then pending images can be committed together.
- Configurable raw URL template for self-hosted Gitea, reverse proxy, and CDN deployments.
- Local upload history and persistent pending queue.
- Remote path conflict avoidance through automatic renaming.
- English, Simplified Chinese, and Traditional Chinese UI labels through PicGo i18n.

## Internationalization

The plugin registers PicGo i18n locale packs for `en`, `zh-CN`, and `zh-TW`. PicGo will show translated plugin configuration labels, menu entries, shortcut labels, and notifications according to the selected app language.

## Configuration

| Field | Description |
| --- | --- |
| `serverUrl` | Gitea server URL, for example `https://gitea.example.com` |
| `token` | Gitea access token with repository write permission |
| `owner` | Repository owner or organization |
| `repo` | Repository name |
| `branch` | Target branch, defaults to `main` |
| `pathPrefix` | Optional directory prefix for uploaded images |
| `fileNameTemplate` | File naming template without extension. Defaults to `{filename}`; the original extension is always preserved |
| `uploadMode` | `immediate` or `manual` |
| `rawUrlTemplate` | URL template. Supported placeholders: `{host}`, `{owner}`, `{repo}`, `{branch}`, `{path}` |
| `manualUploadShortcut` | Optional preset shortcut for manual batch upload, defaults to `Ctrl+Shift+G`. Change or disable it in PicGo shortcut settings |

Default raw URL template:

```text
{host}/{owner}/{repo}/raw/branch/{branch}/{path}
```

## File Name Template

The `fileNameTemplate` controls the remote path without the extension. The plugin always appends the original extension from PicGo, so image format suffixes are not changed. Templates may include `/` to create subdirectories.

Default:

```text
{filename}
```

Supported tokens:

| Token | Description |
| --- | --- |
| `{YYYY}` | 4-digit year |
| `{MM}` / `{M}` | Month with / without leading zero |
| `{DD}` / `{D}` | Day with / without leading zero |
| `{HH}` / `{H}` | Hour with / without leading zero |
| `{mm}` / `{m}` | Minute with / without leading zero |
| `{ss}` / `{s}` | Second with / without leading zero |
| `{timestamp}` | Unix timestamp in seconds |
| `{weekday}` | ISO weekday, 1-7 for Monday-Sunday |
| `{md5}` / `{sha256}` | File content hash |
| `{filename}` | Original file name without extension |
| `{uuid4}` / `{uuid}` | UUID v4 |
| `{rand}` / `{rand:8}` | Random string from `0-9a-z`; default length is 8 |

Example:

```text
{YYYY}/{MM}/{DD}/{filename}_{rand:8}
```

## Template Sanitization and Invalid Input

The plugin is tolerant by design: invalid or unusual templates are sanitized instead of causing upload failure.

- Empty or whitespace-only `fileNameTemplate` values fall back to `{filename}`.
- Unknown or incomplete tokens are not expanded. They remain as text and then go through filename sanitization.
- Template output may contain `/` to create subdirectories. Empty path segments are removed.
- Path traversal segments such as `.` and `..` are removed, so templates cannot escape the configured upload path.
- Each path segment keeps Unicode letters, Unicode numbers, `.`, `_`, and `-`; other characters are replaced with `-`.
- Each path segment is trimmed to 240 characters after sanitization.
- `{rand}` defaults to 8 characters. `{rand:0}` is clamped to 1 character, and values above 128 are clamped to 128 characters.
- If the rendered template becomes empty after sanitization, the plugin falls back to the original file name. If that is also unavailable, it uses `image`.
- The original extension is always appended after sanitization; templates cannot change or remove the image extension.

Examples of tolerated templates:

```text
../{filename}
./{filename}
{filename}//{rand:8}
{unknown}_{filename}_{rand:8}
{rand:999}_{filename}
```

## Manual Batch Upload

When `uploadMode` is set to `manual`, imported images are copied into the local pending queue and PicGo receives the predicted raw URL immediately.

Use the PicGo plugin menu item `Gitea: Upload Pending Images` to submit all pending images in one commit. The plugin also registers a shortcut command with the same label; `manualUploadShortcut` only controls its default key, and PicGo's shortcut settings can change or disable it.
