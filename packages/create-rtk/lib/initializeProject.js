import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

function run(cmd, cwd) {
  execSync(cmd, {
    stdio: 'inherit',
    cwd,
  });
}

export function initializeProject(isliceName, options) {
  const { targetDir, verbose } = options;
  const cwd = path.resolve(process.cwd(), targetDir);

  if (!fs.existsSync(cwd)) {
    console.error(`Error: directory "${targetDir}" does not exist`);
    process.exit(1);
  }

  try {
    if (verbose) console.log('Running pnpm install...');
    run('pnpm install', cwd);
    run('pnpm rtk', cwd);
    run('pnpm p', cwd);

    if (verbose) console.log('Initializing git...');
    run('git init', cwd);
    // optionnel : git flow si présent
    if (verbose) console.log('Checking git-flow...');
    try {
      run('git flow init -d', cwd);
    } catch {
      if (verbose) {
        console.log('git flow not available, skipping');
      }
    }

    run('git add .', cwd);
    run("git commit -m 'initial commit'", cwd);

    if (verbose) console.log('Initialization complete');
  } catch (err) {
    console.error('Initialization failed');
    process.exit(1);
  }
}
