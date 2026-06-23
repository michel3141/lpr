import { addListener } from '@lpr/rtk';
import createLogger from '@lpr/logger';
import { updateItem, init } from './actions';
const logger = createLogger(__filename);

// rtk createReducer hool

const persisted = (value) => ({
  _persisted(name, key, { listener } = {}) {
    logger(`${name}/${key} = default ${value}`);
    return {
      value,
      actionMatcher: actionMatcher(name, key),
      listenerOptions: listenerOptions(name, key),
    };
  },
});

// for reducers
const actionMatcher = (name, key) => [
  // item = [key, value]
  ({ type, payload }) =>
    type === updateItem.type && payload.item[0] === `${name}/${key}`,
  (state, { payload }) => {
    state[key] = payload.item[1];
  },
];

// for startListening
const listenerOptions = (name, key) => ({
  predicate: (action, currentState, previousState) =>
    currentState[name][key] !== previousState[name][key],
  effect: (action, { dispatch, getState }) =>
    dispatch(updateItem([`${name}/${key}`, getState()[name][key]])),
});

const onStorageReady = (effect, myLogger) => {
  addListener(init.fulfilled, effect, myLogger);
};

export { persisted, onStorageReady };
