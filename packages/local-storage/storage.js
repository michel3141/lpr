/**
 * index.js
 * react-native-cross-platform-storage
 *
 * Created by Mike Grabowski on 12/12/16.
 * Copyright © 2016 Callstack.io. All rights reserved.
 *
 * @flow
 */

const AsyncStorage = {
  getItem: (key, cb) =>
    AsyncStorage.multiGet([key])
      .then((values) => values[0][1])
      .then((data) => {
        cb && cb(null, data);
        return data;
      })
      .catch((err) => {
        cb && cb(err, null);
        return err;
      }),
  setItem: (key, value, cb) =>
    AsyncStorage.multiSet([[key, value]])
      .then((data) => {
        cb && cb(null, data);
        return data;
      })
      .catch((err) => {
        cb && cb(err, null);
        return err;
      }),
  getAllKeys: (cb) =>
    Promise.resolve(Object.keys(window.localStorage))
      .then((data) => {
        cb && cb(null, data);
        return data;
      })
      .catch((err) => {
        cb && cb(err, null);
        return err;
      }),
  removeItem: (key, cb) =>
    AsyncStorage.multiRemove([key])
      .then(() => {
        cb && cb(null);
      })
      .catch((err) => {
        cb && cb(err, null);
      }),
  clear: () =>
    new Promise((resolve) => {
      window.localStorage.clear();
      resolve();
    }),
  multiGet: (keys) =>
    new Promise((resolve) => {
      const keyValues = keys.reduce(
        (acc, key) => acc.concat([[key, window.localStorage.getItem(key)]]),
        []
      );
      resolve(keyValues);
    }),
  multiSet: (kvPairs) =>
    new Promise((resolve, reject) => {
      const errors = [];

      kvPairs.forEach(([key, value]) => {
        try {
          window.localStorage.setItem(key, value);
        } catch (error) {
          errors.push(error);
        }
      });

      return errors.length > 0 ? reject(errors) : resolve();
    }),
  multiRemove: (keys) =>
    new Promise((resolve) => {
      keys.forEach((key) => window.localStorage.removeItem(key));
      resolve();
    }),
  flushGetRequests: () => {
    // eslint-disable-next-line
    console.warn('AsyncStorage.flushGetRequests: Not supported on `web`');
  },
};

const {
  getItem,
  setItem,
  removeItem,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
  clear,
} = AsyncStorage;

export {
  getItem,
  setItem,
  removeItem,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
  clear,
};

export default AsyncStorage;
