import rtk, { addListenerAction } from '@lpr/rtk';
import { createActionsHook } from '@lpr/rtk/react';
import { name } from './constants';

const { createActions, createEvents } = rtk(name);

import { register, isRegistered, getResources } from '../documents/store';

const documentEvents = createEvents({
  /* Resource */

  CREATE: ({ resourceIdentifier, storeKey }) => ({
    resourceId: storeKey,
    ...resourceIdentifier,
  }),
  DESTROY: ({ resourceIdentifier, storeKey }) => ({
    resourceId: storeKey,
    ...resourceIdentifier,
  }),
  SYNC: ({ resourceIdentifier, storeKey }, diff) => ({
    resourceId: storeKey,
    ...resourceIdentifier,
    diff,
  }),

  /* Document */

  CLOSE: ({ id }) => ({ id }),
  DELETE: ({ id }) => ({ id }),
  FULFILLED: ({ id }) => ({ id }),
  MODIFY: ({ id }) => ({ id }),
  OPEN: ({ id }) => ({ id }),
  PENDING: ({ id }) => ({ id }),
  PERSIST: ({ id }) => ({ id }),
  REFRESH: ({ id }, diff) => ({ id, diff }),
  REJECTED: ({ id }) => ({ id }),

  SUBSCRIBE: ({ id }) => ({ id }),
  UNSUBSCRIBE: ({ id }) => ({ id }),
});

const documentApi = createActions({
  subscribe:
    ({ doc }) =>
    (dispatch) => {
      if (!isRegistered(doc)) {
        register(doc);
        doc.open({
          /* Resource */

          onResourceDestroy: (resource) => dispatch(DESTROY_EVENT(resource)),
          onResourceSync: (resource, diff) => dispatch(SYNC_EVENT(resource, diff)),

          /* Document */

          onDocClose: (docEvent) => dispatch(CLOSE_EVENT(docEvent)),
          onDocFulfiled: (docEvent) => dispatch(FULFILLED_EVENT(docEvent)),
          onDocModify: (docEvent, changes) => dispatch(MODIFY_EVENT(docEvent, changes)),
          onDocOpen: (docEvent) => dispatch(OPEN_EVENT(docEvent)),
          onDocPending: (docEvent) => dispatch(PENDING_EVENT(docEvent)),
          onDocPersist: (docEvent) => dispatch(PERSIST_EVENT(docEvent)),
          onDocRejected: (docEvent) => dispatch(REJECTED_EVENT(docEvent)),
        });
      }
      dispatch(SUBSCRIBE_EVENT(doc));
      return () => dispatch(unsubscribe({ doc }));
    },

  unsubscribe:
    ({ doc }) =>
    (dispatch) => {
      dispatch(UNSUBSCRIBE_EVENT(doc));
    },

  listen:
    (predicate = () => false, effect = () => {}) =>
    (dispatch) => {
      return dispatch(
        addListenerAction({
          predicate,
          effect,
        })
      );
    },
});

// RTK-AUTOEXPORT
// ---- createEvents ---------
export const {
  CREATE_EVENT,
  DESTROY_EVENT,
  SYNC_EVENT,
  CLOSE_EVENT,
  DELETE_EVENT,
  FULFILLED_EVENT,
  MODIFY_EVENT,
  OPEN_EVENT,
  PENDING_EVENT,
  PERSIST_EVENT,
  REFRESH_EVENT,
  REJECTED_EVENT,
  SUBSCRIBE_EVENT,
  UNSUBSCRIBE_EVENT,
} = documentEvents;

export const useDocumentEvents = createActionsHook(documentEvents);
// ---- createActions ---------
export const { subscribe, unsubscribe, listen } = documentApi;

export const useDocumentApi = createActionsHook(documentApi);
