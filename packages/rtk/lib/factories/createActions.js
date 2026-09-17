import { addDebug, join_ } from "../utils";
import { camelize } from "inflected";
import { symbols } from "../constants";
import { createAction } from "@reduxjs/toolkit";

const error = (actionId) => () => {
  throw new Error(`default action for '${actionId}' is not defined`);
};

const createThunkAction = (type, f) => {
  const abortedType = `${type}/aborted`;
  const aborted = (payload) => ({ type: abortedType, payload });
  aborted.toString = () => `${type}/aborted`;

  const thunkActionCreator =
    (...args) =>
    (dispatch, getState) => {
      const thunk = f(...args);
      const thunkApi = { dispatch, getState };
      let response = undefined;
      const action = (payload) => (response = dispatch({ type, payload }));
      thunk(action, thunkApi);
      return response || dispatch(aborted());
    };
  thunkActionCreator.toString = () => type;
  thunkActionCreator.aborted = aborted;
  return thunkActionCreator;
};

const createActionsFactory = (name) => (actionsMap) => {
  symbols.actions[name] = symbols.actions[name] || {};

  const actions = {};

  const walk = (actionsMap, parentId = undefined) => {
    for (const [actionName, actionDef] of Object.entries(actionsMap)) {
      const actionId = parentId ?? `${name}/${actionName}`;

      if (typeof actionDef === "function") {
        let isThunk = false;
        try {
          isThunk = "function" === typeof actionsDef();
        } catch {}
        if (isThunk) {
          actions[actionName] = createThunkAction(actionId, actionDef);
        } else {
          actions[actionName] = createAction(actionId, actionDef);
        }
        symbols.actions[name][actionName] = actionId;
        continue;
      }

      const { default: defaultPrepare, ...nestedActions } = actionDef;
      walk({ ...nestedActions, [actionName]: defaultPrepare ?? error(actionId) }, actionId);
    }
  };

  walk(actionsMap);

  addDebug(name)("actions", actions);
  return actions;
};

export { createActionsFactory };
