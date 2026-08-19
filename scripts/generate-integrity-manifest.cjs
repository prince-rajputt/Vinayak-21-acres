"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const distRoot = path.join(__dirname, "..", "dist");
const manifestFileName = "integrity-manifest.json";
const manifestPath = path.join(distRoot, manifestFileName);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && entry.name !== manifestFileName && !entry.name.endsWith(".map")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function sha256File(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function main() {
  const files = await walk(distRoot);
  const manifest = {
    generatedAt: new Date().toISOString(),
    algorithm: "sha256",
    files: [],
  };

  for (const filePath of files.sort()) {
    manifest.files.push({
      path: path.relative(distRoot, filePath).replace(/\\/g, "/"),
      sha256: await sha256File(filePath),
    });
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Generated integrity manifest for ${manifest.files.length} file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
