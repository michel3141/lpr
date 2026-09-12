import { addDebug } from "../utils";
import { symbols } from "../constants";
import { camelize } from "inflected";
import { createSelector } from "@reduxjs/toolkit";

const mkSelect = (prop) => "select" + camelize(prop);
const normalizedSelectors = (selectors) =>
  Object.entries(selectors).reduce(
    (acc, [name, selector]) => ({
      ...acc,
      [mkSelect(name)]: selector,
    }),
    {},
  );

const createSelectorsFactory =
  (name) =>
  (selectorsMap = {}) => {
    symbols.selectors[name] = symbols.selectors[name] || new Set();

    const selectors = Object.entries(selectorsMap).reduce((acc, [selectorName, selector]) => {
      symbols.selectors[name].add(selectorName);
      const isArray = Array.isArray(selector);
      if (!isArray && typeof selector !== "function") {
        throw Error("depuis 1.1.1 constants selectors abandonnés");
        // if (selector === "default") {
        //   selector = (state) => state[name][camelize(selectorName, false)];
        // } else if (selector === "all") {
        //   selector = (state) => state[name];
        // } else {
        //   selector = (state) => state[name][selector];
        // }
      }
      return {
        ...acc,
        [selectorName]: isArray ? createSelector(...selector) : selector,
      };
    }, {});
    const newSelectors = normalizedSelectors(selectors);
    addDebug(name)("selectors", newSelectors);
    return newSelectors;
  };

export { createSelectorsFactory };
