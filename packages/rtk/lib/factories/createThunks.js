import { addDebug } from "./utils";
import { symbols } from "./constants";
import { createAsyncThunk } from "@reduxjs/toolkit";

const createThunksFactory =
  (name) =>
  (thunksMap = {}) => {
    symbols.actions[name] = symbols.actions[name] || {};

    Object.keys(thunksMap).forEach(
      (thunkName) => (symbols.actions[name][thunkName] = `api-${name}/${thunkName}:thunk`),
    );
    const newThunks = Object.entries(thunksMap).reduce((acc, [thunkName, thunkDef]) => {
      const thunk = createAsyncThunk(`api-${name}/${thunkName}`, thunkDef);
      return {
        ...acc,
        [thunkName]: thunk,
      };
    }, {});
    addDebug(name)("thunks", newThunks);
    return newThunks;
  };

export { createThunksFactory };
