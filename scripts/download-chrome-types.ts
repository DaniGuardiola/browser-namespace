import fs from "node:fs/promises";
import path from "node:path";

import { packageUp } from "package-up";
import pacote from "pacote";
import { temporaryDirectoryTask } from "tempy";

const PACKAGE_JSON_PATH = await packageUp();
if (!PACKAGE_JSON_PATH) throw new Error("package.json not found");
const ROOT_DIR = path.dirname(PACKAGE_JSON_PATH);
const DEST_DIR = path.resolve(ROOT_DIR, "src/chrome-types");

const README_DATA = `# Chrome types

This is an auto-generated directory containing the types for the Chrome extension API, downloaded from the \`@types/chrome\` package.

The root declaration file has been automatically patched to export a type named \`Chrome\` instead of declaring the global \`chrome\` namespace on \`window\`.

To re-download the types, run \`bun download-chrome-types\`.\n`;
const DECLARATION_HEADER = `/// <reference lib="dom" />
/// <reference lib="dom.iterable" />`;
const PATH_REFERENCE_REGEXP = /^\/\/\/ <reference path=".+\.d\.ts" \/>$/gm;
const REFERENCE_REGEXP = /^\/\/\/ <reference .+=".+" \/>$/gm;
const EXPORT_REPLACEMENT_REGEXP =
  /\/+\n\/+[ a-zA-Z]+\n\/+\ninterface Window {[\s\S]+?}/;
const EXPORT_REPLACEMENT = `////////////////////
// Public Type
////////////////////
export type Chrome = typeof chrome;`;
const EVAL_REGEXP = /export function eval/gm;
const EVAL_REPLACEMENT = `// @ts-expect-error This error is useless in this context
export function eval`;
const CHROME_CAST_DIR = path.resolve(DEST_DIR, "chrome-cast");
const HAR_FORMAT_DIR = path.resolve(DEST_DIR, "har-format");
const CONCAT_PATHS = [
  path.resolve(HAR_FORMAT_DIR, "index.d.ts"),
  path.resolve(DEST_DIR, "index.d.ts"),
  path.resolve(CHROME_CAST_DIR, "index.d.ts"),
];
const REMOVE_PATHS = [
  path.resolve(DEST_DIR, "index.d.ts"),
  path.resolve(DEST_DIR, "package.json"),
  CHROME_CAST_DIR,
  HAR_FORMAT_DIR,
];

await temporaryDirectoryTask(async (packageDir) => {
  console.log("Downloading @types/chrome package...");
  await pacote.extract("@types/chrome", packageDir);

  console.log("Copying and updating README...");
  await fs.rm(DEST_DIR, { recursive: true });
  await fs.cp(packageDir, DEST_DIR, { recursive: true });
  await Bun.write(path.resolve(DEST_DIR, "README.md"), README_DATA);

  console.log("Generating output file...");
  const destFile = Bun.file(path.resolve(DEST_DIR, "index.ts"));
  let output = "";
  for (const currentPath of CONCAT_PATHS) {
    output += await Bun.file(currentPath).text();
    output += "\n\n";
  }
  await Bun.write(destFile, output);

  console.log("Patching output file...");
  const references: string[] = [];
  output = `${DECLARATION_HEADER}\n${output}`
    .replace(EXPORT_REPLACEMENT_REGEXP, EXPORT_REPLACEMENT)
    .replaceAll(PATH_REFERENCE_REGEXP, "")
    .replaceAll(REFERENCE_REGEXP, (match) => {
      references.push(match);
      return "";
    })
    .replaceAll(EVAL_REGEXP, EVAL_REPLACEMENT);
  await Bun.write(destFile, `${references.join("\n")}\n\n${output}`);

  console.log("Removing unnecessary files...");
  for (const currentPath of REMOVE_PATHS)
    await fs.rm(currentPath, { recursive: true });

  console.log("Formatting with Prettier...");
  await Bun.spawn(["bun", "prettier", "--write", DEST_DIR], {
    stdout: "inherit",
  }).exited;

  console.log("Done!");
});
