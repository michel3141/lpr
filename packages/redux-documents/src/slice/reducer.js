//   console.warn(
//     stack
//       .split('\n')
//       .map((line) => line.replace(/\/.*\//, '').replace(/\?[^:]*:/, ' => '))
//       .map((line) => `[${type}] ${line}`)
//       .slice(0, 10)
//       .join('\n')
//   );
import rtk from '@lpr/rtk';
import { name, initialDocumentState } from './constants';
import {
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
} from './actions';

const { createReducer } = rtk(name);

const initialState = {
  documents: {},
};

const assumeDocument = (state, id, from = 'reducer') => {
  const doc = state.documents[id];
  if (!doc) throw Error(`[reducer:${from}] doc '${id}' n'existe pas`);
  return doc;
};

const newVersion = (state, { type, payload: { id } }) => {
  const doc = assumeDocument(state, id, type);
  doc.version++;
};

export const reducer = createReducer(initialState, {
  [SUBSCRIBE_EVENT]: (state, { type, payload: { id } }) => {
    const doc = assumeDocument(state, id, type);
    doc.subscriptions++;
  },

  [UNSUBSCRIBE_EVENT]: (state, { type, payload: { id } }) => {
    const doc = assumeDocument(state, id, type);
    doc.subscriptions--;
  },

  [OPEN_EVENT]: (state, { payload: { id } }) => {
    state.documents[id] = { ...initialDocumentState, deleted: false };
  },

  [CLOSE_EVENT]: (state, { type, payload: { id } }) => {
    if (assumeDocument(state, id, type)) {
      delete state.documents[id];
    }
  },

  [DELETE_EVENT]: (state, { type, payload: { id } }) => {
    const doc = assumeDocument(state, id, type);
    doc.deleted = true;
  },

  [FULFILLED_EVENT]: newVersion,
  [MODIFY_EVENT]: newVersion,
  [PENDING_EVENT]: newVersion,
  [PERSIST_EVENT]: newVersion,
  [REFRESH_EVENT]: newVersion,
  [REJECTED_EVENT]: newVersion,
});
