import rtk from "@lpr/rtk";
import { createSelectorHooks } from "@lpr/rtk/react";
import { name } from "./constants";
const { createSelectors } = rtk(name);
import { getDocument } from "./documentStore";

const selectors = createSelectors({
  all: (state) => state[name],
  document: [
    (state, subscriberId, initialData) => state[name].documents[subscriberId], //memoize
    (state, subscriberId, initialData) => subscriberId,
    (state, subscriberId, initialData) => initialData,
    (doc, subscriberId, initialData) => {
      const status = doc ? doc.status : null;
      /*
       * destroying
       * dirty
       * error
       * pending
       * synced
       * updating
       */
      return {
        status,
        isLoading: ["pending", "updating", "destroying"].includes(status),
        isDirty: status === "dirty",
        isError: status === "error",
        isSync: status === "synced",
        data: getDocument(subscriberId, false)?.data ?? initialData,
        raw: getDocument(subscriberId, false)?.raw,
      };
    },
  ],
  links: [
    (state, { subscriberId, resourceId } = {}) => state[name].links,
    (state, { subscriberId, resourceId } = {}) => subscriberId,
    (state, { subscriberId, resourceId } = {}) => resourceId,
    (links, subscriberId, resourceId) =>
      links.filter(
        (link) =>
          (!subscriberId || link.subscriberId === subscriberId) &&
          (!resourceId || link.resourceId === resourceId),
      ),
  ],
  save_options: [
    (state, subscriberId, options = {}) => state[name][subscriberId]?.saveOptions,
    (state, subscriberId, options = {}) => options,
    (saveOptions, options) => ({ ...saveOptions, ...options }),
  ],
  update_options: [
    (state, subscriberId, options = {}) => state[name][subscriberId]?.updateOptions,
    (state, subscriberId, options = {}) => options,
    (updateOptions, options) => ({ ...updateOptions, ...options }),
  ],
});

// RTK-AUTOEXPORT
// ---- createSelectors ---------
export const { selectAll, selectDocument, selectLinks, selectSaveOptions, selectUpdateOptions } =
  selectors;
export const { useAll, useDocument, useLinks, useSaveOptions, useUpdateOptions } =
  createSelectorHooks(selectors);
