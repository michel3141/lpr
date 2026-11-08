import { onBoot, addListener } from '@lpr/rtk';
import storage from './storage';
import { updateItem, init, reset } from './actions';
import { name } from './constants';
import { onStorageReady } from './persistence';
import createLogger from '@lpr/logger';
const logger = createLogger(__filename);
const DEBUG = true;

if (DEBUG) {
  onStorageReady(({ payload }) => {
    payload.items.forEach(([key, value]) => {
      logger(`${key} = actual ${value}`);
    });
  }, logger);
}

onBoot(({ payload }, { getState, dispatch }) => {
  dispatch(init());
}, logger);

addListener(
  updateItem,
  ({ payload }, { dispatch, getState }) => {
    const [key, value] = payload.item;
    storage.setItem(`${name}:${key}`, JSON.stringify(value));
  },
  logger
);

addListener(
  reset,
  ({ payload }, { dispatch, getState }) => {
    storage.getAllKeys().then(storage.multiRemove);
  },
  logger
);
