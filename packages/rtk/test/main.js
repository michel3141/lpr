import rtk from '../lib';
import { createActionsHook } from '../react';
const { createEvents, createActions } = rtk('test-slice');

const E = createEvents({
  ab: (x) => x,
  az: 'toto',
  ty: null,
  wx: ({ x: { a, b }, y }) => ({ y, a, b }),
});

console.log(
  Object.keys(E),
  Object.values(E).map((x) => '' + x)
);

const A = createActions({
  action_a: async ({ x, y }, $) => {
    console.log('async 1', $.dispatch, $.getState);
  },
  action_b:
    (dispatch, getState) =>
    async ({ x, y }) => {
      console.log('do something with', getState());
    },
});
console.log(
  Object.keys(A),
  Object.values(A)
    .flatMap((x) => [x.pending, x.fulfilled, x.rejected])
    .filter(Boolean)
    .filter(Boolean)
    .map((x) => '' + x)
);

// ---- createEvents ---------
export const { abEvent, azEvent, tyEvent, wxEvent } = E;

export const useE = createActionsHook(E);
// ---- createActions ---------
export const { actionA, actionB } = A;

export const useA = createActionsHook(A);
