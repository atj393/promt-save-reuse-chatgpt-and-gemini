# CLAUDE.md — Prompt Save Reuse: ChatGPT & Gemini

## Project Overview

A Chrome Extension (Manifest V3) that lets users save and reuse prompts on ChatGPT and Gemini. No build system, no dependencies — pure vanilla JavaScript.

## Architecture

Two-file extension architecture:

- **[background.js](background.js)** — Background service worker. Handles icon clicks (single vs double, 300ms threshold), keyboard shortcuts, and context menus. Injects storage operations into active tabs.
- **[content.js](content.js)** — Content script injected into ChatGPT/Gemini pages. Detects input fields, handles click events (with debounce), manipulates DOM for text insertion/appending.

### Data Flow

1. User triggers action (icon click, keyboard shortcut, context menu)
2. Background service worker detects action type
3. Worker injects/calls function in active tab
4. Content script or injected function reads/writes Chrome local storage (keyed by URL)
5. Input field DOM is updated accordingly

### Storage

Prompts are stored via `chrome.storage.local`, keyed by the current page URL. This means ChatGPT and Gemini have separate saved prompts.

## Supported Platforms & Selectors

| Platform | Selector |
|----------|----------|
| ChatGPT  | `.ProseMirror[contenteditable='true']` (primary), `#prompt-textarea` (fallback) |
| Gemini   | `.ql-editor[contenteditable="true"]` |

## User-Facing Features

| Trigger | Action |
|---------|--------|
| Single click extension icon | Save current input OR retrieve saved text |
| Double click extension icon | Append saved text to current input |
| `Ctrl+Shift+1` | Save/retrieve prompt |
| `Ctrl+Shift+2` | Append saved prompt |
| Right-click extension icon | Context menu (clear data, GitHub wiki, LinkedIn) |

## Key Technical Details

- **Click detection**: 300ms timeout in background.js to distinguish single vs double click
- **Debounce**: Content script event listeners debounced at 100ms
- **Cursor handling**: Different logic for `contenteditable` divs vs `textarea`/`input` elements
- **Notifications**: Uses Notification API with fallback to `alert()` if permission denied
- **No build step**: Edit files directly, reload extension in `chrome://extensions`

## Development Workflow

1. Clone repo
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" → select project root
5. After code changes: click the refresh icon on the extension card

No npm, no compilation, no bundler.

## Coding Standards (from CONTRIBUTING.md)

- ES6+ JavaScript
- Meaningful variable/function names
- Self-explanatory code (minimal comments needed)
- No unnecessary console logs

## File Reference

```
manifest.json       — Extension config, permissions, commands, content script targets
background.js       — Service worker: click handling, keyboard shortcuts, context menus
content.js          — DOM interaction on ChatGPT/Gemini pages
icons/              — icon16, icon38, icon48, icon128 PNG assets
readme.md           — Project overview and setup
USER_GUIDE.md       — End-user documentation
CONTRIBUTING.md     — Contribution guidelines
```

## License

Custom license — allows modification and redistribution under same terms. **Prohibits private/commercial use and sublicensing.**
