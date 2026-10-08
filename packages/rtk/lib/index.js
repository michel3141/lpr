import { reducers, symbols } from './constants';

import {
  createActionsFactory,
  createEventsFactory,
  createReducerFactory,
  createSelectorsFactory,
} from './factories';

const rtk = (name) => {
  return {
    createEvents: createEventsFactory(name),
    createActions: createActionsFactory(name),
    createReducer: createReducerFactory(name),
    createSelectors: createSelectorsFactory(name),
    createSliceSelectors: createSelectorsFactory(name, { localState: true }),
  };
};

export default rtk;

export {
  addListener,
  onBoot,
  addListenerAction,
  removeListenerAction,
  clearAllListenersAction,
} from './listeners';

// faut-il encore les garder ? pourquoi ?
export { createAction, createSelector } from '@reduxjs/toolkit';
export { createStore } from './createStore';
export {
  reducers, // à laisser ici ? ou à importer depuis constants si besoin ?
  symbols, // à laisser ici ? ou à importer depuis constants si besoin ?
};
