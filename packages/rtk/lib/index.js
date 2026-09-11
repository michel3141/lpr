import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
  isAnyOf,
  addListener as addListenerAction,
  removeListener as removeListenerAction,
  clearAllListeners as clearAllListenersAction,
} from "@reduxjs/toolkit";
import { createStore } from "./createStore";
import {
  reducers,
  symbols /* listenerMiddleware as XXX no magical listener import */,
} from "./constants";
import { boot } from "../actions";

import { createSelectors } from "./createSelectors";

import { addDebug } from "./utils";

export { addListenerAction, removeListenerAction, clearAllListenersAction };

const addListener = (actionCreator, baseEffect, logger = console.log) => {
  const listenerMiddleware = [];
  const effect = (action, thunkApi) => {
    if (logger) {
      logger(`triggered '${action.type}'`);
    }
    baseEffect(action, thunkApi);
  };
  if (!actionCreator) {
    logger("Something is wrong in addListener");
    throw new Error("Something is wrong in addListener");
  }
  if (Array.isArray(actionCreator)) {
    symbols.listeners.add(actionCreator.map((x) => x.toString()).join("|"));
    const thunkList = actionCreator
      .filter((action) => action.fulfilled)
      .map((action) => action.typePrefix);
    if (thunkList.length > 0) {
      throw new Error(
        `Use of a thunk instead of action inside addListener group: ${thunkList.join(", ")}`,
      );
    } else {
      listenerMiddleware.push({
        matcher: isAnyOf(...actionCreator),
        effect,
      });
    }
  } else if (actionCreator.fulfilled) {
    throw new Error(`Thunk '${actionCreator.typePrefix}' as action in addListener`);
  } else if (actionCreator.type) {
    symbols.listeners.add(actionCreator);
    listenerMiddleware.push({ actionCreator, effect });
  } else {
    symbols.listeners.add("fn=" + actionCreator);
    listenerMiddleware.push({ matcher: actionCreator, effect });
  }
  return listenerMiddleware;
};

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

    createReducer: (initialState, actionsMap, actionMatchers, defaultCaseReducer) => {
      actionMatchers = actionMatchers || [];

      const listeners = [];
      Object.entries(initialState)
        .filter(([key, value]) => typeof value === "object" && value?._persisted)
        .forEach(([key, { _persisted: createPersistence }]) => {
          const { value, actionMatcher, listenerOptions } = createPersistence(name, key);
          initialState[key] = value;
          /* XXX.startListening(listenerOptions); no magical listeners import */
          listeners.push(listenerOptions);
          // for reducers
          actionMatchers.push(actionMatcher);
        });

      reducers[name] = createReducer(initialState, (builder) => {
        for (const action in actionsMap) {
          if (!action) {
            throw new Error(`null action in '${name}' reducer`);
          }
          if (action.indexOf("actionCreator") > 0) {
            throw new Error(`thunk used as action in '${name}' reducer`);
          }
          symbols.reducers[name].add(action);
          builder.addCase(action, actionsMap[action]);
        }
        for (const actionMatcher of actionMatchers) {
          builder.addMatcher(...actionMatcher);
        }
        builder.addDefaultCase(defaultCaseReducer);
      });
      reducers[name].persistenceListeners = listeners;
      return reducers[name];
    },

    createListener: (listenersMap, listenerMatchers) => {
      console.warn("rtk.createListener est obsolète. Utiliser rtk.addListener");
      for (const listener in listenersMap) {
        this.addListener(listener, listenersMap[listener]);
      }
    },
    addListener: (actionCreator, effect) => {
      console.warn("rtk(name).addListener est obsolète. Use :\nimport {addListener} from 'rtk'");
      return addListener(actionCreator, effect);
    },

    createSelectors: createSelectors(name),

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

const onBoot = (effect, bootTag) =>
  addListener(
    boot,
    (...args) => {
      // à revoir => on est vraiment booted que quand tous les listeners ont répondu
      // if (symbols.booted) {
      //   return;
      // }
      // symbols.booted = true;
      effect(...args);
    },
    bootTag,
  );

export default rtk;

export {
  createStore,
  createAction,
  createSelector, // faut-il encore le garder ? pourquoi ?
  reducers,
  symbols,
  addListener,
  onBoot,
  /* XXX as listener, no magical listener import */
  payload,
  _, // payload wrapper
  no_, // no args payload wrapper
  filter,
  toggle,
  update,
  set,
  select, // à supprimer
};
