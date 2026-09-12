import rtk from "../lib";
console.log("RTK", Object.keys(rtk("slice-name")));
const { createActions, createSelectors, createSliceSelectors, addListener } = rtk("slice-name");
try {
  addListener();
} catch (e) {
  console.warn(e.message);
}
const actions = createActions({
  test: () => ({ payload: "coucou" }),
  multiple: {
    //    default: (payload) => ({ payload }),
    a: () => ({ payload: "a" }),
    b: () => ({ payload: "b" }),
    x: () => ({ payload: "WTF" }),
  },
});
console.log("ACTIONS", Object.keys(actions));
console.log(
  "ACTIONS",
  Object.values(actions).map((a) => a.toString()),
);

Object.entries(actions).forEach(([name, action]) => {
  try {
    console.log(name, action("test-payload"));
  } catch (e) {
    console.warn(name, e.message);
  }
});

const selectors = createSelectors({
  test: (state) => state.x,
  test2: (state) => state.x + state["slice-name"].x,
  test3: [(state) => state.x, (state) => state["slice-name"].x, (a, b) => a + b],
});
const localSelectors = createSliceSelectors({
  test: (state) => state.x,
});

const state = { x: 45, "slice-name": { x: 27 } };
console.log("SELECTORS___", selectors);
console.log("LOCAL__SEL__", localSelectors);
console.log("SELECT_TEST_", selectors.selectTest(state));
console.log("SELECT_TEST2", selectors.selectTest2(state));
console.log("SELECT_TEST3", selectors.selectTest3(state));
console.log("LOCAL__TEST_", localSelectors.selectTest(state));
