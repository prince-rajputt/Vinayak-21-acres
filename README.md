# Vinayak 21 Acres

An interactive presentation app for the **Vinayak 21 Acres** residential project. Built once as a
React single-page app and shipped three ways: a public marketing website, an offline touchscreen
kiosk (Electron), and a mobile app (Capacitor/Android).

## Features

- **Home** — animated navigation hub with a screensaver that kicks in after a period of
  inactivity and returns to the walkthrough video on next touch.
- **Overview / Location / Amenities / Specifications** — informational pages with image and
  video galleries.
- **Plans** — a master plan image with tappable tower hotspots. Tapping a tower opens its plan
  viewer, which supports drilling into individual unit/type layouts and freehand pen annotation
  over any plan. Back/close navigation steps back one level at a time (unit plan → tower plan →
  master plan hotspots → master plan).
- **Gallery** — categorized photo and video gallery with a fullscreen lightbox.
- **Brochure** — in-app PDF viewer (via `pdfjs-dist`).
- **Contact** — review/feedback capture with a QR code.
- **Kiosk mode** — swipe/tap gesture controls, an exit password gate, and idle screensaver, all
  tuned for an unattended touchscreen display.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) for the UI and build tooling
- Plain hash-based routing (`#page`) — no router dependency
- [Electron](https://www.electronjs.org/) for the offline desktop kiosk build
- [Capacitor](https://capacitorjs.com/) for the Android app build
- [Netlify](https://www.netlify.com/) for the public website deployment

## Project structure

```text
src/
  pages/        One folder per page (Home, Plans, Gallery, Location, ...)
  components/   Shared components (VideoPopup, Screensaver, GestureControls, ...)
  data/         Static content (menu cards, gallery items, plan data)
  hooks/        Small reusable hooks (e.g. hash-based current page)
public/assets/  Images, videos, and plan artwork served as static files
electron/       Electron main process, preload script, and security modules
android/        Capacitor-generated Android project
scripts/        Build-time scripts (obfuscation, asset encryption, integrity manifest)
netlify.toml    Netlify build command and cache headers for the website deploy
```

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

This starts the Vite dev server (default `http://localhost:5173`).

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build:renderer` | Plain production build of the web app (used for Netlify) |
| `npm run build` / `npm run build:secure` | Full **desktop kiosk** build: Vite build, then JS obfuscation, protected-asset encryption, and an integrity manifest (see [SECURITY.md](SECURITY.md)) |
| `npm run preview` | Preview a production build locally |
| `npm run electron` | Build and launch the Electron desktop app |
| `npm run dist:win` | Build and package the Windows installer (NSIS) |
| `npm run mobile:build` | Build the web app and sync it into the Capacitor Android project |
| `npm run mobile:open` | Open the Android project in Android Studio |
| `npm run mobile:apk` | Build the web app and assemble a debug APK |

## Deployment

### Website (Netlify)

Netlify builds with `npm run build:renderer` (configured in [netlify.toml](netlify.toml)) and
publishes `dist/`. This intentionally **skips** the obfuscation/encryption/integrity pipeline used
for the desktop kiosk — that pipeline exists to raise the cost of tampering with an offline
Electron binary and adds startup overhead with no benefit on a public website.
`netlify.toml` also sets a one-week cache on `/assets/*` so repeat visits don't re-download the
same images and videos.

### Desktop kiosk (Electron)

```bash
npm run dist:win
```

Produces a Windows installer in `release-app/`. See [SECURITY.md](SECURITY.md) for the full
hardening model (context isolation, asset encryption, licensing, integrity checks) and the
environment variables required for a production build.

### Android

```bash
npm run mobile:build
npm run mobile:open   # or npm run mobile:apk for a debug build
```

## Security

The desktop build includes defense-in-depth measures (sandboxed renderer, encrypted protected
assets, license verification, integrity checks). Details and required environment variables are
documented in [SECURITY.md](SECURITY.md).
