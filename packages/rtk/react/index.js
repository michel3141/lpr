// supprimé je pense que ça faisait un merdier avec les import reacts
// import { Provider, useDispatch, useSelector } from 'react-redux';
import { createElement, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { boot } from '../actions';
import createStore from '../lib/createStore';

import { useSyncExternalStore, createContext, useContext } from 'react';

import isDevMode from '@lpr/is-dev-mode';

// DEBUG initial-value => pour tracker les contexts importés plusieurs fois
const StoreContext = createContext('initial-value=' + Math.random());
const useStore = () => useContext(StoreContext);

const useDispatch = () => useStore()?.dispatch;
const useSelector = (selector) => {
  const { subscribe, getState } = useStore();

  return useSyncExternalStore(subscribe, () => selector(getState()));
};

let tabs = [];

const defaultConsoleLogger = (level, event, action) => {
  const { type, payload, error, meta } = action;
  if (event !== 'ACTION') {
    return;
  }
  if (level === 'DEBUG' && !isDevMode) {
    return;
  }

  let addTab = false;
  if (type) {
    const parts = type.split(/(\/)/);
    let lastColor = 'grey';
    let output = payload;
    if (parts.length >= 5) {
      if (parts[4] === 'begin') {
        lastColor = '';
        addTab = parts[2];
      }
      if (parts[4] === 'end') {
        lastColor = '';
        tabs = tabs.slice(0, -1);
      }
      if (parts[4] === 'pending') {
        lastColor = 'orange';
        output = meta.arg;
      }
      if (parts[4] === 'fulfilled') {
        lastColor = 'green';
        output = payload;
      }
      if (parts[4] === 'rejected') {
        lastColor = 'red';
        output = error.message;
      }
    }
    const colors = [
      '',
      'background-color: grey; color:black',
      '',
      'background-color: #98FB98; color:black',
      '',
      'color: white; background-color:' + lastColor,
    ].slice(0, parts.length + 1);
    parts.unshift(tabs.map((tab) => `[${tab}]`).join(''));
    if (output !== undefined) {
      console.info(parts.map((part) => `%c${part}`).join(''), ...colors, output);
    } else {
      console.info(parts.map((part) => `%c${part}`).join(''), ...colors);
    }
    if (addTab) {
      tabs.push(addTab);
    }
  }
};

export const createSelectorHooks = (selectors) => {
  const selections = {};
  for (const [name, selector] of Object.entries({ ...selectors })) {
    if (name.startsWith('select')) {
      const hookName = name.replace('select', 'use');
      /* eslint-disable react-hooks/rules-of-hooks */
      selections[hookName] = (...params) => useSelector((state) => selector(state, ...params));
      /* eslint-enable react-hooks/rules-of-hooks */
    }
  }
  return selections;
};

export const createActionsHook =
  (...actions_or_thunks) =>
  () => {
    const dispatch = useDispatch();
    return useMemo(
      () => bindActionCreators(Object.assign({}, ...actions_or_thunks), dispatch),
      [dispatch]
    );
  };

/*
 * note importante:
 * ce module ne peut pas exporter un provider mais *doit* exporter
 * une fonction qui crée le provider.
 * Cette méthode permet de booter *avant* la création du dom.
 * J'avais un problème avec firebase et react-native :
 * Avec le boot dans le react, fire était iniatialisé trop tard.
 */
function createReactStore({
  preloadedState,
  reducer,
  reducers,
  slices,
  middlewares,
  ignoredPaths,
  ignoredActions,
  ignoreActions,
  ignoredImmutables,
  serializableCheck,
  immutableCheck,
  rtkLogger,
  consoleLogger = defaultConsoleLogger,
  children,
  bootParams,
}) {
  const store = createStore({
    preloadedState,
    reducer,
    reducers,
    slices,
    middlewares,
    ignoredPaths,
    ignoredActions,
    ignoreActions,
    ignoredImmutables,
    serializableCheck,
    immutableCheck,
    rtkLogger,
    consoleLogger,
  });
  store.dispatch(boot(bootParams));
  return function RtkReactStoreProvider({ children }) {
    return createElement(StoreContext, { value: store }, children);
  };
}

export default createReactStore;
