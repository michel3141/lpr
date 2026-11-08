export function buildSelectors(sliceName, options) {
  const { react } = options;
  return `import rtk from '@lpr/rtk';
${react ? '' : '// '}import { createSelectorHooks } from '@lpr/rtk/react';
import { name } from './constants';
const { createSelectors } = rtk(name);

const selectors = createSelectors({
});
`;
}
