# Kishok Production Security

This application uses defense-in-depth. Electron hardening, ASAR packaging, minification,
obfuscation, asset encryption, licensing, and integrity checks raise the cost of abuse, but
no Electron client can fully prevent extraction or reverse engineering of code that ships to
an end-user machine. Highly sensitive logic, API keys, and authoritative license decisions
must stay on a backend.

## Runtime Security

- `BrowserWindow` uses `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`,
  disabled workers/subframe Node integration, disabled webviews, disabled plugins, and
  production-disabled DevTools.
- The renderer receives only `window.kishokSecurity` from `electron/preload.cjs`.
- All IPC is handled in the main process and validates primitive inputs before use.
- External navigation, popups, webviews, and permission prompts are denied.
- The `app://kishok` protocol serves only packaged `dist` files and blocks direct access to
  `/protected-assets`.
- Production startup verifies the integrity manifest before showing the app.
- Production startup requires a valid online-refreshed license before showing the app.

## Build Security

Production build flow:

```bash
npm run build:secure
npm run dist:win
```

The build pipeline:

1. Vite builds minified bundles with source maps disabled.
2. `scripts/obfuscate-dist.cjs` obfuscates generated JavaScript bundles.
3. `scripts/encrypt-assets.cjs` encrypts files from `protected-assets/` into `dist/protected-assets/`.
4. `scripts/generate-integrity-manifest.cjs` writes SHA-256 hashes for packaged resources.
5. `electron-builder.yml` packages Electron with ASAR and excludes source folders and source maps.

## Protected Assets

Put sensitive local assets in:

```text
protected-assets/
```

Set a 32-byte AES key before building and before running packaged builds:

```powershell
$env:KISHOK_ASSET_KEY_B64 = "<base64-encoded-32-byte-key>"
```

The build encrypts protected assets with AES-256-GCM. The application decrypts them only in
the main process and returns in-memory base64 payloads through validated IPC after license
verification. Do not put highly sensitive assets in Electron at all; keep those on a backend
and serve short-lived authorized responses.

## License Backend Contract

Set the production backend endpoint and public key:

```powershell
$env:KISHOK_LICENSE_API_URL = "https://license.example.com/v1/kishok/verify"
$env:KISHOK_LICENSE_PUBLIC_KEY_PEM = "-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----"
```

The client sends:

```json
{
  "licenseKey": "user-entered-key",
  "machineId": "sha256-hardware-fingerprint",
  "product": "Kishok",
  "appVersion": "1.0.0"
}
```

For refreshes, the client sends `licenseKeyHash` instead of the raw key.

The backend must:

- Authenticate and rate-limit requests.
- Bind one active license key to exactly one `machineId`.
- Enforce expiration, revocation, product, and app-version policy.
- Return `{ "ok": true, "token": "<signed-token>" }`.
- Sign the token with EdDSA or RS256. Keep the private key only on the backend.
- Include at least `machineId`, `expiresAt`, `product`, and `licenseId` in the token payload.

The Electron app stores license information encrypted through Electron `safeStorage`.

## Recommended Folder Structure

```text
electron/
  main.cjs
  preload.cjs
  security/
    integrity.cjs
    license.cjs
    protected-assets.cjs
    security-config.cjs
scripts/
  encrypt-assets.cjs
  generate-integrity-manifest.cjs
  obfuscate-dist.cjs
protected-assets/
src/
public/
dist/
electron-builder.yml
vite.config.js
```

## Production Notes

- Never set `NODE_TLS_REJECT_UNAUTHORIZED=0` in production or CI.
- Do not ship API keys in Electron. Use authenticated backend requests and short-lived tokens.
- Sign installers with a real code-signing certificate when distributing externally.
- Consider OS-level anti-debug/tamper products only after code signing, backend license checks,
  and telemetry/rate limiting are in place.
- Obfuscation and ASAR conceal source from casual inspection; they are not cryptographic
  protection. Critical business logic must be server-side.
