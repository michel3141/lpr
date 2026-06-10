import { configureStore, addListener } from '@reduxjs/toolkit';
// getDefaultMiddleware inclus redux-thunk
import {
  reducers as rtkReducers,
  listenerMiddleware,
  symbols,
} from './constants';
// import createLogger, { isDevMode } from '@lpr/logger';
const createLogger = (X) => () => console.log('TODO LOGGER IN REPOSITORY', X);
const isDevMode = true;

const logger = createLogger('rtk-createStore');

// import * as actions from '../z_actions';
// const thunks = Object.keys(actions)
//   .map((id) =>
//     id.endsWith('Thunks')
//       ? Object.values(actions[id]).map((thunk) => thunk.fulfilled.toString())
//       : [],
//   )
//   .flat();

export function createStore({
  preloadedState = {},
  reducers,
  middlewares = [],
  ignoredPaths = [],
  ignoredActions = [],
  ignoreActions = false,
  ignoredImmutables,
  serializableCheck = true,
  immutableCheck = true,
  rtkLogger,
  consoleLogger,
}) {
  const loggerMiddleware = (store) => (next) => (action) => {
    const log = (...args) => {
      if (rtkLogger?.type && rtkLogger.type !== action.type) {
        store.dispatch(rtkLogger(...args));
      }
      if (typeof consoleLogger === 'function') {
        consoleLogger(...args);
      }
    };

    log('DEBUG', 'ACTION', action);
    const result = next(action);
    log('DEBUG', 'END', action);

    return result;
  };
  const store = configureStore({
    preloadedState,
    reducer: { ...rtkReducers, ...reducers }, // accept object slices
    middleware: (getDefaultMiddleware) => [
      loggerMiddleware,
      listenerMiddleware.middleware,
      ...getDefaultMiddleware({
        serializableCheck: serializableCheck && {
          // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
          ignoredPaths,
          ignoredActions, // array
          ignoreActions, // boolean
        },
        immutableCheck: immutableCheck && {
          ignorePaths: ignoredImmutables || ignoredPaths,
        },
      }),
      ...middlewares,
    ], // accept array
    devTools: isDevMode,
    trace: isDevMode,
    // enhancers: window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  });

  if (isDevMode && ignoredPaths.length) {
    logger(['Ignore serializable state: ', ...ignoredPaths].join('\n  * '));
  }

  if (isDevMode && ignoredActions.length) {
    logger(['Ignore serializable actions: ', ...ignoredActions].join('\n  * '));
  }
  if (isDevMode) {
    logger('reducers', Object.keys({ ...rtkReducers, ...reducers }));
    logger('preloadedState', Object.keys(preloadedState));
    for (const rtkKey in rtkReducers) {
      for (const key in reducers) {
        if (key === rtkKey) {
          logger('WARNING', `duplicate key: '${key}'`);
        }
      }
    }
  }
  if (isDevMode) {
    [...symbols.listeners]
      .map((x) => (typeof x === 'string' ? x : x.toString()))
      .forEach((x) => console.log('Listening to:', x.replaceAll('|', ' | ')));
  }
  if (isDevMode) {
    //    store.dispatch(
    //      addListener({
    //        matcher: () => true,
    //        effect: ({ type }) => logger('[store]',type),
    //      }),
    //    );
    store.dispatch(
      addListener({
        matcher: ({ type }) => type.endsWith('/rejected'),
        effect: ({ type, error }) => {
          if (error.stack) {
            logger(
              [
                '... cut output ---',
                ...error.stack.split('\n').reverse().slice(-3),
              ].join('\n')
            );
          } else {
            logger(type, 'No error stack ??!?');
          }
          logger(type, error.message || 'No error message ??!?');
        },
      })
    );
  }
  if (isDevMode) {
    window.s = store.getState;
    window.d = store.dispatch;
  }
  return store;
}

export default createStore;
