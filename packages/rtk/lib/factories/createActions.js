import { addDebug } from "./utils";
import { symbols } from "./constants";
import { createAction } from "@reduxjs/toolkit";

const createActionsFactory = (name) => (actionsMap) => {
  const actions = Object.entries(actionsMap).reduce((acc, [type, prepareAction]) => {
    symbols.actions[name] = symbols.actions[name] || {};

    const actionId = `${name}/${type}`;

    // actions ou liste des actions créer pour type/prepareAction
    const extended = {};

    if (typeof prepareAction === "function") {
      symbols.actions[name][type] = actionId;
      extended[type] = createAction(actionId, prepareAction);
    } else {
      const main = createAction(actionId, () => {
        throw new Error(`default action for '${actionId}' is not defined`);
      });
      extended[type] = main;
      for (const [key, actionDef] of Object.entries(prepareAction)) {
        // 'default' écrase l'erreur ci-dessus
        const subType = key === "default" ? actionId : `${name}/${key}`;
        symbols.actions[name][subType] = actionId;
        extended[subType] = createAction(actionId, actionDef);
      }
    }
    return {
      ...acc,
      ...extended,
    };
  }, {});
  addDebug(name)("actions", actions);
  return actions;
};

export { createActionsFactory };
