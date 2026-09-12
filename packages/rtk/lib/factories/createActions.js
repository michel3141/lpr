import { addDebug } from "../utils";
import { symbols } from "../constants";
import { createAction } from "@reduxjs/toolkit";

const error = (actionId) => () => {
  throw new Error(`default action for '${actionId}' is not defined`);
};

const createActionsFactory = (name) => (actionsMap) => {
  symbols.actions[name] = symbols.actions[name] || {};

  const actions = {};

  const walk = (actionsMap, parentId = undefined) => {
    for (const [actionName, actionDef] of Object.entries(actionsMap)) {
      const actionId = parentId ?? `${name}/${actionName}`;

      if (typeof actionDef === "function") {
        actions[actionName] = createAction(actionId, actionDef);
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
