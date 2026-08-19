"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const manifestFileName = "integrity-manifest.json";

async function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  const handle = await fs.open(filePath, "r");

  try {
    for await (const chunk of handle.createReadStream()) {
      hash.update(chunk);
    }
  } finally {
    await handle.close();
  }

  return hash.digest("hex");
}

async function verifyApplicationIntegrity(distRoot) {
  const manifestPath = path.join(distRoot, manifestFileName);
  let manifest;

  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`Integrity manifest is missing or unreadable: ${error.message}`);
  }

  if (!manifest || manifest.algorithm !== "sha256" || !Array.isArray(manifest.files)) {
    throw new Error("Integrity manifest has an invalid format.");
  }

  for (const entry of manifest.files) {
    if (!entry || typeof entry.path !== "string" || typeof entry.sha256 !== "string") {
      throw new Error("Integrity manifest contains an invalid entry.");
    }

    const normalizedRelativePath = path.normalize(entry.path);
    if (normalizedRelativePath.startsWith("..") || path.isAbsolute(normalizedRelativePath)) {
      throw new Error("Integrity manifest contains an unsafe path.");
    }

    const filePath = path.join(distRoot, normalizedRelativePath);
    const actual = await sha256File(filePath);
    if (actual !== entry.sha256) {
      throw new Error(`Packaged file integrity check failed: ${entry.path}`);
    }
  }

  return true;
}

module.exports = {
  verifyApplicationIntegrity,
};
