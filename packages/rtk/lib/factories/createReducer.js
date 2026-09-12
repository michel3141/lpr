import { createReducer } from "@reduxjs/toolkit";
import { reducers, symbols } from "../constants";

const createReducerFactory =
  (name) => (initialState, actionsMap, actionMatchers, defaultCaseReducer) => {
    symbols.reducers[name] = symbols.reducers[name] || new Set();

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
  };

export { createReducerFactory };
