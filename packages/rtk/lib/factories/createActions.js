import { addDebug } from '../utils';
import { symbols } from '../constants';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { mkAction } from './formaters';

/*
 * thunk signature
 * (...args) => (dispatch, getState, extra) => {
 *   // ...
 * };
 * extra est cette valeur :
 * configureStore({
 *  reducer,
 *  middleware: (getDefaultMiddleware) =>
 *    getDefaultMiddleware({
 *      thunk: {
 *        extraArgument: extra,
 *      },
 *    }),
 * });
 */

const isAsyncFunc = (def) => def?.constructor?.name === 'AsyncFunction';

const safePayload = (obj) => {
  if (obj === undefined) return undefined;

  const ancestors = new WeakSet();

  return JSON.parse(
    JSON.stringify(obj, function (_, value) {
      if (typeof value === 'bigint') return null;
      if (typeof value === 'function') return null;
      if (typeof value === 'symbol') return null;

      if (value !== null && typeof value === 'object') {
        if (ancestors.has(value)) {
          return null; // référence cyclique
        }

        ancestors.add(value);
      }

      return value;
    })
  );
};

const createThunk = (type, def) => {
  const begin = createAction(`${type}/begin`, (...args) => ({ payload: safePayload({ args }) }));
  const end = createAction(`${type}/end`, (response) => ({ payload: safePayload(response) }));
  // should not be listened nor reduced
  // only to debug redux flow
  // J'ai supprimé cette possibilité :
  // thunkCreator.begin=begin
  // thunkCreator.end=end
  // for life cycle : use async

  const thunkCreator =
    (...args) =>
    (dispatch, getState, extra) => {
      dispatch(begin(...args));

      let response;
      try {
        response = def(...args)(dispatch, getState, extra);
      } catch (error) {
        dispatch(end({ error }));
        throw error;
      }

      if (response && typeof response.then === 'function') {
        return response
          .then((result) => {
            dispatch(end(result));
            return result;
          })
          .catch((error) => {
            dispatch(end({ error }));
            throw error;
          });
      }

      dispatch(end(response));
      return response;
    };

  return thunkCreator;
};

const createActionsFactory = (name) => (actionsMap) => {
  symbols.actions[name] = symbols.actions[name] || {};

  const actions = {};

  Object.entries(actionsMap).forEach(([actionName, def]) => {
    const isAsync = isAsyncFunc(def);
    const actionId = mkAction(actionName);
    const actionType = `${name}/${actionId}`;
    actions[actionId] = isAsync ? createAsyncThunk(actionType, def) : createThunk(actionType, def);

    symbols.actions[name][actionId] = actionType;
  });

  addDebug(name)('actions', actions);
  return actions;
};

export { createActionsFactory };
