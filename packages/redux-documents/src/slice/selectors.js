import rtk from '@lpr/rtk';
import { createSelectorHooks } from '@lpr/rtk/react';
import { name } from './constants';
const { createSelectors } = rtk(name);

const selectors = createSelectors({
  document: [
    (state, doc) => state[name].documents[doc.id]?.deleted === true,
    (state, doc) => state[name].documents[doc.id]?.version,
    (deleted, version) => ({ deleted, version }),
  ],
  subscribed: (state, doc) => (state[name].documents[doc.id]?.subscriptions ?? 0) > 0,
});

// RTK-AUTOEXPORT
// ---- createSelectors ---------
export const { selectDocument, selectSubscribed } = selectors;
export const { useDocument, useSubscribed } = createSelectorHooks(selectors);
