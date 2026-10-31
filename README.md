# Welcome Files

![Welcome Files](webui/thumbnail.webp)

Browse your files directly from the Agent Zero welcome screen. A compact panel works beside another half-width block and expands to fill the row when its neighbor is hidden.

## Install

In Agent Zero, open **Plugins → Plugin Hub → Install from Git** and use:

```text
https://github.com/3clyp50/welcome_files
```

Enable the plugin and reload the WebUI. No API key, paid service, or extra dependency is needed. Requires the current Agent Zero file browser and welcome screen; older welcome layouts with the lower grid show a full-width panel without customization controls.

## Use

- Use the same breadcrumbs or text address bar as Files, with back/forward navigation and folder autocomplete.
- The **File Browser Settings** gear opens the existing shared settings: sorting defaults, list/icon view, path bar, file tree, remote folders and file limits. There is no separate plugin configuration.
- Open files, select items, create and rename, upload, download or delete through the normal Files controls and permission checks.
- **Open in Files** opens the full browser at this panel's folder; **Refresh** reloads the panel.
- Use the welcome header to select half/full width, drag the panel, or dismiss it. **Show all dismissed** restores it.

Welcome keeps its own folder, history, selection and tree state, independently of a Files window or Editor picker. It respects the shared **Remember last file browser location** setting. In the main Files browser, **Separate browsing per chat** is enabled by default; turning it off shares one session across chats while Welcome stays independent.

The full browser requires Core support for `createFileBrowserView`. Older Cores retain the compact folder/path/filter panel automatically. Legacy third-party file-action menu extensions that target the primary browser are not mounted in the embedded view; built-in actions and remote-provider connections are shared. Files remain on your Agent Zero runtime, with the same authentication and permissions. No model calls or external services are added.

## Remove

Disable or uninstall through Plugins. No files are deleted and no service is left running. The small browser-local path, width, dismissal, and layout preferences are retained; clear site storage to remove them.

## Develop

The panel is contributed through `welcome-actions-end`. Its stable block ID is `welcome_files.browser`; `data-welcome-size="half"` opts into responsive pairing. On supported Cores it embeds `modals/file-browser/file-browser.html` with `mode="embedded"` and its own owner store. Core owns the renderer, navigation, file actions and settings. `legacy-files.js` preserves the compact fallback for older Cores; it never mounts the new component against an old singleton store.

Run `node --test tests/files.test.mjs`. Smoke-test simultaneous Welcome/Files navigation, shared settings, inline file creation, file opening, half/full widths, dismissal/restoration, narrow touch layouts and older-Core fallback in Agent Zero.

MIT license. Thumbnail generated with OpenAI imagegen and exported as a 256×256 WebP under20kB.
