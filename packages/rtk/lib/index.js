import { reducers, symbols } from "./constants";

import {
  createActionsFactory,
  createThunksFactory,
  createReducerFactory,
  createSelectorsFactory,
} from "./factories";

import { sup0 } from "./utils";

const rtk = (name) => {
  return {
    createListener: () => sup0("createListener est supprimé. Utiliser addListener"),
    addListener: () =>
      sup0("rtk(name).addListener est supprimé. Use : import {addListener} from 'rtk'"),

    createActions: createActionsFactory(name),
    createThunks: createThunksFactory(name),
    createReducer: createReducerFactory(name),
    createSelectors: createSelectorsFactory(name),
    createSliceSelectors: createSelectorsFactory(name, { localState: true }),
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

// faut-il encore les garder ? pourquoi ?
export { createAction, createSelector } from "@reduxjs/toolkit";
export { createStore } from "./createStore";
export {
  reducers, // à laisser ici ? ou à importer depuis constants si besoin ?
  symbols, // à laisser ici ? ou à importer depuis constants si besoin ?
  payload,
  _, // payload wrapper
  no_, // no args payload wrapper à supprimer
  filter,
  toggle,
  select, // à supprimer
};
