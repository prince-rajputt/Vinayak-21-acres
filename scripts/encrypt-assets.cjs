"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const projectRoot = path.join(__dirname, "..");
const sourceRoot = path.join(projectRoot, "protected-assets");
const distRoot = path.join(projectRoot, "dist");
const outputRoot = path.join(distRoot, "protected-assets");
const manifestPath = path.join(distRoot, "protected-assets-manifest.json");

const mimeByExt = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".pdf", "application/pdf"],
  [".mp4", "video/mp4"],
  [".json", "application/json"],
  [".txt", "text/plain"],
]);

function getAssetKey() {
  const key = Buffer.from(process.env.KISHOK_ASSET_KEY_B64 || "", "base64");
  if (key.length !== 32) {
    throw new Error("KISHOK_ASSET_KEY_B64 must be a base64-encoded 32-byte key when protected assets exist.");
  }

  return key;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && entry.name !== ".gitkeep") {
      files.push(fullPath);
    }
  }

  return files;
}

function encryptAesGcm(buffer, key, aad) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

async function main() {
  await fs.mkdir(outputRoot, { recursive: true });

  if (!await exists(sourceRoot)) {
    await fs.writeFile(manifestPath, JSON.stringify({ assets: {} }, null, 2));
    console.log("No protected-assets directory found. Wrote empty protected asset manifest.");
    return;
  }

  const files = await walk(sourceRoot);
  if (files.length === 0) {
    await fs.writeFile(manifestPath, JSON.stringify({ assets: {} }, null, 2));
    console.log("No protected assets found. Wrote empty protected asset manifest.");
    return;
  }

  const key = getAssetKey();
  const manifest = { assets: {} };

  for (const filePath of files) {
    const relative = path.relative(sourceRoot, filePath).replace(/\\/g, "/");
    const encryptedRelative = `protected-assets/${relative}.enc`;
    const outPath = path.join(distRoot, encryptedRelative);
    const plaintext = await fs.readFile(filePath);
    const encrypted = encryptAesGcm(plaintext, key, relative);

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, encrypted);

    manifest.assets[relative] = {
      encryptedPath: encryptedRelative,
      mime: mimeByExt.get(path.extname(filePath).toLowerCase()) || "application/octet-stream",
      bytes: plaintext.length,
      sha256: crypto.createHash("sha256").update(plaintext).digest("hex"),
    };
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Encrypted ${files.length} protected asset(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
