import { createAction, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { createStore } from "./createStore";
import { reducers, symbols } from "./constants";

import { createActionsFactory, createReducerFactory, createSelectorsFactory } from "./factories";

import { addDebug } from "./utils";

const rtk = (name) => {
  symbols.reducers[name] = symbols.reducers[name] || new Set();
  symbols.selectors[name] = symbols.selectors[name] || new Set();
  symbols.actions[name] = symbols.actions[name] || {};

  return {
    createListener: () => {
      throw Error("depuis 1.1.1 createListener est supprimé. Utiliser addListener");
    },
    addListener: () => {
      throw Error(
        "depuis 1.1.1 rtk(name).addListener est supprimé. Use : import {addListener} from 'rtk'",
      );
    },

    createActions: createActionsFactory(name),
    createReducer: createReducerFactory(name),

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
const no_ = () => console.warn("no_ est obsolète. Use explicit ()=>_()") || _();

// un prépare courant
const payload = (key) => (value) => (key ? _({ [key]: value }) : _(value));

// reducers
// intéressant ??
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

// supprimé depuis 1.1.1
// const update = (key) => (state, action) =>
//  key ? filter(state, _({ [key]: action.payload })) : filter(state, action);
// const set = () => (state, action) => action.payload;

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
  createAction, // faut-il encore le garder ? pourquoi ?
  createSelector, // faut-il encore le garder ? pourquoi ?
  reducers,
  symbols, // à laisser ici ? ou à importer depuis constants si besoin ?
  payload,
  _, // payload wrapper
  no_, // no args payload wrapper
  filter,
  toggle,
  select, // à supprimer
};
