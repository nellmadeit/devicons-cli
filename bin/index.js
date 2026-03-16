#!/usr/bin/env node

import fs from "fs";
import path from "path";
import process from "process";

const githubUser = "nellmadeit";
const repoName = "devicon-art";
const branchName = "main";

const metadataUrl = `https://raw.githubusercontent.com/${githubUser}/${repoName}/${branchName}/metadata.json`;
const rawBaseUrl = `https://raw.githubusercontent.com/${githubUser}/${repoName}/${branchName}/`;

const args = process.argv.slice(2);
const command = args[0];
const value = args[1];

async function fetchMetadata() {
  const response = await fetch(metadataUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata.json`);
  }

  return await response.json();
}

function ensureOutputFolder(folderName) {
  const outputPath = path.join(process.cwd(), folderName);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  return outputPath;
}

async function downloadFile(url, outputPath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed: ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function listIcons() {
  const metadata = await fetchMetadata();
  const icons = Object.keys(metadata);

  console.log("\nAvailable Icons:\n");

  icons.forEach((icon) => {
    console.log(`- ${icon}`);
  });

  console.log("");
}

async function getIcon(name) {
  if (!name) {
    console.log("Usage: devicons get <icon-name>");
    return;
  }

  const metadata = await fetchMetadata();
  const icon = metadata[name];

  if (!icon) {
    console.log(`Icon "${name}" not found.`);
    return;
  }

  const folder = ensureOutputFolder("devicons");

  const fileName = path.basename(icon.file);
  const outputPath = path.join(folder, fileName);
  const fileUrl = `${rawBaseUrl}${icon.file}`;

  await downloadFile(fileUrl, outputPath);

  console.log(`Downloaded ${name} → ${outputPath}`);
}

async function installAll() {
  const metadata = await fetchMetadata();
  const folder = ensureOutputFolder("devicons");

  const icons = Object.keys(metadata);

  for (const iconName of icons) {
    const icon = metadata[iconName];

    const fileName = path.basename(icon.file);
    const outputPath = path.join(folder, fileName);
    const fileUrl = `${rawBaseUrl}${icon.file}`;

    await downloadFile(fileUrl, outputPath);

    console.log(`Downloaded ${fileName}`);
  }

  console.log(`\nInstalled ${icons.length} icons.`);
}

function help() {
  console.log(`
DevIcons CLI

Commands:

devicons list
devicons get <icon-name>
devicons install-all

Examples:

devicons list
devicons get christarobinson
devicons install-all
`);
}

async function main() {
  try {
    if (!command) {
      help();
      return;
    }

    if (command === "list") {
      await listIcons();
      return;
    }

    if (command === "get") {
      await getIcon(value);
      return;
    }

    if (command === "install-all") {
      await installAll();
      return;
    }

    help();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();