import rtk, { _, no_ } from '@lpr/rtk';
import { name } from './constants';
import storage from './storage';
const { createActions, createThunks } = rtk(name);

const actions = createActions({
  updateItem: (item) => _({ item }),
  reset: no_,
});

const thunks = createThunks({
  init: (_, { dispatch }) => {
    const prefix = new RegExp(`^${name}:`);
    return storage
      .getAllKeys()
      .then(storage.multiGet)
      .then((items) =>
        items
          .filter(([key]) => key.match(prefix))
          .map(([key, value]) => [key.replace(prefix, ''), JSON.parse(value)])
      )
      .then((items) => {
        items.map(updateItem).forEach(dispatch);
        return items;
      })
      .then((items) => ({ items }));
  },
});

// RTK-AUTOEXPORT
// ---- actions ---------
export const { updateItem, reset } = actions;
// ---- thunks ---------
export const { init } = thunks;
