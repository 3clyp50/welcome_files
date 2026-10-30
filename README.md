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

- Enter a folder path and press Enter, or click folders to browse. The up arrow opens the parent.
- Filter the current folder by name. Clear the filter with its close button or Escape. Folders appear first; file sizes use the standard Files formatter.
- Click a file to open it with Agent Zero's existing Editor, Browser, or Desktop action.
- **Open Files** opens the complete file browser at the current folder for uploads, downloads, and file management.
- On the movable welcome layout, use the header to select half/full width, drag the panel, or dismiss it. **Show all dismissed** restores it. Reordering and width persist in this browser.

The panel remembers its own folder in browser storage and does not retarget an already-open Files dialog. Files remain on your Agent Zero runtime; normal authentication and file-provider permissions apply. This plugin has no model calls or external services.

## Remove

Disable or uninstall through Plugins. No files are deleted and no service is left running. The small browser-local path, width, dismissal, and layout preferences are retained; clear site storage to remove them.

## Develop

The panel is contributed through `welcome-actions-end`. Its stable block ID is `welcome_files.browser`; `data-welcome-size="half"` opts into responsive pairing. It uses the shared authenticated file API and file-opening actions rather than its own filesystem backend.

Run `node --test tests/files.test.mjs`. Smoke-test folder navigation, failed paths, file opening, half/full widths, dismissal/restoration, and narrow touch layouts in Agent Zero.

MIT license. Thumbnail generated with OpenAI imagegen and exported as a 256×256 WebP under20kB.
