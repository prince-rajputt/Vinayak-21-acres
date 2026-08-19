"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const JavaScriptObfuscator = require("javascript-obfuscator");

const distRoot = path.join(__dirname, "..", "dist");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function obfuscateFile(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  const result = JavaScriptObfuscator.obfuscate(source, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: true,
    disableConsoleOutput: true,
    identifierNamesGenerator: "hexadecimal",
    rotateStringArray: true,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 12,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.75,
    target: "browser",
  });

  await fs.writeFile(filePath, result.getObfuscatedCode(), "utf8");
}

async function main() {
  const files = await walk(distRoot);
  await Promise.all(files.map(obfuscateFile));
  console.log(`Obfuscated ${files.length} JavaScript bundle(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
