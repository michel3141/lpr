import rtk from "../lib";
const { createEvents, createActions } = rtk("test-slice");

const TEST = {
  action_a: async ({ x, y }, $) => {
    console.log("async 1", $.dispatch, $.getState);
  },
  action_b:
    (dispatch, getState) =>
    async ({ x, y }) => {
      console.log("do something with", getState());
    },
};

const events = {
  event: ({ x: { a, b }, y }) => ({ a, b, y }),
};

const E = createEvents({
  ...events,
  ab: (x) => x,
  az: "toto",
  ty: null,
  wx: ({ x: { a, b }, y }) => ({ y, a, b }),
});

console.log(
  Object.keys(E),
  Object.values(E).map((x) => "" + x),
);

const A = createActions(TEST);
console.log(
  Object.keys(A),
  Object.values(A)
    .flatMap((x) => [x.pending, x.fulfilled, x.rejected])
    .filter(Boolean)
    .filter(Boolean)
    .map((x) => "" + x),
);
