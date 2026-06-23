# picgo-plugin-gitea-uploader

A PicGo uploader plugin that stores images in a Gitea repository through the Gitea REST API.

## Features

- Immediate upload mode: each imported image is committed as an individual file.
- Manual batch mode: PicGo receives a predicted raw URL first, then pending images can be committed together.
- Configurable raw URL template for self-hosted Gitea, reverse proxy, and CDN deployments.
- Local upload history and persistent pending queue.
- Remote path conflict avoidance through automatic renaming.

## Configuration

| Field | Description |
| --- | --- |
| `serverUrl` | Gitea server URL, for example `https://gitea.example.com` |
| `token` | Gitea access token with repository write permission |
| `owner` | Repository owner or organization |
| `repo` | Repository name |
| `branch` | Target branch, defaults to `main` |
| `pathPrefix` | Optional directory prefix for uploaded images |
| `uploadMode` | `immediate` or `manual` |
| `rawUrlTemplate` | URL template. Supported placeholders: `{host}`, `{owner}`, `{repo}`, `{branch}`, `{path}` |
| `manualUploadShortcut` | Optional global shortcut for manual batch upload, for example `Ctrl+Shift+G`. Leave empty to disable |

Default raw URL template:

```text
{host}/{owner}/{repo}/raw/branch/{branch}/{path}
```

## Manual Batch Upload

When `uploadMode` is set to `manual`, imported images are copied into the local pending queue and PicGo receives the predicted raw URL immediately.

Use the PicGo plugin menu item `Gitea: Upload Pending Images` to submit all pending images in one commit. If `manualUploadShortcut` is configured, PicGo also registers a shortcut command with the same label and key.
