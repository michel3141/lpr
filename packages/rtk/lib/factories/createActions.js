import { addDebug } from "../utils";
import { camelize } from "inflected";
import { symbols } from "../constants";
import { createAsyncThunk } from "@reduxjs/toolkit";

const mkAction = (actionName) => camelize(`${actionName}`, false);

const isAsyncFunc = (def) => def?.constructor?.name === "AsyncFunction";

const createActionsFactory = (name) => (actionsMap) => {
  symbols.actions[name] = symbols.actions[name] || {};

  const actions = {};

  Object.entries(actionsMap).forEach(([actionName, def]) => {
    const isAsync = isAsyncFunc(def);
    const actionId = mkAction(actionName);
    const actionType = `${name}/${actionId}`;
    actions[actionId] = isAsync ? createAsyncThunk(actionType, def) : def;

    symbols.actions[name][actionId] = actionType;
  });

  addDebug(name)("actions", actions);
  return actions;
};

export { createActionsFactory };
