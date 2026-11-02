# Fill Screen for Twitch & YouTube

A small Firefox extension that adds a button to the Twitch and YouTube players to get rid of black bars.

> Not affiliated with, endorsed by, or sponsored by Twitch or YouTube.

Requires Firefox 140 or later (Firefox for Android 142 or later). Works in Firefox-based browsers such as Zen.

When a video's aspect ratio doesn't match your screen or player, you get black bars on the sides or top and bottom. This extension puts a button in the player controls, just left of the fullscreen button, that cycles the video through three modes:

| Mode | What it does |
|---|---|
| **Fit** | The site's default. Whole video visible, with black bars. |
| **Stretch** | Stretches the video to fill the player. Nothing is cut off, but the picture is distorted. |
| **Crop** | Zooms until the bars are gone. No distortion, but the edges are cut off. |

Click once for Stretch, again for Crop, and again to go back to Fit. Hover the button to see the current mode and what the next click does. The icon turns purple while Stretch or Crop is on.

## How it works

- Runs on `*.twitch.tv` and `www.youtube.com` pages.
- Changes only how the video is drawn (CSS `object-fit`), never the stream itself. Works in normal, theatre and fullscreen modes.
- On YouTube, which sizes the video element to the video's aspect ratio, it also makes the element fill the player while Stretch or Crop is on. Fit leaves YouTube untouched.
- Remembers your last mode in extension storage, so it survives reloads and browser restarts. The setting is shared between Twitch and YouTube, and every open tab follows it.
- Both sites rebuild the player when you navigate, so the extension watches the page and adds the button back when needed.

YouTube Shorts, mobile YouTube (`m.youtube.com`) and YouTube videos embedded on other sites aren't supported.

## Install

### Temporary (for testing)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick `manifest.json`.

The extension is removed when the browser restarts.

Or run it in a throwaway profile with live reload:

```bash
npx web-ext run --firefox=/Applications/Zen.app/Contents/MacOS/zen --start-url https://www.twitch.tv
```

Drop `--firefox=…` to use your default Firefox.

### Permanent

Standard Firefox only installs signed extensions. Either:

- Build the zip (see below), upload it to [addons.mozilla.org](https://addons.mozilla.org/developers/) as an **unlisted** add-on to get it signed (free), then install the signed `.xpi`; or
- Use Firefox Developer Edition or Nightly and set `xpinstall.signatures.required` to `false` in `about:config`, then install the zip.

## Build

```bash
npx web-ext lint
npx web-ext build --overwrite-dest --ignore-files README.md LICENSE .gitignore
```

The zip is written to `web-ext-artifacts/`. Bump `version` in `manifest.json` before each release; AMO rejects a version number it has already seen.

## Privacy

The extension collects no data and makes no network requests. The only thing it stores is your chosen mode, locally in the browser.

## Files

- `manifest.json`: extension manifest (Manifest V2).
- `content.js`: content script that adds the button, cycles the mode and saves it.
- `content.css`: the Stretch and Crop rules and the button styling.
- `icons/icon.svg`: extension icon.

## License

[MIT](LICENSE)
