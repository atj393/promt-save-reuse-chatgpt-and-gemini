<div align="center">

<img src="icons/icon128.png" alt="Prompt Save Reuse icon" width="96" height="96" />

# Prompt Save Reuse: ChatGPT, Gemini and More

**Save a prompt in the chat box you are already typing in, and paste it back with one click.**

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Live-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/prompt-save-reuse-chatgpt/fldaklkfolpnnlgoejcgcgjmklmheaim)
[![Edge Add-ons](https://img.shields.io/badge/Edge_Add--ons-Live-0078D7?logo=microsoftedge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/prompt-save-reuse-chatgp/jhmpgoabgjjodchphhlicbjdjdpfckma)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4)](manifest.json)
[![Version](https://img.shields.io/badge/version-3.0-informational)](manifest.json)
[![License](https://img.shields.io/badge/license-custom-orange)](license)

</div>

---

Prompt Save Reuse stores the text you have typed into an AI chat composer, keyed by the
conversation URL, and puts it back when you want it. There is no popup, no side panel, and no
account: the interaction is a click on the composer or the toolbar icon.

It runs on **seven** chat platforms: ChatGPT, Gemini, Claude, Perplexity, Grok, Mistral, and
DeepSeek.

## Project status

- **Chrome Web Store:** [live](https://chromewebstore.google.com/detail/prompt-save-reuse-chatgpt/fldaklkfolpnnlgoejcgcgjmklmheaim), version 3.0.
- **Microsoft Edge Add-ons:** [live](https://microsoftedge.microsoft.com/addons/detail/prompt-save-reuse-chatgp/jhmpgoabgjjodchphhlicbjdjdpfckma).
- **Stack:** plain JavaScript, Manifest V3, no build step and no dependencies.
- **Licence:** a **custom licence**, not MIT. See [Licence](#licence) before reusing any of it.
- **Contributions:** open, with issues labelled `good first issue` and `hacktoberfest`.

## What it does

| Action | Where | Result |
|---|---|---|
| **Single click** | Composer, or the toolbar icon | Saves the composer text for this conversation URL. If the composer is empty, restores the text saved for that URL instead. |
| **Double click** | Composer, or the toolbar icon | Appends the saved text below whatever is currently in the composer, separated by a blank line. |
| **Right click** | Toolbar icon | Context menu: clear all saved data, open the user guide, open the developer profile. |
| `Ctrl+Shift+1` | Anywhere | Save. |
| `Ctrl+Shift+2` | Anywhere | Append. |

Saved text lives in `chrome.storage.sync`, so it follows your browser profile across devices.

## Install

- **Chrome:** [Chrome Web Store listing](https://chromewebstore.google.com/detail/prompt-save-reuse-chatgpt/fldaklkfolpnnlgoejcgcgjmklmheaim)
- **Edge:** [Edge Add-ons listing](https://microsoftedge.microsoft.com/addons/detail/prompt-save-reuse-chatgp/jhmpgoabgjjodchphhlicbjdjdpfckma)
- **From source:** clone the repository, open `chrome://extensions`, enable **Developer mode**,
  click **Load unpacked**, and select the repository folder. There is nothing to build.

Full walkthrough: [USER_GUIDE.md](USER_GUIDE.md) and the
[wiki](https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/wiki).

## Permissions

| Permission | Why it is needed |
|---|---|
| `storage` | Save prompts, keyed by conversation URL, in `chrome.storage.sync`. |
| `activeTab` | Act on the chat tab you are currently using. |
| `scripting` | Run the save and append functions in that tab when you use a keyboard shortcut or the toolbar icon. |
| `contextMenus` | Provide the right-click menu on the toolbar icon. |

There is no host permission beyond the seven matched chat domains, no network request of the
extension's own, and no analytics.

## Engineering decisions

**Two gestures on one target, with no popup.** Single click saves or restores, double click
appends, and both land on the same element. The browser has no native double-click event for a
toolbar action, so `background.js` and `content.js` each hold a 300 ms timer: the first click
schedules the single-click handler, and a second click inside the window cancels it and runs the
double-click handler instead. The consequence is honest and worth stating: every single-click
action is deliberately delayed by 300 ms. That was accepted as the price of keeping the whole
interface to one button rather than adding a popup nobody wants to open mid-thought.

**Seven chat UIs, one insertion path.** Each platform builds its composer differently: a
ProseMirror `contenteditable`, ChatGPT's `#prompt-textarea`, a Quill `.ql-editor`, Perplexity's
`#ask-input`, and DeepSeek's placeholder-matched `textarea`. `findInputField()` is an ordered
selector cascade rather than a per-site branch, so adding a platform is one entry rather than a
new code path. Writing into them is the harder half: these are framework-controlled inputs, so
assigning `.value` updates the DOM and the framework immediately overwrites it. `insertText()`
therefore branches three ways: the prototype's native value setter plus a dispatched `input`
event for `textarea` and `input`, `document.execCommand("insertText")` for Lexical editors, and
`innerHTML` plus an `input` event for other `contenteditable` composers. Each is the path that
particular editor actually accepts as user input.

**The composer does not exist when the content script runs.** All seven sites are single-page
apps, and the input field is mounted later and remounted on every navigation. A
`MutationObserver` watches for it and re-attaches listeners, so the extension keeps working
after a route change without a page reload.

**Storage keyed by URL.** One saved prompt per conversation, in `chrome.storage.sync` rather
than `local`, so it follows the browser profile to other machines. The trade-off is the sync
quota: `chrome.storage.sync` caps individual items at roughly 8 KB, and a very long prompt will
not save.

## Known limitations

- **Selectors are the fragile part.** When a platform ships a new composer, `findInputField()`
  stops matching and the extension goes quiet on that site until the selector list is updated.
- **A failed save is silent.** If no input field is found, nothing tells the user. This is
  tracked in [issue #13](https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/issues/13).
- **`chrome.storage.sync` has quotas.** Long prompts can exceed the per-item limit.
- **Single-click actions carry a 300 ms delay** by design, as described above.
- **No automated tests.** Adding them is tracked in issues
  [#8](https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/issues/8) and
  [#9](https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/issues/9).
- **One prompt per URL.** There is no named prompt library, and saving again overwrites.

## Contributing

Contributions are welcome, and the issue tracker is set up for them.

- Start with issues labelled
  [`good first issue`](https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
  or [`hacktoberfest`](https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest).
- Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).
- Fork, branch, and open a pull request. Test by loading the unpacked extension and exercising
  the change on at least one of the seven supported sites.

## Contact

- Open an issue on GitHub.
- LinkedIn: [linkedin.com/in/atj393](https://www.linkedin.com/in/atj393/)

## Licence

This project uses a **custom licence, not MIT**. See [license](license) for the full text.

In short, it grants the right to use, modify, and publish changes **for the purpose of
contributing to this project**, and requires derivative works to keep the same terms. It
expressly prohibits private use, commercial use, sublicensing, and redistributing the software
as-is without modification.

If you need terms that permit private or commercial use, open an issue and ask before relying
on the code.
