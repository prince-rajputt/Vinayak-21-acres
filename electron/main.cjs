"use strict";

const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  net,
  protocol,
  session,
} = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { verifyApplicationIntegrity } = require("./security/integrity.cjs");
const {
  activateLicense,
  clearLicense,
  getLicenseStatus,
} = require("./security/license.cjs");
const { readProtectedAsset } = require("./security/protected-assets.cjs");

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-compositing");
app.commandLine.appendSwitch("disable-gpu-rasterization");
app.commandLine.appendSwitch("disable-features", "Auxclick");
app.commandLine.appendSwitch("disable-component-update");

const isDev = !app.isPackaged;
const appRoot = path.join(__dirname, "..");
const distRoot = isDev ? path.join(appRoot, "dist") : path.join(process.resourcesPath, "dist");
const appIcon = path.join(appRoot, "logo", "icon.ico");
const appUrl = "app://kishok/index.html";
const locationMapBaseUrl = "https://mayabiousvr.s3.ap-south-1.amazonaws.com/JIGA2/";
const locationMapProxyPrefix = "/google-map-proxy/";
const productionDevToolsEnabled = process.env.KISHOK_ENABLE_PROD_DEVTOOLS === "1";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: false,
      allowServiceWorkers: false,
      bypassCSP: false,
    },
  },
]);

function isAllowedAppUrl(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    return parsed.protocol === "app:" && parsed.hostname === "kishok";
  } catch {
    return false;
  }
}

function resolveDistPath(requestUrl) {
  const parsed = new URL(requestUrl);
  const decodedPath = decodeURIComponent(parsed.pathname);
  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const relativePath = requestedPath.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(distRoot, relativePath));
  const relativeFromDist = path.relative(distRoot, filePath);

  if (relativeFromDist.startsWith("..") || path.isAbsolute(relativeFromDist)) {
    return path.join(distRoot, "index.html");
  }

  return filePath;
}

function rejectProtectedAssetRequest(requestUrl) {
  const parsed = new URL(requestUrl);
  const normalized = decodeURIComponent(parsed.pathname).replace(/\\/g, "/").toLowerCase();
  return normalized.startsWith("/protected-assets/");
}

function resolveLocationMapProxyUrl(requestUrl) {
  const parsed = new URL(requestUrl);

  if (!parsed.pathname.startsWith(locationMapProxyPrefix)) {
    return null;
  }

  const relativePath = parsed.pathname.slice(locationMapProxyPrefix.length) || "index.html";

  if (relativePath.split("/").includes("..")) {
    return null;
  }

  const targetUrl = new URL(relativePath, locationMapBaseUrl);
  targetUrl.search = parsed.search;
  return targetUrl.toString();
}

async function fetchLocationMapProxy(requestUrl) {
  const targetUrl = resolveLocationMapProxyUrl(requestUrl);

  if (!targetUrl) {
    return null;
  }

  const upstream = await net.fetch(targetUrl);
  const headers = new Headers(upstream.headers);
  headers.delete("content-security-policy");
  headers.delete("content-security-policy-report-only");
  headers.delete("x-frame-options");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

function createSecureWindow(options = {}) {
  const win = new BrowserWindow({
    width: options.width ?? 1920,
    height: options.height ?? 1080,
    minWidth: options.minWidth ?? 1024,
    minHeight: options.minHeight ?? 700,
    autoHideMenuBar: true,
    backgroundColor: "#000000",
    fullscreen: options.fullscreen ?? true,
    kiosk: options.kiosk ?? false,
    frame: options.frame ?? false,
    icon: appIcon,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      enableBlinkFeatures: "",
      spellcheck: false,
      devTools: isDev || productionDevToolsEnabled,
      webviewTag: false,
      javascript: true,
      images: true,
      plugins: false,
    },
  });

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  win.webContents.on("will-navigate", (event, targetUrl) => {
    if (!isAllowedAppUrl(targetUrl)) {
      event.preventDefault();
    }
  });

  win.webContents.on("before-input-event", (event, input) => {
    const key = String(input.key || "").toLowerCase();
    const opensDevTools =
      key === "f12" ||
      (input.control && input.shift && ["i", "j", "c"].includes(key)) ||
      (input.meta && input.alt && ["i", "j", "c"].includes(key));

    if (!isDev && (opensDevTools || key === "f5")) {
      event.preventDefault();
      return;
    }

    if (input.type === "keyDown" && input.key === "F11") {
      event.preventDefault();
      win.minimize();
    }
  });

  win.webContents.on("devtools-opened", () => {
    if (!isDev && !productionDevToolsEnabled) {
      win.webContents.closeDevTools();
    }
  });

  win.webContents.on("render-process-gone", () => {
    win.loadURL(appUrl).catch(() => app.quit());
  });

  win.webContents.on("unresponsive", () => {
    win.webContents.reloadIgnoringCache();
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  return win;
}

async function createMainWindow() {
  const win = createSecureWindow();
  await win.loadURL(appUrl);
}

async function createLicenseWindow(reason) {
  const win = createSecureWindow({
    width: 640,
    height: 480,
    minWidth: 520,
    minHeight: 420,
    fullscreen: false,
  });

  const safeReason = String(reason || "License verification is required.")
    .replace(/[<>&"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[char]));

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' app: data:;">
  <title>Vinayak 21 Acres License</title>
  <style>
    html, body { height: 100%; margin: 0; background: #090909; color: #f2c75f; font-family: Arial, sans-serif; }
    main { display: grid; gap: 18px; align-content: center; height: 100%; padding: 44px; }
    h1 { margin: 0; font-size: 30px; font-weight: 700; }
    p { margin: 0; color: #f6e6b7; line-height: 1.5; }
    input { width: 100%; padding: 14px 16px; color: #fff; background: #151515; border: 1px solid #a8873d; border-radius: 8px; font-size: 16px; }
    button { width: max-content; padding: 12px 18px; color: #0a0a0a; background: #f2c75f; border: 0; border-radius: 8px; font-weight: 800; cursor: pointer; }
    #status { min-height: 22px; color: #ffffff; }
  </style>
</head>
<body>
  <main>
    <h1>Vinayak 21 Acres Activation</h1>
    <p>${safeReason}</p>
    <input id="licenseKey" autocomplete="off" spellcheck="false" placeholder="Enter license key">
    <button id="activate" type="button">Activate</button>
    <p id="status"></p>
  </main>
  <script>
    const input = document.getElementById("licenseKey");
    const status = document.getElementById("status");
    document.getElementById("activate").addEventListener("click", async () => {
      status.textContent = "Verifying license...";
      const result = await window.kishokSecurity.activateLicense(input.value);
      if (result.ok) {
        status.textContent = "Activated. Starting Vinayak 21 Acres...";
        window.location.href = "app://kishok/index.html";
      } else {
        status.textContent = result.reason || "Activation failed.";
      }
    });
  </script>
</body>
</html>`;

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

function registerIpc() {
  ipcMain.handle("app:quit", async () => {
    app.quit();
  });
  ipcMain.handle("app:setZoomFactor", (event, zoomFactor) => {
    const factor = Math.min(2.5, Math.max(1, Number(zoomFactor) || 1));
    event.sender.setZoomFactor(factor);
    return factor;
  });
  ipcMain.handle("license:getStatus", async () => getLicenseStatus());
  ipcMain.handle("license:activate", async (_event, licenseKey) => activateLicense(licenseKey));
  ipcMain.handle("license:clear", async () => clearLicense());
  ipcMain.handle("asset:readProtected", async (_event, relativePath) => {
    return readProtectedAsset(relativePath);
  });
}

async function enforceStartupSecurity() {
  if (!isDev) {
    await verifyApplicationIntegrity(distRoot);
  }

  return null;
}

app.whenReady().then(async () => {
  app.setAppUserModelId("com.vinayak21acres.desktop");
  app.setName("Vinayak 21 Acres");

  registerIpc();

  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  protocol.handle("app", async (request) => {
    if (!isAllowedAppUrl(request.url) || rejectProtectedAssetRequest(request.url)) {
      return new Response("Not found", { status: 404 });
    }

    const locationMapResponse = await fetchLocationMapProxy(request.url);
    if (locationMapResponse) {
      return locationMapResponse;
    }

    const filePath = resolveDistPath(request.url);
    return net.fetch(pathToFileURL(filePath).toString());
  });

  try {
    const blockReason = await enforceStartupSecurity();
    if (blockReason) {
      dialog.showErrorBox("Vinayak 21 Acres security check failed", blockReason);
      app.quit();
    } else {
      await createMainWindow();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Security startup check failed.";
    dialog.showErrorBox("Vinayak 21 Acres security check failed", message);
    app.quit();
  }

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const blockReason = await enforceStartupSecurity();
      if (blockReason) {
        dialog.showErrorBox("Vinayak 21 Acres security check failed", blockReason);
        app.quit();
      } else {
        await createMainWindow();
      }
    }
  });
});

app.on("web-contents-created", (_event, contents) => {
  contents.on("will-attach-webview", (event) => event.preventDefault());
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
