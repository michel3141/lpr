import rtk from "@lpr/rtk";
import { createActionsHook } from "@lpr/rtk/react";
import { name } from "./constants";
import { selectLinks, selectSaveOptions } from "./selectors";

const { createActions, createEvents } = rtk(name);

import { setDocument, getDocument, getRequest, updateResourceInDocument } from "./documentStore";
import { getEndpoint, getObjectFor } from "./adapter";

const documentEvents = createEvents({
  OPEN: (subscriberId, { saveOptions, updateOptions } = {}) => ({
    subscriberId,
    saveOptions,
    updateOptions,
  }),
  RESOURCES: (subscriberId, resources) => ({
    subscriberId,
    resources: [resources].flat(),
  }),
  CLOSE: (subscriberId) => ({ subscriberId }),

  UPDATE: (subscriberId) => ({ subscriberId }),

  SAVE_OPTIONS: (x) => x,
  UPDATE_OPTIONS: (x) => x,
});

const documentApi = createActions({
  create:
    ({ subscriberId, endpoint, params } = {}) =>
    (dispatch) => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const request = () => getEndpoint(endpoint).create(params);
      dispatch(fetch({ subscriberId, request }));
    },

  open:
    ({ subscriberId, data, raw } = {}) =>
    (dispatch) => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const request = () => getObjectFor({ data, raw });
      dispatch(fetch({ subscriberId, request }));
    },

  find:
    ({ subscriberId, endpoint, id, fetcher }) =>
    (dispatch) => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const request = () => getEndpoint(endpoint).find(id, fetcher);
      dispatch(fetch({ subscriberId, request }));
    },
  findSingle:
    ({ subscriberId, endpoint, fetcher }) =>
    (dispatch) => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const request = () => getEndpoint(endpoint).findSigle(fetcher);
      dispatch(fetch({ subscriberId, request }));
    },
  first:
    ({ subscriberId, endpoint, fetcher }) =>
    (dispatch) => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const request = () => getEndpoint(endpoint).first(fetcher);
      dispatch(fetch({ subscriberId, request }));
    },
  all:
    ({ subscriberId, endpoint, fetcher }) =>
    (dispatch) => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const request = () => getEndpoint(endpoint).all(fetcher);
      dispatch(fetch({ subscriberId, request }));
    },

  /* Async */

  fetch: async ({ subscriberId, request }, { dispatch }) => {
    const doc = await request();
    setDocument(subscriberId, doc, request);
    return { subscriberId };
  },

  /////////////

  refetch:
    ({ subscriberId }) =>
    (dispatch) => {
      const request = getRequest(subscriberId);
      dispatch(fetch({ subscriberId, request }));
    },

  update: async ({ subscriberId, changes = {} }, { dispatch, getState }) => {
    const { resourceIds } = getDocument(subscriberId);
    const links = resourceIds.flatMap((resourceId) => selectLinks(getState(), { resourceId }));
    links.forEach((link) => {
      updateResourceInDocument(link, changes);
    });
    return { subscriberId, changes };
  },

  save: async ({ subscriberId }, { getState, dispatch }) => {
    const doc = getDocument(subscriberId);
    const saveOptions = selectSaveOptions(getState(), subscriberId);

    const savedDoc = await doc.save(saveOptions);

    if (savedDoc) {
      setDocument(subscriberId, savedDoc, () => {
        console.warn("comment refresh ?");
        return savedDoc;
        // si old = create => find
        // si open renvoyer savedDoc
        // sinon, ne rien faire
      });
    }
    return { subscriberId, success: Boolean(savedDoc) };
  },

  destroy: async ({ subscriberId }, { getState, dispatch }) => {
    const doc = getDocument(subscriberId);
    await doc.destroy();
    return { subscriberId };
  },
});

// RTK-AUTOEXPORT
// ---- createEvents ---------
export const {
  OPEN_EVENT,
  RESOURCES_EVENT,
  CLOSE_EVENT,
  UPDATE_EVENT,
  SAVE_OPTIONS_EVENT,
  UPDATE_OPTIONS_EVENT,
} = documentEvents;

export const useDocumentEvents = createActionsHook(documentEvents);
// ---- createActions ---------
export const { create, open, find, findSingle, first, all, fetch, update, save, destroy } =
  documentApi;

export const useDocumentApi = createActionsHook(documentApi);
