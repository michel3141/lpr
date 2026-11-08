import rtk from '@lpr/rtk';
import { name } from './constants';
import { updateItem, init, reset } from './actions';
const { createReducer } = rtk(name);

const initialState = {
  storage: {},
  keys: [],
  ready: false,
};

export const reducer = createReducer(initialState, {
  [updateItem]: (state, { payload }) => {
    const { item } = payload;
    const [key, value] = item;
    state.storage[key] = value;
    if (!state.keys.includes(key)) {
      state.keys.push(key);
    }
  },
  [reset]: (state) => {
    state.storage = {};
    state.keys = [];
  },
  [init.fulfilled]: (state, { payload }) => {
    state.ready = true;
  },
});
