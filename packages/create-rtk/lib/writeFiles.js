import fs from 'node:fs';
import path from 'node:path';

import { buildActions } from '../templates/actions.js';
import { buildConstants } from '../templates/constants.js';
import { buildGitIgnore } from '../templates/gitignore.js';
import { buildIndex } from '../templates/index.js';
import { buildListeners } from '../templates/listeners.js';
import { buildPackageJson } from '../templates/package.json.js';
import { buildReducer } from '../templates/reducer.js';
import { buildSelectors } from '../templates/selectors.js';
import { buildViteConfig } from '../templates/vite.config.js';
export function writeFiles(sliceName, options) {
  const files = {
    'actions.js': buildActions,
    'constants.js': buildConstants,
    '.gitignore': buildGitIgnore,
    'index.js': buildIndex,
    'listeners.js': buildListeners,
    'package.json': buildPackageJson,
    'reducer.js': buildReducer,
    'selectors.js': buildSelectors,
    'vite.config.js': buildViteConfig,
  };

  for (const [file, builder] of Object.entries(files)) {
    const content = builder(sliceName, options);

    if (options.verbose) {
      console.log('Write file ', file);
    }

    fs.writeFileSync(path.join(options.targetDir, file), content);
  }
}
