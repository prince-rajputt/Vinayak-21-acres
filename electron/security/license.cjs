"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");
const { execFile } = require("node:child_process");
const { app, safeStorage } = require("electron");
const {
  appName,
  licenseApiUrl,
  licensePublicKeyPem,
  maxLicenseClockSkewMs,
} = require("./security-config.cjs");

const execFileAsync = promisify(execFile);
const licenseStoreFile = "license.dat";

let cachedMachineId;
let cachedStatus;

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="), "base64");
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function getWindowsMachineGuid() {
  if (process.platform !== "win32") {
    return "";
  }

  try {
    const { stdout } = await execFileAsync("reg", [
      "query",
      "HKLM\\SOFTWARE\\Microsoft\\Cryptography",
      "/v",
      "MachineGuid",
    ]);
    const match = stdout.match(/MachineGuid\s+REG_SZ\s+([^\r\n]+)/i);
    return match ? match[1].trim() : "";
  } catch {
    return "";
  }
}

async function getHardwareFingerprint() {
  if (cachedMachineId) {
    return cachedMachineId;
  }

  const machineGuid = await getWindowsMachineGuid();
  const networkIds = os.networkInterfaces();
  const macs = Object.values(networkIds)
    .flat()
    .filter(Boolean)
    .map((iface) => iface.mac)
    .filter((mac) => mac && mac !== "00:00:00:00:00:00")
    .sort()
    .join("|");

  cachedMachineId = hash([
    appName,
    os.hostname(),
    os.platform(),
    os.arch(),
    machineGuid,
    macs,
  ].join("|"));

  return cachedMachineId;
}

function getLicenseStorePath() {
  return path.join(app.getPath("userData"), licenseStoreFile);
}

async function readStoredLicense() {
  try {
    const encrypted = await fs.readFile(getLicenseStorePath());
    const json = safeStorage.decryptString(encrypted);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function writeStoredLicense(record) {
  await fs.mkdir(app.getPath("userData"), { recursive: true });
  const encrypted = safeStorage.encryptString(JSON.stringify(record));
  await fs.writeFile(getLicenseStorePath(), encrypted, { mode: 0o600 });
}

async function clearLicense() {
  cachedStatus = null;
  await fs.rm(getLicenseStorePath(), { force: true });
  return { ok: true };
}

function assertHttpsLicenseEndpoint() {
  if (!licenseApiUrl) {
    throw new Error("License server URL is not configured.");
  }

  const parsed = new URL(licenseApiUrl);
  if (parsed.protocol !== "https:") {
    throw new Error("License server URL must use HTTPS.");
  }
}

function verifySignedLicenseToken(token, expectedMachineId) {
  if (!licensePublicKeyPem) {
    throw new Error("License public key is not configured.");
  }

  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    throw new Error("License token format is invalid.");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = JSON.parse(base64UrlDecode(encodedHeader).toString("utf8"));
  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
  const signedData = Buffer.from(`${encodedHeader}.${encodedPayload}`, "utf8");
  const signature = base64UrlDecode(encodedSignature);

  let validSignature = false;
  if (header.alg === "EdDSA") {
    validSignature = crypto.verify(null, signedData, licensePublicKeyPem, signature);
  } else if (header.alg === "RS256") {
    validSignature = crypto.verify("RSA-SHA256", signedData, licensePublicKeyPem, signature);
  } else {
    throw new Error("License token algorithm is not allowed.");
  }

  if (!validSignature) {
    throw new Error("License token signature is invalid.");
  }

  const now = Date.now();
  const expiresAtMs = Date.parse(payload.expiresAt || "");
  if (!Number.isFinite(expiresAtMs) || expiresAtMs + maxLicenseClockSkewMs <= now) {
    throw new Error("License is expired.");
  }

  if (payload.machineId !== expectedMachineId) {
    throw new Error("License is bound to a different machine.");
  }

  if (payload.product && payload.product !== appName) {
    throw new Error("License token is for a different product.");
  }

  return {
    licenseId: payload.licenseId || "",
    machineId: payload.machineId,
    expiresAt: new Date(expiresAtMs).toISOString(),
    product: payload.product || appName,
  };
}

async function verifyOnline(licenseKey, machineId) {
  assertHttpsLicenseEndpoint();

  const response = await fetch(licenseApiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-kishok-client": "desktop",
    },
    body: JSON.stringify({
      licenseKey,
      machineId,
      product: appName,
      appVersion: app.getVersion(),
    }),
  });

  if (!response.ok) {
    throw new Error(`License server rejected activation (${response.status}).`);
  }

  const result = await response.json();
  if (!result || result.ok !== true || typeof result.token !== "string") {
    throw new Error(result?.reason || "License server response is invalid.");
  }

  return verifySignedLicenseToken(result.token, machineId);
}

async function activateLicense(licenseKey) {
  try {
    const cleanKey = String(licenseKey || "").trim();
    if (!cleanKey || cleanKey.length > 512) {
      throw new Error("License key is invalid.");
    }

    const machineId = await getHardwareFingerprint();
    const license = await verifyOnline(cleanKey, machineId);

    await writeStoredLicense({
      tokenLicense: license,
      licenseKeyHash: hash(cleanKey),
      verifiedAt: new Date().toISOString(),
    });

    cachedStatus = { ok: true, ...license };
    return cachedStatus;
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "License activation failed.",
    };
  }
}

async function getLicenseStatus(options = {}) {
  if (cachedStatus && !options.forceOnline) {
    return cachedStatus;
  }

  const machineId = await getHardwareFingerprint();
  const stored = await readStoredLicense();
  if (!stored?.tokenLicense) {
    cachedStatus = { ok: false, reason: "No license is activated on this machine." };
    return cachedStatus;
  }

  try {
    const license = stored.tokenLicense;
    if (license.machineId !== machineId) {
      throw new Error("Stored license belongs to a different machine.");
    }

    const expiresAtMs = Date.parse(license.expiresAt || "");
    if (!Number.isFinite(expiresAtMs) || expiresAtMs + maxLicenseClockSkewMs <= Date.now()) {
      throw new Error("Stored license is expired.");
    }

    if (options.forceOnline) {
      if (!stored.licenseKeyHash) {
        throw new Error("Stored license cannot be refreshed online.");
      }

      assertHttpsLicenseEndpoint();
      const response = await fetch(licenseApiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-kishok-client": "desktop",
        },
        body: JSON.stringify({
          licenseKeyHash: stored.licenseKeyHash,
          machineId,
          product: appName,
          appVersion: app.getVersion(),
          refresh: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Online license verification failed (${response.status}).`);
      }

      const result = await response.json();
      if (!result || result.ok !== true || typeof result.token !== "string") {
        throw new Error(result?.reason || "Online license verification failed.");
      }

      const refreshed = verifySignedLicenseToken(result.token, machineId);
      await writeStoredLicense({
        tokenLicense: refreshed,
        licenseKeyHash: stored.licenseKeyHash,
        verifiedAt: new Date().toISOString(),
      });
      cachedStatus = { ok: true, ...refreshed };
      return cachedStatus;
    }

    cachedStatus = { ok: true, ...license };
    return cachedStatus;
  } catch (error) {
    cachedStatus = {
      ok: false,
      reason: error instanceof Error ? error.message : "License is invalid.",
    };
    return cachedStatus;
  }
}

async function requireValidLicense() {
  const status = await getLicenseStatus({ forceOnline: app.isPackaged });
  if (!status.ok) {
    throw new Error(status.reason || "License is invalid.");
  }
  return status;
}

module.exports = {
  activateLicense,
  clearLicense,
  getHardwareFingerprint,
  getLicenseStatus,
  requireValidLicense,
};
