import rtk /* , { select } */ from '@lpr/rtk';
import { name } from './constants';
const { createSelectors } = rtk(name);

const selectors = createSelectors({
  item: (state, key, defaultValue) =>
    key in state[name].storage ? state[name].storage[key] : defaultValue,
  is_ready: (state) => state[name].ready,
  keys: (state) => state[name].keys,
});

// RTK-AUTOEXPORT
// ---- selectors ---------
export const { selectItem, selectIsReady, selectKeys } = selectors;
