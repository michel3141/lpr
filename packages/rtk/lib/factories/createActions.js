import { addDebug } from "../utils";
import { symbols } from "../constants";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { mkAction } from "./formaters";

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

const isAsyncFunc = (def) => def?.constructor?.name === "AsyncFunction";

const createThunk = (type, def) => {
  const thunkCreator = (arg) => (dispatch, getState, extra) => {
    const response = def(arg)(dispatch, getState, extra);
    return { unwrap: () => Promise.resolve(response) };
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

  addDebug(name)("actions", actions);
  return actions;
};

export { createActionsFactory };
