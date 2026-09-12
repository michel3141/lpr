import { addDebug, join_ } from "../utils";
import { camelize } from "inflected";
import { symbols } from "../constants";
import { createAction } from "@reduxjs/toolkit";

const entityActions = (name, entityType = (x) => x) => {
  /*
   * selectById / selectBookById(state, id) → selects one book by its ID.
   * selectEntities / selectBookEntities → selects the entities lookup structure (Record<Id, Book>).
   * selectList / selectBookList → selects all books as an array.
   * selectIds / selectBookIds → selects the array of IDs.
   * selectCount/ selectBookCount → selects the number of books.
   */
  const mkName = (...def) => camelize(join_(...def), false);
  return {
    [mkName("add", name)]: (entity) => ({ payload: entityType(entity) }),
    [mkName("set", name, "List")]: (entities) => ({ payload: entities.map(entityType) }),
    [mkName("remove", name)]: (entity) => ({ payload: entityType(entity) }),
    [mkName("update", name)]: (entity) => ({ payload: entityType(entity) }),
  };
};

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

const createEntityActionsFactory = (name) => (entityName, entityType) =>
  createActionsFactory(name, { localState: true })(entityActions(entityName, entityType));

export { createActionsFactory, createEntityActionsFactory };
