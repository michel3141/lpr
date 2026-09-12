import { addDebug } from "../utils";
import { symbols } from "../constants";
import { camelize } from "inflected";
import { createSelector } from "@reduxjs/toolkit";

const mkSelect = (prop) => `select${camelize(prop)}`;

const mapSlice =
  (name, selector) =>
  (state, ...args) =>
    selector(state[name], ...args);

const mapToSlice = (localState, name) => (selector) =>
  localState ? mapSlice(name, selector) : selector;

const createComposedSelector = (mapper, selectors) => {
  const inputs = selectors.slice(0, -1).map(mapper);

  const result = selectors.at(-1);

  return createSelector(inputs, result);
};

const createSelectorsFactory =
  (name, { localState = false } = {}) =>
  (selectorsMap = {}) => {
    symbols.selectors[name] ??= new Set();

    const mapToLocalState = mapToSlice(localState, name);

    const selectors = {};
    for (const [selectorName, selector] of Object.entries(selectorsMap)) {
      symbols.selectors[name].add(selectorName);
      const normalizedName = mkSelect(selectorName);

      if (typeof selector === "function") {
        selectors[normalizedName] = mapToLocalState(selector);
        continue;
      }

      if (Array.isArray(selector)) {
        selectors[normalizedName] = createComposedSelector(mapToLocalState, selector);
        continue;
      }

      throw new Error(
        "Depuis 1.1.1, les constantes selectors sont abandonnées",
        // if (selector === "default") {
        //   selector = (state) => state[name][camelize(selectorName, false)];
        // } else if (selector === "all") {
        //   selector = (state) => state[name];
        // } else {
        //   selector = (state) => state[name][selector];
        // }
      );
    }

    addDebug(name)("selectors", selectors);

    return selectors;
  };

export { createSelectorsFactory };
