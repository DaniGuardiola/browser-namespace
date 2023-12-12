import fs from "node:fs/promises";
import path from "node:path";

import { packageUp } from "package-up";
import pacote from "pacote";
import { temporaryDirectoryTask } from "tempy";

const README_DATA = `# Chrome types

This is an auto-generated directory containing the types for the Chrome extension API, downloaded from the \`@types/chrome\` package.

The root declaration file has been automatically patched to export a type named \`Chrome\` instead of declaring the global \`chrome\` namespace on \`window\`.

To re-download the types, run \`bun download-chrome-types\`.\n`;
const REPLACEMENT_REGEXP =
  /\/+\n\/+[ a-zA-Z]+\n\/+\ninterface Window {[\s\S]+?}/;
const REPLACEMENT = `////////////////////
// Public Type
////////////////////
export type Chrome = typeof chrome;`;

const packageJsonPath = await packageUp();
if (!packageJsonPath) throw new Error("package.json not found");
const rootDir = path.dirname(packageJsonPath);
const destDir = path.resolve(rootDir, "src/chrome-types");

await temporaryDirectoryTask(async (packageDir) => {
  console.log("Downloading @types/chrome package...");
  await pacote.extract("@types/chrome", packageDir);

  console.log("Copying and cleaning up...");
  await fs.rm(destDir, { recursive: true });
  await fs.cp(packageDir, destDir, { recursive: true });
  await Bun.write(path.resolve(destDir, "README.md"), README_DATA);
  await fs.rm(path.resolve(destDir, "package.json"));

  console.log("Patching declaration file...");
  const declaration = Bun.file(path.resolve(destDir, "index.d.ts"));
  const declarationData = await declaration.text();
  const newDeclarationData = declarationData.replace(
    REPLACEMENT_REGEXP,
    REPLACEMENT,
  );
  await Bun.write(declaration, newDeclarationData);

  console.log("Formatting with Prettier...");
  await Bun.spawn(["bun", "prettier", "--write", destDir], {
    stdout: "inherit",
  }).exited;

  console.log("Done!");
});
