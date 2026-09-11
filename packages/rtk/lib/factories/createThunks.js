import { addDebug } from "./utils";
import { symbols } from "./constants";
import { createAsyncThunk } from "@reduxjs/toolkit";

const mkThunkId = (name) => (thunkName) => `api-${name}/${thunkName}`;

const createThunksFactory =
  (name) =>
  (thunksMap = {}) => {
    symbols.actions[name] = symbols.actions[name] || {};

    const thunks = Object.entries(thunksMap).reduce((acc, [thunkName, thunkDef]) => {
      const thunkId = mkThunkId(name)(thunkName);
      const thunk = createAsyncThunk(thunkId, thunkDef);
      return {
        ...acc,
        [thunkName]: thunk,
      };
    }, {});
    addDebug(name)("thunks", thunks);
    return thunks;
  };

export { createThunksFactory };
