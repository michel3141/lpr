import { createListenerMiddleware } from '@reduxjs/toolkit';
export const reducers = {};
export const symbols = {
  booted: false,
  listeners: new Set(),
  reducers: {},
  selectors: {},
  actions: {},
};
export const listenerMiddleware = createListenerMiddleware();
