import fs from "node:fs";
import path from "node:path";
import { writeFiles } from "./writeFiles.js";
import { initializeProject } from "./initializeProject.js";

export function createProject(sliceName, options) {
  const { react, verbose, init } = options;
  // .cwd() est correct à partir de pnpm 12
  // curl -fsSL https://get.pnpm.io/install.sh | sh -
  const targetDir = path.resolve(process.cwd(), sliceName);

  if (fs.existsSync(targetDir)) {
    console.error(`Error: directory "${targetDir}" already exists`);
    process.exit(1);
  } else {
    console.log(`Writing to directory "${targetDir}";`);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  writeFiles(sliceName, { ...options, targetDir });

  if (init) {
    initializeProject(sliceName, { ...options, targetDir });
  }

  if (verbose) {
    console.log("Generated slice:", sliceName);
    console.log("React mode:", react ? "On" : "Off");
  }
}
