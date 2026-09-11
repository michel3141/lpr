import { addDebug } from "./utils";
import { symbols } from "./constants";
import { createAction } from "@reduxjs/toolkit";

const createActionsFactory = (name) => (actionsMap) => {
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
};

export { createActionsFactory };
