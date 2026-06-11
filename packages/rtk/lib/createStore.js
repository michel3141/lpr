import {
  configureStore,
  addListener,
  createListenerMiddleware,
} from '@reduxjs/toolkit';
// getDefaultMiddleware inclus redux-thunk
import {
  /* reducers as rtkReducers, no magical reducer import */
  /* listenerMiddleware as XXX,no magical listener import */
  symbols,
} from './constants';
import createLogger from '@lpr/logger';
import isDevMode from '@lpr/is-dev-mode';

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
  reducer,
  reducers,
  slices = [],
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
  const allReducers = { ...reducers };
  const sliceListener = createListenerMiddleware();
  for (const { name, reducer, listeners } of [slices].flat(Infinity)) {
    logger('INFO', `adding slice '${name}'`);
    if (reducer) {
      if (name in allReducers) {
        logger('WARNING', `duplicate slice key: '${name}'`);
      }
      allReducers[name] = reducer;
      if (
        reducer.persistenceListeners &&
        reducer.persistenceListeners.length > 0
      ) {
        logger('INFO', `adding persistence for reducer '${name}'`);
        reducer.persistenceListeners.forEach(sliceListener.startListening);
      }
    }
    if (listeners) {
      logger('INFO', `adding listeners for '${name}'`);
      [listeners]
        .flat(Infinity)
        .filter(Boolean)
        .forEach(sliceListener.startListening);
    }
  }
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
    // passe a root reducer
    // TODO : mix reducer and allReducers
    reducer: reducer || allReducers, // { /*...rtkReducers no magic reducer import */ ...reducers }, // accept object slices
    middleware: (getDefaultMiddleware) => [
      loggerMiddleware,
      /* XXX.middleware,no magical listener import */
      sliceListener.middleware,
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
    logger('reducers', Object.keys({ /* ...rtkReducers */ ...reducers }));
    logger('preloadedState', Object.keys(preloadedState));
    //     for (const rtkKey in rtkReducers) {
    //       for (const key in reducers) {
    //         if (key === rtkKey) {
    //           logger('WARNING', `duplicate key: '${key}'`);
    //         }
    //       }
    //     }
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
