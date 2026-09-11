import { createAction, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { createStore } from "./createStore";
import {
  reducers,
  symbols /* listenerMiddleware as XXX no magical listener import */,
} from "./constants";

import { createReducerFactory, createSelectorsFactory } from "./factories";

import { addDebug } from "./utils";

const rtk = (name) => {
  symbols.reducers[name] = symbols.reducers[name] || new Set();
  symbols.selectors[name] = symbols.selectors[name] || new Set();
  symbols.actions[name] = symbols.actions[name] || {};

  return {
    createActions: (actionsMap) => {
      const newActions = Object.entries(actionsMap).reduce((actions, [type, prepareAction]) => {
        const extended = {};
        if (typeof prepareAction === "function") {
          symbols.actions[name][type] = `${name}/${type}`;
          extended[type] = createAction(`${name}/${type}`, prepareAction);
          // extended[type].fulfilled = extended[type]
        } else {
          const main = createAction(`${name}/${type}`, () => {
            throw new Error(`default action for '${main}' is not defined`);
          });
          extended[type] = main;
          for (const key in prepareAction) {
            const subType = key === "default" ? type : key;
            symbols.actions[name][subType] = main;
            extended[subType] = createAction(
              `${main}` /* main peut être une action */,
              prepareAction[key],
            );
            // extended[subType].fulfilled = extended[subType]
          }
        }
        return {
          ...actions,
          ...extended,
        };
      }, {});
      addDebug(name)("actions", newActions);
      return newActions;
    },

    createReducer: createReducerFactory(name),
    createListener: (listenersMap, listenerMatchers) => {
      throw Error("depuis 1.1.1 createListener est supprimé. Utiliser addListener");
    },
    addListener: (actionCreator, effect) => {
      throw Error(
        "depuis 1.1.1 rtk(name).addListener est supprimé. Use :\nimport {addListener} from 'rtk'",
      );
    },

    createSelectors: createSelectorsFactory(name),

    createThunks: (thunksMap = {}) => {
      Object.keys(thunksMap).forEach(
        (thunkName) => (symbols.actions[name][thunkName] = `api-${name}/${thunkName}:thunk`),
      );
      const newThunks = Object.entries(thunksMap).reduce((acc, [thunkName, thunkDef]) => {
        const thunk = createAsyncThunk(`api-${name}/${thunkName}`, thunkDef);
        // est-ce vraiment une bonne idée ??
        // thunk.type = thunk.fulfilled.type;
        // thunk.toString = thunk.fulfilled.toString;
        return {
          ...acc,
          [thunkName]: thunk,
        };
      }, {});
      addDebug(name)("thunks", newThunks);
      return newThunks;
    },
  };
};

// actionPrepare
// alias pour faciliter la création d'un prepare payload
const _ = (value) => ({ payload: value });
const no_ = (value) => _();

// un prépare courant
const payload = (key) => (value) => (key ? _({ [key]: value }) : _(value));

// reducers
const filter = (state, { payload }) =>
  Object.keys(state)
    .filter((key) => key in { ...payload })
    .forEach((key) => (state[key] = payload[key]));

const toggle =
  (key) =>
  (
    state,
    { payload }, // payload is booleanOrUndefined
  ) =>
    typeof payload === "boolean" ? { ...state, [key]: payload } : { ...state, [key]: !state[key] };

const update = (key) => (state, action) =>
  key ? filter(state, _({ [key]: action.payload })) : filter(state, action);
const set = () => (state, action) => action.payload;

// selectors
const select = () => {
  throw Error("select n'est plus défini");
};

export default rtk;

export {
  addListener,
  onBoot,
  addListenerAction,
  removeListenerAction,
  clearAllListenersAction,
} from "./listeners";

export {
  createStore,
  createAction,
  createSelector, // faut-il encore le garder ? pourquoi ?
  reducers,
  symbols,
  payload,
  _, // payload wrapper
  no_, // no args payload wrapper
  filter,
  toggle,
  update,
  set,
  select, // à supprimer
};
