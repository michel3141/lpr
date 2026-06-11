import fs from 'node:fs';
import path from 'node:path';
import { writeFiles } from './writeFiles.js';

export function createProject(sliceName, options) {
  const { react, verbose } = options;
  const targetDir = path.resolve(process.cwd(), sliceName);

  if (fs.existsSync(targetDir)) {
    console.error(`Error: directory "${sliceName}" already exists`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  writeFiles(sliceName, { ...options, targetDir });

  if (verbose) {
    console.log('Generated slice:', sliceName);
    console.log('React mode:', react ? 'On' : 'Off');
  }
}
