"use strict";

const { contextBridge, ipcRenderer } = require("electron");

function assertString(value, name, maxLength = 4096) {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    throw new TypeError(`${name} must be a non-empty string.`);
  }

  return value;
}

contextBridge.exposeInMainWorld("kishokSecurity", Object.freeze({
  getLicenseStatus: () => ipcRenderer.invoke("license:getStatus"),

  activateLicense: (licenseKey) =>
    ipcRenderer.invoke("license:activate", assertString(licenseKey, "licenseKey", 512)),

  clearLicense: () => ipcRenderer.invoke("license:clear"),

  readProtectedAsset: (relativePath) =>
    ipcRenderer.invoke("asset:readProtected", assertString(relativePath, "relativePath", 512)),

  quitApp: () => ipcRenderer.invoke("app:quit"),
}));

contextBridge.exposeInMainWorld("vinayakApp", Object.freeze({
  setZoomFactor: (zoomFactor) => ipcRenderer.invoke("app:setZoomFactor", zoomFactor),
}));
