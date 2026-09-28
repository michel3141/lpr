import rtk from '@lpr/rtk';
import { name } from './constants';
import { OPEN_EVENT, UPDATE_EVENT, CLOSE_EVENT, RESOURCES_EVENT } from './actions';
import { fetch, save, destroy } from './actions';

const { createReducer } = rtk(name);

const initialState = {
  documents: {},
  links: [],
};

/*
 * Machine à états
 *
 *                    ┌──────────────┐
 *                    │    opened    │
 *                    └──────┬───────┘
 *                           │
 *                      UPDATE_EVENT
 *                           │
 *                           ▼
 *                      ┌─────────┐
 *                      │  dirty  │
 *                      └────┬────┘
 *                           │
 *                      save.pending
 *                           │
 *                           ▼
 *                      ┌─────────┐
 *                      │ syncing │
 *                      └────┬────┘
 *                           │
 *                 ┌─────────┴─────────┐
 *                 │                   │
 *          save.fulfilled        save.rejected
 *           success=true              │
 *                 │                   ▼
 *                 ▼                  error
 *              synced
 *
 *
 * fetch.pending → pending → fetch.fulfilled → synced
 *
 * destroy.pending → destroying → destroy.fulfilled → CLOSE_EVENT
 *
 * Important :
 * - UPDATE_EVENT signifie uniquement que le document local a changé.
 * - Il ne permet pas de conclure que le document est dirty vis-à-vis du serveur.
 * - L'état de synchronisation avec le serveur est déterminé à partir du
 *   document Spraypaint (notamment via isDirty()).
 * - save.fulfilled avec success=false correspond à une erreur métier :
 *   la requête a abouti mais le document n'a pas été sauvegardé.
 * - save.rejected correspond à une erreur technique / exception.
 */

const assumeDoc = (state, subscriberId, from = 'reducer') => {
  const doc = state.documents[subscriberId];
  if (!doc) throw Error(`[reducer:${from}] document '${subscriberId}' n'existe pas`);
  return doc;
};

const setLinks = (state, subscriberId, resources) => {
  state.links = state.links.filter((link) => link.subscriberId !== subscriberId);

  state.links.push(
    ...resources.map((resourceId) => ({
      subscriberId,
      resourceId,
    }))
  );
};

const setFetchPending = (
  state,
  {
    type,
    meta: {
      arg: { subscriberId },
    },
  }
) => {
  const doc = assumeDoc(state, subscriberId, type);
  doc.status = 'pending';
  doc.error = null;
};

const setFetchFulfilled = (state, { type, payload: { subscriberId } }) => {
  const doc = assumeDoc(state, subscriberId, type);
  doc.status = 'synced';
  doc.error = null;
};

const setRejected = (
  state,
  {
    type,
    error: { name: errorName, message, stack },
    meta: {
      arg: { subscriberId },
    },
  }
) => {
  console.warn(
    stack
      .split('\n')
      .map((line) => line.replace(/\/.*\//, '').replace(/\?[^:]*:/, ' => '))
      .map((line) => `[${type}] ${line}`)
      .slice(0, 10)
      .join('\n')
  );

  const doc = assumeDoc(state, subscriberId, type);

  doc.status = 'error';
  doc.error = {
    name: errorName,
    message,
  };
};

export const reducer = createReducer(initialState, {
  [RESOURCES_EVENT]: (state, { payload: { subscriberId, resources } }) => {
    setLinks(state, subscriberId, resources);
  },

  [OPEN_EVENT]: (state, { payload: { subscriberId, updateOptions, saveOptions } }) => {
    const links = state.links.filter((link) => link.subscriberId === subscriberId);
    if (links.length > 0) {
      console.warn(links);
      throw Error(`Link non fermé pour '${subscriberId}'`);
    }

    state.documents[subscriberId] = {
      error: null,
      status: 'opened',
      saveOptions: saveOptions ?? {},
      updateOptions: updateOptions ?? {},
      version: 0,
    };
  },

  [UPDATE_EVENT]: (state, { type, payload: { subscriberId } }) => {
    const doc = assumeDoc(state, subscriberId, type);

    doc.status = 'dirty';
    doc.error = null;
    doc.version += 1;
  },

  [CLOSE_EVENT]: (state, { payload: { subscriberId } }) => {
    setLinks(state, subscriberId, []);

    delete state.documents[subscriberId];
  },

  [fetch.pending]: setFetchPending,
  [fetch.fulfilled]: setFetchFulfilled,
  [fetch.rejected]: setRejected,

  [save.pending]: (
    state,
    {
      type,
      meta: {
        arg: { subscriberId },
      },
    }
  ) => {
    const doc = assumeDoc(state, subscriberId, type);

    doc.status = 'updating';
    doc.error = null;
  },

  [save.fulfilled]: (state, { type, payload: { subscriberId, success } }) => {
    const doc = assumeDoc(state, subscriberId, type);

    if (success) {
      doc.status = 'synced';
      doc.error = null;
    } else {
      // Erreur métier : la requête a abouti mais le serveur
      // n'a pas accepté la sauvegarde.
      doc.status = 'error';
    }
  },

  [save.rejected]: setRejected,

  [destroy.pending]: (
    state,
    {
      type,
      meta: {
        arg: { subscriberId },
      },
    }
  ) => {
    const doc = assumeDoc(state, subscriberId, type);

    doc.status = 'destroying';
    doc.error = null;
  },

  [destroy.rejected]: setRejected,
});
