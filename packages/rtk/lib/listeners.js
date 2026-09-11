import { symbols } from "./constants";
import { boot } from "../actions";
import {
  isAnyOf,
  addListener as addListenerAction,
  removeListener as removeListenerAction,
  clearAllListeners as clearAllListenersAction,
} from "@reduxjs/toolkit";

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

const onBoot = (effect, logger = console.log) => addListener(boot, effect, logger);

export { addListenerAction, removeListenerAction, clearAllListenersAction };
export { addListener, onBoot };
