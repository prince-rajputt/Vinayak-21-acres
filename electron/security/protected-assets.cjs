"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { app } = require("electron");
const { assetKeyBase64 } = require("./security-config.cjs");

const protectedRootName = "protected-assets";
const manifestFileName = "protected-assets-manifest.json";

function getDistRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "dist")
    : path.join(__dirname, "..", "..", "dist");
}

function getAssetKey() {
  const key = Buffer.from(assetKeyBase64, "base64");
  if (key.length !== 32) {
    throw new Error("KISHOK_ASSET_KEY_B64 must be a base64-encoded 32-byte key.");
  }

  return key;
}

function sanitizeRelativePath(relativePath) {
  const clean = String(relativePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const normalized = path.normalize(clean);

  if (!normalized || normalized.startsWith("..") || path.isAbsolute(normalized)) {
    throw new Error("Protected asset path is invalid.");
  }

  return normalized;
}

function decryptAesGcm(encryptedBuffer, key, aad) {
  if (encryptedBuffer.length < 28) {
    throw new Error("Protected asset payload is invalid.");
  }

  const iv = encryptedBuffer.subarray(0, 12);
  const tag = encryptedBuffer.subarray(12, 28);
  const ciphertext = encryptedBuffer.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

async function readProtectedAsset(relativePath) {
  const requestedPath = sanitizeRelativePath(relativePath);
  const distRoot = getDistRoot();
  const manifestPath = path.join(distRoot, manifestFileName);
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const entry = manifest.assets?.[requestedPath.replace(/\\/g, "/")];

  if (!entry || typeof entry.encryptedPath !== "string" || typeof entry.mime !== "string") {
    throw new Error("Protected asset is not registered.");
  }

  const encryptedRelativePath = sanitizeRelativePath(entry.encryptedPath);
  if (!encryptedRelativePath.replace(/\\/g, "/").startsWith(`${protectedRootName}/`)) {
    throw new Error("Protected asset manifest path is invalid.");
  }

  const encryptedPath = path.join(distRoot, encryptedRelativePath);
  const encryptedBuffer = await fs.readFile(encryptedPath);
  const plaintext = decryptAesGcm(encryptedBuffer, getAssetKey(), requestedPath.replace(/\\/g, "/"));

  return {
    mime: entry.mime,
    dataBase64: plaintext.toString("base64"),
  };
}

module.exports = {
  readProtectedAsset,
};
