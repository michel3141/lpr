import { toCamelCase } from '../lib/format.js';

export function buildActions(sliceName, options) {
  const { react } = options;
  const camelCase = toCamelCase(sliceName);
  return `import rtk, { /* _, no_ */ } from '@lpr/rtk';
${react ? '' : '// '}import { createActionsHook } from '@lpr/rtk/react';
import { name } from './constants';

const { createActions, createThunks } = rtk(name);

const ${camelCase}Actions = createActions({});

const ${camelCase}Api = createThunks({});
`;
}
